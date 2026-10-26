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
        self._actuals_df: Optional[pd.DataFrame] = None
        self._forecasts_df: Optional[pd.DataFrame] = None

    @property
    def actuals(self) -> pd.DataFrame:
        if self._actuals_df is None:
            if not self.actuals_path.exists():
                raise FileNotFoundError(
                    f"Actuals cache not found at {self.actuals_path}. Run ingest_bmrs.py first."
                )
            self._actuals_df = pd.read_parquet(self.actuals_path)
        return self._actuals_df

    @property
    def forecasts(self) -> pd.DataFrame:
        if self._forecasts_df is None:
            if not self.forecasts_path.exists():
                raise FileNotFoundError(
                    f"Forecasts cache not found at {self.forecasts_path}. Run ingest_bmrs.py first."
                )
            self._forecasts_df = pd.read_parquet(self.forecasts_path)
        return self._forecasts_df

    def reload(self) -> None:
        """Force reload datasets from disk."""
        self._actuals_df = None
        self._forecasts_df = None
        _ = self.actuals
        _ = self.forecasts


# Global singleton instance
data_store = DataStore()
