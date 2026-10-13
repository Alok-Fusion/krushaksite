"""
FastAPI Mandi Price Forecasting Service for Krushak.
Provides endpoints for crops, markets, health status, and multi-day price forecasting
with confidence bands and plain-language agricultural decision hints.
"""

import os
import math
import pickle
from datetime import datetime, timedelta
from typing import Optional, List
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data_source import (
    get_prices,
    get_crops,
    get_markets,
    get_active_data_source,
    DATA_SOURCE_ENV,
)
from train import FEATURE_COLS

app = FastAPI(
    title="Krushak Mandi Price Forecaster",
    version="1.0.0",
    description="Time-series mandi forecasting service for Maharashtra agricultural APMCs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_BUNDLE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "models", "models_bundle.pkl"
)

# In-memory cache of loaded models
_loaded_models = None


def load_models_bundle():
    global _loaded_models
    if _loaded_models is not None:
        return _loaded_models

    if os.path.exists(MODELS_BUNDLE_PATH):
        try:
            with open(MODELS_BUNDLE_PATH, "rb") as f:
                _loaded_models = pickle.load(f)
                return _loaded_models
        except Exception as e:
            print(f"Error loading models bundle: {e}")

    # If models do not exist yet, train them on the fly
    from train import train_and_evaluate
    print("Training models on startup...")
    train_and_evaluate()
    if os.path.exists(MODELS_BUNDLE_PATH):
        with open(MODELS_BUNDLE_PATH, "rb") as f:
            _loaded_models = pickle.load(f)
            return _loaded_models
    return {}


class HealthResponse(BaseModel):
    status: str
    service: str
    data_source: str
    timestamp: str


class HistoryItem(BaseModel):
    date: str
    modal_price: float
    min_price: float
    max_price: float
    arrivals: float


