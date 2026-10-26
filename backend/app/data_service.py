"""
Data loading and caching service for WindSight backend.

Reads validated Elexon BMRS January 2026 Parquet files:
- backend/data/actuals_fuelhh.parquet (1,488 half-hour settlement periods)
- backend/data/forecasts_windfor.parquet (~18,100 forecast publications)
"""

from pathlib import Path
from typing import Optional
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ACTUALS_PATH = DATA_DIR / "actuals_fuelhh.parquet"
FORECASTS_PATH = DATA_DIR / "forecasts_windfor.parquet"


class DataStore:
    def __init__(self, data_dir: Path = DATA_DIR) -> None:
        self.data_dir = data_dir
        self.actuals_path = data_dir / "actuals_fuelhh.parquet"
        self.forecasts_path = data_dir / "forecasts_windfor.parquet"
        self._all_actuals_df: Optional[pd.DataFrame] = None
        self._all_forecasts_df: Optional[pd.DataFrame] = None

    @property
    def all_actuals(self) -> pd.DataFrame:
        """Full actuals dataset including February 1 delivery (1,536 settlement periods)."""
        if self._all_actuals_df is None:
            if not self.actuals_path.exists():
                raise FileNotFoundError(
                    f"Actuals cache not found at {self.actuals_path}. Run ingest_bmrs.py first."
                )
            self._all_actuals_df = pd.read_parquet(self.actuals_path)
        return self._all_actuals_df

    @property
    def all_forecasts(self) -> pd.DataFrame:
        """Full forecast dataset including February 1 delivery (18,688 publications)."""
        if self._all_forecasts_df is None:
            if not self.forecasts_path.exists():
                raise FileNotFoundError(
                    f"Forecasts cache not found at {self.forecasts_path}. Run ingest_bmrs.py first."
                )
            self._all_forecasts_df = pd.read_parquet(self.forecasts_path)
        return self._all_forecasts_df

    @property
    def actuals(self) -> pd.DataFrame:
        """January 2026 delivery actuals (1,488 settlement periods)."""
        df = self.all_actuals
        return df[df["startTime"] <= "2026-01-31T23:30:00Z"].copy()

    @property
    def forecasts(self) -> pd.DataFrame:
        """January 2026 delivery forecasts (18,104 publications)."""
        df = self.all_forecasts
        return df[df["startTime"] <= "2026-01-31T23:30:00Z"].copy()

    def reload(self) -> None:
        """Force reload datasets from disk."""
        self._all_actuals_df = None
        self._all_forecasts_df = None
        _ = self.all_actuals
        _ = self.all_forecasts


# Global singleton instance
data_store = DataStore()
