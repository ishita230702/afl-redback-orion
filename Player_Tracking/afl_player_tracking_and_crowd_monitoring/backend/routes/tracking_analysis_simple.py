from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from scipy.ndimage import gaussian_filter
import io
import os
import math
import uuid
from typing import Dict

router = APIRouter()

# Directory to save heatmaps
HEATMAP_DIR = "heatmap_outputs"
os.makedirs(HEATMAP_DIR, exist_ok=True)


class PlayerTrackingData:
    def __init__(self, csv_data: str):
        """Initialize with CSV data string"""
        self.df = pd.read_csv(io.StringIO(csv_data))
        self._process_data()

    def _process_data(self):
        """Validate and preprocess tracking data"""
        required_columns = [
            "frame_id", "player_id", "timestamp_s",
            "x1", "y1", "x2", "y2", "cx", "cy", "w", "h", "confidence"
        ]
        missing = [col for col in required_columns if col not in self.df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")

        self.df = self.df.sort_values(["frame_id", "timestamp_s", "player_id"])

        # Compute center if missing
        if "cx" not in self.df.columns or "cy" not in self.df.columns:
            self.df["cx"] = (self.df["x1"] + self.df["x2"]) / 2
            self.df["cy"] = (self.df["y1"] + self.df["y2"]) / 2

    def get_player_stats(self) -> Dict:
        """Calculate statistics for each player"""
        stats = {}
        for pid in self.df["player_id"].unique():
            player = self.df[self.df["player_id"] == pid].copy().sort_values(["frame_id", "timestamp_s"])
            frame_count = len(player)
            total_time = float(player["timestamp_s"].max() - player["timestamp_s"].min())

            # Distance & speed calculations
            distances, speeds = [], []
            for i in range(1, len(player)):
                prev = (player.iloc[i - 1]["cx"], player.iloc[i - 1]["cy"])
                curr = (player.iloc[i]["cx"], player.iloc[i]["cy"])
                dist = float(math.sqrt((curr[0] - prev[0])**2 + (curr[1] - prev[1])**2))
                distances.append(dist)
                t_diff = float(player.iloc[i]["timestamp_s"] - player.iloc[i - 1]["timestamp_s"])
                if t_diff > 0:
                    speeds.append(dist / t_diff)

            stats[int(pid)] = {
                "frame_count": frame_count,
                "total_time": total_time,
                "total_distance_pixels": float(sum(distances)) if distances else 0.0,
                "average_speed_pixels_per_sec": float(np.mean(speeds)) if speeds else 0.0,
                "max_speed_pixels_per_sec": float(max(speeds)) if speeds else 0.0,
                "participation_score": float(frame_count / self.df["frame_id"].max()) if self.df["frame_id"].max() > 0 else 0.0,
                "confidence_avg": float(player["confidence"].mean()),
                "confidence_min": float(player["confidence"].min()),
                "confidence_max": float(player["confidence"].max()),
            }
        return stats

    def get_player_movement(self, player_id: int):
        """Return movement path for a given player"""
        player = self.df[self.df["player_id"] == player_id].copy().sort_values(["frame_id", "timestamp_s"])
        if len(player) == 0:
            raise ValueError(f"No data for player {player_id}")

        return {
            "player_id": int(player_id),
            "total_frames": len(player),
            "path_data": [
                {
                    "frame_id": int(r["frame_id"]),
                    "timestamp": float(r["timestamp_s"]),
                    "x": int(r["cx"]),
                    "y": int(r["cy"]),
                    "confidence": float(r["confidence"]),
                }
                for _, r in player.iterrows()
            ]
        }

    def generate_heatmap(self, player_id: int,
                         field_length: float = 165, field_width: float = 135,
                         nx: int = 200, ny: int = 150, sigma: float = 2.0) -> str:
        """Generate and save heatmap image for one player"""
        player = self.df[self.df["player_id"] == player_id]
        if len(player) == 0:
            raise ValueError(f"No data for player {player_id}")

        # Create heatmap grid
        heatmap = np.zeros((ny, nx))
        x_bins = np.linspace(0, field_length, nx)
        y_bins = np.linspace(0, field_width, ny)

        for _, row in player.iterrows():
            x_scaled = (row["cx"] - self.df["cx"].min()) / (self.df["cx"].max() - self.df["cx"].min()) * field_length
            y_scaled = (row["cy"] - self.df["cy"].min()) / (self.df["cy"].max() - self.df["cy"].min()) * field_width
            x_idx, y_idx = int(np.digitize(x_scaled, x_bins)) - 1, int(np.digitize(y_scaled, y_bins)) - 1
            if 0 <= x_idx < nx and 0 <= y_idx < ny:
                heatmap[y_idx, x_idx] += float(row["confidence"])

        heatmap = gaussian_filter(heatmap, sigma=sigma)
        if heatmap.max() > 0:
            heatmap = heatmap / heatmap.max()

        # Plot and save
        fig, ax = plt.subplots(figsize=(10, 8))
        ax.imshow(heatmap, extent=[0, field_length, 0, field_width],
                  origin="lower", cmap="hot", alpha=0.8)
        ax.add_patch(patches.Rectangle((0, 0), field_length, field_width,
                                       linewidth=2, edgecolor="white", facecolor="none"))
        ax.set_title(f"Player {player_id} Heatmap")
        ax.set_xlabel("Field Length (m)")
        ax.set_ylabel("Field Width (m)")

        filename = f"heatmap_{player_id}_{uuid.uuid4().hex[:8]}.png"
        filepath = os.path.join(HEATMAP_DIR, filename)
        plt.savefig(filepath, dpi=150, bbox_inches="tight", facecolor="black")
        plt.close()
        return filepath


# -------------------- ROUTES --------------------

@router.post("/analyze-csv")
async def analyze_tracking_csv(file: UploadFile = File(...)):
    """
    Upload CSV and get:
    - Player list
    - Stats for all players
    (summary only)
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        content = await file.read()
        tracking = PlayerTrackingData(content.decode("utf-8"))

        players = sorted([int(pid) for pid in tracking.df["player_id"].unique()])
        stats = tracking.get_player_stats()

        return {
            "message": "CSV analyzed successfully",
            "filename": file.filename,
            "total_players": len(players),
            "player_ids": players,
            "statistics": stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing CSV: {str(e)}")


@router.post("/analyze-player")
async def analyze_player(file: UploadFile = File(...), player_id: int = None):
    """
    Upload CSV + player_id and get:
    - Movement path
    - Heatmap for that player
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    if player_id is None:
        raise HTTPException(status_code=400, detail="player_id is required")

    try:
        content = await file.read()
        tracking = PlayerTrackingData(content.decode("utf-8"))

        movement = tracking.get_player_movement(player_id)
        heatmap_path = tracking.generate_heatmap(player_id)

        return {
            "message": f"Analysis for player {player_id} completed",
            "player_id": player_id,
            "movement": movement,
            "heatmap": {
                "path": heatmap_path,
                "filename": os.path.basename(heatmap_path)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing player: {str(e)}")