import os
import sys
import pytest
import pandas as pd
import numpy as np

# Ensure ml-service root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from scripts.generate_synthetic import (
    generate_synthetic_data,
    CROPS,
    MARKETS,
)
from train import build_features, FEATURE_COLS
from data_source import get_prices
from main import app

client = TestClient(app)


def test_synthetic_generator_schema():
    """Verify columns, types, and constraints of synthetic mandi data."""
    df = generate_synthetic_data(days=60, seed=123)
    expected_cols = {
        "date",
        "crop",
        "market",
        "min_price",
        "max_price",
        "modal_price",
        "arrivals",
    }
    assert expected_cols.issubset(set(df.columns))
    assert len(df) == 60 * len(CROPS) * len(MARKETS)

    # Unit & range consistency: min_price <= modal_price <= max_price
    assert (df["min_price"] <= df["modal_price"]).all()
    assert (df["modal_price"] <= df["max_price"]).all()
    assert (df["modal_price"] > 0).all()
    assert (df["arrivals"] > 0).all()

    # All crops and markets covered
    assert set(df["crop"].unique()) == set(CROPS)
    assert set(df["market"].unique()) == set(MARKETS)


def test_synthetic_seed_reproducibility():
    """Ensure identical RNG seed produces bit-for-bit identical datasets."""
    df1 = generate_synthetic_data(days=30, seed=999)
    df2 = generate_synthetic_data(days=30, seed=999)
    pd.testing.assert_frame_equal(df1, df2)


def test_feature_engineering_pipeline():
    """Verify feature builder computes lags and rolling windows accurately."""
    df = generate_synthetic_data(days=120, seed=42)
    single_series = df[(df["crop"] == "onion") & (df["market"] == "Lasalgaon")].copy()
    features_df = build_features(single_series)

    # Required feature columns must all exist
    for col in FEATURE_COLS:
        assert col in features_df.columns

    # No NaN values allowed in engineered dataset
    assert not features_df[FEATURE_COLS].isna().any().any()

    # Lag 1 must equal the previous day's modal price
    expected_lag1 = single_series.iloc[29]["modal_price"]
    assert features_df.iloc[0]["lag_1"] == expected_lag1


def test_health_endpoint():
    """Verify /health endpoint returns active data source."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "krushak-mandi-forecaster"
    assert "data_source" in data


def test_crops_and_markets_endpoints():
    """Verify /crops and /markets endpoints list all available items."""
    res_crops = client.get("/crops")
    assert res_crops.status_code == 200
    assert "crops" in res_crops.json()
    assert len(res_crops.json()["crops"]) == 8

    res_markets = client.get("/markets")
    assert res_markets.status_code == 200
    assert "markets" in res_markets.json()
    assert len(res_markets.json()["markets"]) == 6


def test_forecast_endpoint_valid_7_and_30_days():
    """Test 7-day and 30-day forecast queries."""
    for days in [7, 30]:
        response = client.get(f"/forecast?crop=onion&market=Lasalgaon&days={days}")
        assert response.status_code == 200
        payload = response.json()

        assert payload["crop"] == "onion"
        assert payload["market"] == "Lasalgaon"
        assert payload["days"] == days
        assert payload["data_source"] == "synthetic"
        assert payload["latest_price"] > 0
        assert len(payload["forecast"]) == days
        assert len(payload["history"]) > 0
        assert "plain_language_hint" in payload
        assert isinstance(payload["trend_pct"], (int, float))

        # Validate forecast items and confidence interval bounds
        for item in payload["forecast"]:
            assert "date" in item
            assert item["lower_bound"] <= item["predicted_price"] <= item["upper_bound"]


def test_forecast_endpoint_invalid_inputs():
    """Verify input validation handles unknown crops, markets, or invalid days."""
    # Unknown crop
    res_bad_crop = client.get("/forecast?crop=mango&market=Pune&days=7")
    assert res_bad_crop.status_code == 400

    # Unknown market
    res_bad_market = client.get("/forecast?crop=onion&market=London&days=7")
    assert res_bad_market.status_code == 400

    # Invalid days (only 7 or 30 allowed)
    res_bad_days = client.get("/forecast?crop=onion&market=Pune&days=15")
    assert res_bad_days.status_code == 400


def test_live_data_source_stub():
    """Verify that requesting DATA_SOURCE=live raises NotImplementedError with Agmarknet TODO."""
    with pytest.raises(NotImplementedError) as exc_info:
        get_prices(crop="onion", market="Pune", data_source="live")
    assert "Agmarknet" in str(exc_info.value)
