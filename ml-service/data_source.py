"""
Data source interface for Krushak Mandi Price Forecaster.
Reads DATA_SOURCE=synthetic|live from environment.
Supports synthetic parquet generation/loading, and provides a clear stub
for future live Agmarknet data.gov.in integration.
"""

import os
import pandas as pd
from typing import Optional

DATA_SOURCE_ENV = os.getenv("DATA_SOURCE", "synthetic").strip().lower()

DEFAULT_PARQUET_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "data", "prices.parquet"
)


def get_prices(
    crop: Optional[str] = None,
    market: Optional[str] = None,
    data_source: Optional[str] = None,
) -> pd.DataFrame:
    """
    Retrieve historical mandi prices based on DATA_SOURCE setting.

    Returns DataFrame with columns:
        date (datetime64[ns]), crop (str), market (str),
        min_price (float), max_price (float), modal_price (float), arrivals (float)
    """
    mode = (data_source or DATA_SOURCE_ENV).strip().lower()

    if mode == "live":
        # Live Agmarknet data API stub
        # TODO: Implement live Agmarknet data fetch via data.gov.in resource:
        # https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
        # Required query params: api-key, format=json, filters[state]=Maharashtra
        raise NotImplementedError(
            "Live Agmarknet data fetch via data.gov.in is not yet implemented. "
            "TODO: Implement Agmarknet API integration via https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070. "
            "Set DATA_SOURCE=synthetic to use the calibrated synthetic dataset."
        )

    # Synthetic data source
    parquet_path = os.getenv("PRICES_PARQUET_PATH", DEFAULT_PARQUET_PATH)
    if not os.path.exists(parquet_path):
        from scripts.generate_synthetic import generate_synthetic_data, save_dataset
        df_gen = generate_synthetic_data(days=730, seed=42)
        save_dataset(df_gen, parquet_path)

    df = pd.read_parquet(parquet_path)
    df["date"] = pd.to_datetime(df["date"])

    if crop:
        df = df[df["crop"].str.lower() == crop.lower()]
    if market:
        df = df[df["market"].str.lower() == market.lower()]

    return df.sort_values("date").reset_index(drop=True)


def get_active_data_source() -> str:
    """Returns the current active data source mode ('synthetic' or 'live')."""
    return DATA_SOURCE_ENV


def get_crops() -> list:
    """Returns list of supported crops."""
    return [
        "onion",
        "tomato",
        "potato",
        "wheat",
        "soybean",
        "cotton",
        "maize",
        "tur",
    ]


def get_markets() -> list:
    """Returns list of supported APMC markets."""
    return [
        "Lasalgaon",
        "Pune",
        "Nashik",
        "Nagpur",
        "Kolhapur",
        "Latur",
    ]
