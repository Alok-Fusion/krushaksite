"""
Synthetic Mandi Price Generator for Krushak
Produces 2 years of daily mandi prices across 8 major Maharashtra crops and 6 APMC mandis.
Incorporates yearly seasonality, harvest dips, lean-season spikes, trend, supply shocks,
and inversely correlated arrivals. Seeded for 100% reproducibility.
"""

import os
import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

CROPS = [
    "onion",
    "tomato",
    "potato",
    "wheat",
    "soybean",
    "cotton",
    "maize",
    "tur",
]

MARKETS = [
    "Lasalgaon",
    "Pune",
    "Nashik",
    "Nagpur",
    "Kolhapur",
    "Latur",
]

# Base price (Rs / quintal), volatility, and seasonality profiles
CROP_PROFILES = {
    "onion": {
        "base_price": 2100.0,
        "base_arrivals": 3500.0,
        "volatility": 0.22,
        # Harvest in Jan-Feb (day ~30) and April-May (day ~120), lean in Aug-Oct (day ~260)
        "seasonal_phase": 0.6,
        "seasonal_amp": 0.35,
        "secondary_amp": 0.15,
        "secondary_freq": 2.0,
    },
    "tomato": {
        "base_price": 2300.0,
        "base_arrivals": 2200.0,
        "volatility": 0.28,
        # Multiple crop flushes per year (~3 cycles)
        "seasonal_phase": 1.2,
        "seasonal_amp": 0.40,
        "secondary_amp": 0.25,
        "secondary_freq": 3.0,
    },
    "potato": {
        "base_price": 1750.0,
        "base_arrivals": 2800.0,
        "volatility": 0.12,
        # Harvest in Jan-Mar, buffered by cold storage
        "seasonal_phase": 0.2,
        "seasonal_amp": 0.18,
        "secondary_amp": 0.05,
        "secondary_freq": 1.0,
    },
    "wheat": {
        "base_price": 2450.0,
        "base_arrivals": 1800.0,
        "volatility": 0.09,
        # Rabi harvest in March-April, steady rise towards winter
        "seasonal_phase": -0.4,
        "seasonal_amp": 0.14,
        "secondary_amp": 0.04,
        "secondary_freq": 1.0,
    },
    "soybean": {
        "base_price": 4900.0,
        "base_arrivals": 3200.0,
        "volatility": 0.14,
        # Kharif harvest in Oct-Dec, peaks in monsoon June-Aug
        "seasonal_phase": 2.3,
        "seasonal_amp": 0.20,
        "secondary_amp": 0.08,
        "secondary_freq": 1.0,
    },
    "cotton": {
        "base_price": 6800.0,
        "base_arrivals": 1500.0,
        "volatility": 0.13,
        # Pickings in Oct-Feb, lean in summer-monsoon
        "seasonal_phase": 2.1,
        "seasonal_amp": 0.18,
        "secondary_amp": 0.06,
        "secondary_freq": 1.0,
    },
    "maize": {
        "base_price": 2150.0,
        "base_arrivals": 2000.0,
        "volatility": 0.11,
        # Kharif and Rabi arrivals
        "seasonal_phase": 1.8,
        "seasonal_amp": 0.15,
        "secondary_amp": 0.10,
        "secondary_freq": 2.0,
    },
    "tur": {
        "base_price": 7600.0,
        "base_arrivals": 1400.0,
        "volatility": 0.15,
        # Harvest in Jan-Feb, lean in July-Oct
        "seasonal_phase": 0.8,
        "seasonal_amp": 0.22,
        "secondary_amp": 0.07,
        "secondary_freq": 1.0,
    },
}

# Market price & arrival multipliers
MARKET_PROFILES = {
    "Lasalgaon": {"price_mult": 0.96, "arr_mult": 1.40, "specialty": "onion"},
    "Pune": {"price_mult": 1.05, "arr_mult": 1.25, "specialty": None},
    "Nashik": {"price_mult": 0.98, "arr_mult": 1.15, "specialty": "tomato"},
    "Nagpur": {"price_mult": 1.02, "arr_mult": 0.95, "specialty": "cotton"},
    "Kolhapur": {"price_mult": 1.03, "arr_mult": 0.90, "specialty": None},
    "Latur": {"price_mult": 0.99, "arr_mult": 1.30, "specialty": "soybean"},
}


