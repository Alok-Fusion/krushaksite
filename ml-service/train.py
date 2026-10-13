"""
Model Training & Evaluation Script for Krushak Mandi Forecaster.
Trains per crop & market LightGBM regressors using lag features, rolling statistics,
and calendar indicators. Evaluates against Naive Last-Value and 7-day Moving Average baselines
on a strict time-based validation split. Writes metrics.json with data_source: "synthetic".
"""

import os
import json
import pickle
from datetime import datetime
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor

from data_source import get_prices, get_crops, get_markets

FEATURE_COLS = [
    "lag_1",
    "lag_7",
    "lag_14",
    "lag_30",
    "rolling_mean_7",
    "rolling_mean_14",
    "rolling_mean_30",
    "month",
    "day_of_week",
    "day_of_year",
]


def build_features(df_series: pd.DataFrame) -> pd.DataFrame:
    """
    Build lag and rolling features for a single crop-market time series.
    Input must be sorted by date.
    """
    df = df_series.copy().sort_values("date").reset_index(drop=True)
    modal = df["modal_price"]

    # Lag features
    df["lag_1"] = modal.shift(1)
    df["lag_7"] = modal.shift(7)
    df["lag_14"] = modal.shift(14)
    df["lag_30"] = modal.shift(30)

    # Rolling averages based strictly on past information (shift 1 before rolling)
    shifted = modal.shift(1)
    df["rolling_mean_7"] = shifted.rolling(window=7, min_periods=7).mean()
    df["rolling_mean_14"] = shifted.rolling(window=14, min_periods=14).mean()
    df["rolling_mean_30"] = shifted.rolling(window=30, min_periods=30).mean()

    # Calendar features
    df["month"] = df["date"].dt.month
    df["day_of_week"] = df["date"].dt.dayofweek
    df["day_of_year"] = df["date"].dt.dayofyear

    # Drop rows with NaN from initial lags
    df = df.dropna().reset_index(drop=True)
    return df


def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    """Compute MAE, RMSE, and MAPE metrics."""
    errors = y_true - y_pred
    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    # Avoid zero division
    valid_mask = y_true > 0
    mape = float(np.mean(np.abs(errors[valid_mask] / y_true[valid_mask])) * 100.0)
    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2),
    }


def train_and_evaluate(val_days: int = 60) -> dict:
    """
    Trains models for all crop x market combinations and writes metrics.json.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    df_all = get_prices()
    crops = get_crops()
    markets = get_markets()

    per_series_metrics = {}
    all_y_true = []
    all_pred_lgb = []
    all_pred_naive = []
    all_pred_ma7 = []

    models_bundle = {}

    for crop in crops:
        for market in markets:
            series_key = f"{crop}_{market}"
            df_series = df_all[
                (df_all["crop"].str.lower() == crop.lower()) &
                (df_all["market"].str.lower() == market.lower())
            ].copy()

            if len(df_series) < 90:
                continue

            df_feat = build_features(df_series)
            if len(df_feat) <= val_days:
                continue

            # Strict time-based train/validation split
            train_df = df_feat.iloc[:-val_days].copy()
            val_df = df_feat.iloc[-val_days:].copy()

            X_train = train_df[FEATURE_COLS]
            y_train = train_df["modal_price"]
            X_val = val_df[FEATURE_COLS]
            y_val = val_df["modal_price"].values

            # Baselines on validation set
            pred_naive = val_df["lag_1"].values
            pred_ma7 = val_df["rolling_mean_7"].values

            # LightGBM Regressor
            model = LGBMRegressor(
                n_estimators=120,
                learning_rate=0.04,
                max_depth=5,
                num_leaves=24,
                subsample=0.85,
                colsample_bytree=0.85,
                random_state=42,
                verbose=-1,
            )
            model.fit(X_train, y_train)

            pred_lgb = model.predict(X_val)

            # Evaluate series
            m_lgb = calculate_metrics(y_val, pred_lgb)
            m_naive = calculate_metrics(y_val, pred_naive)
            m_ma7 = calculate_metrics(y_val, pred_ma7)

            residuals = y_val - pred_lgb
            residual_std = float(np.std(residuals))

            per_series_metrics[series_key] = {
                "crop": crop,
                "market": market,
                "validation_samples": len(val_df),
                "lightgbm": m_lgb,
                "naive_last_value": m_naive,
                "moving_average_7d": m_ma7,
                "residual_std": round(residual_std, 2),
                "beats_naive": m_lgb["mae"] <= m_naive["mae"],
                "beats_ma7": m_lgb["mae"] <= m_ma7["mae"],
            }

            models_bundle[series_key] = {
                "model": model,
                "residual_std": residual_std,
                "last_history": df_series.tail(60).to_dict(orient="records"),
            }

            all_y_true.extend(y_val)
            all_pred_lgb.extend(pred_lgb)
            all_pred_naive.extend(pred_naive)
            all_pred_ma7.extend(pred_ma7)

    # Save trained models bundle
    bundle_path = os.path.join(models_dir, "models_bundle.pkl")
    with open(bundle_path, "wb") as f:
        pickle.dump(models_bundle, f)
    print(f"Saved {len(models_bundle)} trained models to {bundle_path}")

    # Compute overall metrics
    overall_true = np.array(all_y_true)
    overall_lgb = calculate_metrics(overall_true, np.array(all_pred_lgb))
    overall_naive = calculate_metrics(overall_true, np.array(all_pred_naive))
    overall_ma7 = calculate_metrics(overall_true, np.array(all_pred_ma7))

    metrics_payload = {
        "data_source": "synthetic",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "evaluation_notes": (
            "Evaluated on a time-based validation holdout (last 60 days of each series). "
            "Data is synthetic, calibrated to Maharashtra APMC market dynamics. "
            "These metrics represent synthetic simulation accuracy, not real-world performance."
        ),
        "split_strategy": f"Time-based holdout (last {val_days} days)",
        "crops_count": len(crops),
        "markets_count": len(markets),
        "total_validation_points": len(overall_true),
        "overall": {
            "lightgbm": overall_lgb,
            "naive_last_value": overall_naive,
            "moving_average_7d": overall_ma7,
            "beats_naive_baseline": overall_lgb["mae"] <= overall_naive["mae"],
            "beats_ma7_baseline": overall_lgb["mae"] <= overall_ma7["mae"],
        },
        "per_series": per_series_metrics,
    }

    metrics_path = os.path.join(script_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print("\n--- Model Training & Baseline Comparison Completed ---")
    print(f"Overall LightGBM:        MAE = Rs {overall_lgb['mae']}, MAPE = {overall_lgb['mape']}%")
    print(f"Overall Naive (t-1):     MAE = Rs {overall_naive['mae']}, MAPE = {overall_naive['mape']}%")
    print(f"Overall 7-Day Moving Avg: MAE = Rs {overall_ma7['mae']}, MAPE = {overall_ma7['mape']}%")
    print(f"Metrics written to: {metrics_path}\n")

    return metrics_payload


if __name__ == "__main__":
    train_and_evaluate(val_days=60)