class ForecastItem(BaseModel):
    date: str
    predicted_price: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    crop: str
    market: str
    days: int
    data_source: str
    latest_price: float
    latest_date: str
    trend_pct: float
    plain_language_hint: str
    forecast: List[ForecastItem]
    history: List[HistoryItem]


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint indicating active data source and service state."""
    return {
        "status": "ok",
        "service": "krushak-mandi-forecaster",
        "data_source": get_active_data_source(),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/crops")
def list_crops():
    """Return all supported crops."""
    return {"crops": get_crops()}


@app.get("/markets")
def list_markets():
    """Return all supported Maharashtra APMC markets."""
    return {"markets": get_markets()}


@app.get("/forecast", response_model=ForecastResponse)
def get_forecast(
    crop: str = Query(..., description="Crop name (e.g., onion, tomato, wheat)"),
    market: str = Query(..., description="APMC Market name (e.g., Lasalgaon, Pune)"),
    days: int = Query(7, description="Forecast horizon in days (7 or 30)"),
):
    """
    Generate 7-day or 30-day mandi price forecast with history and 95% confidence bounds.
    """
    crop_clean = crop.strip().lower()
    crops_available = [c.lower() for c in get_crops()]
    if crop_clean not in crops_available:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported crop '{crop}'. Available: {get_crops()}",
        )

    markets_available = [m.lower() for m in get_markets()]
    matched_market = next((m for m in get_markets() if m.lower() == market.strip().lower()), None)
    if not matched_market:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported market '{market}'. Available: {get_markets()}",
        )

    if days not in [7, 30]:
        raise HTTPException(
            status_code=400,
            detail="Parameter 'days' must be 7 or 30.",
        )

    # Fetch history
    try:
        df_all = get_prices(crop=crop_clean, market=matched_market)
    except NotImplementedError as nie:
        raise HTTPException(status_code=501, detail=str(nie))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load prices: {str(e)}")

    if df_all.empty or len(df_all) < 30:
        raise HTTPException(
            status_code=404,
            detail=f"Insufficient historical data for {crop_clean} in {matched_market}",
        )

    # Last 90 days of history for frontend visualization
    df_history = df_all.tail(90).copy()
    latest_row = df_all.iloc[-1]
    latest_price = float(latest_row["modal_price"])
    latest_date = pd.to_datetime(latest_row["date"]).date()

    history_list = []
    for _, row in df_history.iterrows():
        history_list.append(
            HistoryItem(
                date=pd.to_datetime(row["date"]).strftime("%Y-%m-%d"),
                modal_price=float(row["modal_price"]),
                min_price=float(row["min_price"]),
                max_price=float(row["max_price"]),
                arrivals=float(row["arrivals"]),
            )
        )

    # Load model
    bundle = load_models_bundle()
    series_key = f"{crop_clean}_{matched_market}"
    model_entry = bundle.get(series_key)

    residual_std = model_entry.get("residual_std", latest_price * 0.05) if model_entry else latest_price * 0.05
    model = model_entry["model"] if model_entry else None

    # Autoregressive multi-step prediction
    recent_series = df_all["modal_price"].tolist()
    forecast_list = []
    curr_date = latest_date

    for step in range(1, days + 1):
        curr_date = curr_date + timedelta(days=1)
        step_day_of_week = curr_date.weekday()
        step_month = curr_date.month
        step_day_of_year = curr_date.timetuple().tm_yday

        # Build feature vector using existing sequence
        lag_1 = recent_series[-1]
        lag_7 = recent_series[-7] if len(recent_series) >= 7 else recent_series[-1]
        lag_14 = recent_series[-14] if len(recent_series) >= 14 else recent_series[-1]
        lag_30 = recent_series[-30] if len(recent_series) >= 30 else recent_series[-1]

        rm_7 = float(sum(recent_series[-7:]) / 7.0)
        rm_14 = float(sum(recent_series[-14:]) / 14.0) if len(recent_series) >= 14 else rm_7
        rm_30 = float(sum(recent_series[-30:]) / 30.0) if len(recent_series) >= 30 else rm_14

        feat_vector = [[
            lag_1,
            lag_7,
            lag_14,
            lag_30,
            rm_7,
            rm_14,
            rm_30,
            step_month,
            step_day_of_week,
            step_day_of_year,
        ]]

        if model is not None:
            pred_price = float(model.predict(feat_vector)[0])
        else:
            # Fallback to rolling average
            pred_price = rm_7

        # Enforce bounds consistency
        pred_price = max(100.0, round(pred_price, 2))
        recent_series.append(pred_price)

        # 95% Confidence interval expanding over time
        uncertainty = residual_std * math.sqrt(1.0 + 0.12 * (step - 1))
        lower_bound = max(100.0, round(pred_price - 1.96 * uncertainty, 2))
        upper_bound = round(pred_price + 1.96 * uncertainty, 2)

        forecast_list.append(
            ForecastItem(
                date=curr_date.strftime("%Y-%m-%d"),
                predicted_price=pred_price,
                lower_bound=lower_bound,
                upper_bound=upper_bound,
            )
        )

    # Derive trend percentage and agricultural decision hint
    end_price = forecast_list[-1].predicted_price
    trend_pct = round(((end_price - latest_price) / latest_price) * 100.0, 1)

    if trend_pct >= 3.0:
        hint = (
            f"Prices are expected to rise about {abs(trend_pct)}% over the next {days} days. "
            "Consider holding produce if storage is available to realize better mandi rates."
        )
    elif trend_pct <= -3.0:
        hint = (
            f"Prices are expected to decline about {abs(trend_pct)}% over the next {days} days. "
            "Selling sooner is advised to mitigate potential arrival-driven price drops."
        )
    else:
        hint = (
            f"Prices are projected to remain relatively stable (within {abs(trend_pct)}%) over the next {days} days. "
            "Plan harvest and transport based on your immediate farm liquidity requirements."
        )

    return ForecastResponse(
        crop=crop_clean,
        market=matched_market,
        days=days,
        data_source=get_active_data_source(),
        latest_price=latest_price,
        latest_date=latest_date.strftime("%Y-%m-%d"),
        trend_pct=trend_pct,
        plain_language_hint=hint,
        forecast=forecast_list,
        history=history_list,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