def generate_synthetic_data(days: int = 730, seed: int = 42) -> pd.DataFrame:
    """
    Generate daily mandi records for 8 crops across 6 markets for `days` days.
    """
    rng = np.random.default_rng(seed)
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days - 1)
    date_range = pd.date_range(start=start_date, end=end_date, freq="D")

    records = []

    for crop in CROPS:
        crop_cfg = CROP_PROFILES[crop]
        base_price = crop_cfg["base_price"]
        base_arr = crop_cfg["base_arrivals"]
        volatility = crop_cfg["volatility"]
        phase = crop_cfg["seasonal_phase"]
        amp1 = crop_cfg["seasonal_amp"]
        amp2 = crop_cfg["secondary_amp"]
        freq2 = crop_cfg["secondary_freq"]

        for market in MARKETS:
            mkt_cfg = MARKET_PROFILES[market]
            p_mult = mkt_cfg["price_mult"]
            a_mult = mkt_cfg["arr_mult"]
            if mkt_cfg["specialty"] == crop:
                a_mult *= 1.35
                p_mult *= 0.98

            # Seed specific series walk
            series_seed = seed + abs(hash(f"{crop}_{market}")) % 100000
            series_rng = np.random.default_rng(series_seed)

            # Random walk state
            log_price_state = math.log(base_price * p_mult)

            # Generate series
            for step_idx, dt in enumerate(date_range):
                day_of_year = dt.timetuple().tm_yday
                day_of_week = dt.weekday() # 0 = Monday, 6 = Sunday

                # 1. Yearly seasonality (angular freq)
                theta = (2.0 * math.pi * day_of_year) / 365.25
                seasonal_effect = (
                    amp1 * math.sin(theta + phase) +
                    amp2 * math.sin(freq2 * theta + phase * 0.5)
                )

                # 2. Annual inflation trend (~4.5% per annum)
                trend_effect = 0.045 * (step_idx / 365.25)

                # 3. Weekly seasonality (lower trading on Sundays / weekends)
                weekday_factor = 0.0
                arr_weekday_factor = 1.0
                if day_of_week == 6:  # Sunday APMC closure/skeleton trading
                    weekday_factor = -0.02
                    arr_weekday_factor = 0.25
                elif day_of_week == 5:  # Saturday
                    weekday_factor = 0.01
                    arr_weekday_factor = 0.85
                elif day_of_week == 0:  # Monday rush
                    weekday_factor = 0.015
                    arr_weekday_factor = 1.20

                # 4. Supply shocks (e.g. unseasonal rain, pest, transit blockage)
                shock = 0.0
                arr_shock = 1.0
                if series_rng.random() < 0.012:  # ~1.2% chance per day
                    shock_magnitude = series_rng.uniform(0.12, 0.28)
                    shock_sign = 1.0 if series_rng.random() < 0.8 else -1.0
                    shock = shock_sign * shock_magnitude
                    # When price surges due to shock, arrivals crash
                    arr_shock = max(0.3, 1.0 - shock * 1.5)

                # 5. Mean-reverting random walk with drift
                noise = series_rng.normal(0, volatility / math.sqrt(252))
                target_log = math.log(base_price * p_mult * (1.0 + seasonal_effect + trend_effect))
                reversion_speed = 0.06
                log_price_state += reversion_speed * (target_log - log_price_state) + noise + weekday_factor + shock

                modal_price = math.exp(log_price_state)
                # Ensure reasonable bounds
                min_acceptable = base_price * 0.35
                max_acceptable = base_price * 2.8
                modal_price = max(min_acceptable, min(max_acceptable, modal_price))

                # Negative correlation with arrivals:
                # Higher price -> Lower arrivals; Lower price -> Higher arrivals
                price_ratio = modal_price / (base_price * p_mult)
                arr_elasticity = -1.2
                arr_factor = (price_ratio ** arr_elasticity) * arr_weekday_factor * arr_shock
                arr_noise = series_rng.normal(1.0, 0.12)
                arrivals = max(20.0, base_arr * a_mult * arr_factor * arr_noise)

                # Min and Max price bands around modal price (e.g. quality spreads)
                spread_down = series_rng.uniform(0.04, 0.12)
                spread_up = series_rng.uniform(0.04, 0.14)
                min_price = round(modal_price * (1.0 - spread_down), 2)
                max_price = round(modal_price * (1.0 + spread_up), 2)
                modal_price = round(modal_price, 2)
                arrivals = round(arrivals, 1)

                records.append({
                    "date": dt.strftime("%Y-%m-%d"),
                    "crop": crop,
                    "market": market,
                    "min_price": min_price,
                    "max_price": max_price,
                    "modal_price": modal_price,
                    "arrivals": arrivals,
                })

    df = pd.DataFrame(records)

    # Cleaning: enforce sorted dates, ensure modal_price within [min_price, max_price]
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(["crop", "market", "date"]).reset_index(drop=True)
    df["min_price"] = df[["min_price", "modal_price"]].min(axis=1)
    df["max_price"] = df[["max_price", "modal_price"]].max(axis=1)

    return df


def save_dataset(df: pd.DataFrame, output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_parquet(output_path, index=False)
    print(f"Generated {len(df)} records across {df['crop'].nunique()} crops and {df['market'].nunique()} markets.")
    print(f"Saved to: {output_path}")


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    parquet_path = os.path.join(project_root, "data", "prices.parquet")
    df_synthetic = generate_synthetic_data(days=730, seed=42)
    save_dataset(df_synthetic, parquet_path)
