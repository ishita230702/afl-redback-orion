from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from pathlib import Path
import os
import httpx
import json

from storage import (
    get_upload,
    save_player_analysis,
    get_crowd_analysis,
    save_crowd_analysis,
    save_inference,get_inferences
)


from routes.auth import get_current_user   # ✅ JWT auth

router = APIRouter(tags=["Inference"])

# -------------------------------
# Service configuration
# -------------------------------
PLAYER_SVC_URL = os.getenv("PLAYER_SVC_URL", "http://127.0.0.1:8001")

# -------------------------------
# Request models
# -------------------------------
class PlayerTrackRequest(BaseModel):
    id: str = Field(..., description="Upload ID returned by /upload")
    location: str = Field("unknown", description="Optional context like stadium/venue")
    sampling_fps: Optional[int] = Field(5, ge=1, le=60)
    conf_threshold: Optional[float] = Field(0.5, ge=0, le=1)



# -------------------------------
# Helpers
# -------------------------------
def _resolve_upload_abs_path(rec: Dict[str, Any]) -> Path:
    """Resolve upload record relative path into absolute backend path."""
    backend_dir = Path(__file__).resolve().parents[1]  # backend/
    return (backend_dir / str(rec["path"]).lstrip("/\\")).resolve()


STATIC_DIR = Path("static")
HEATMAP_ROOT = STATIC_DIR / "heatmaps"
ANALYTICS_ROOT = STATIC_DIR / "analytics"
HEATMAP_ROOT.mkdir(parents=True, exist_ok=True)
ANALYTICS_ROOT.mkdir(parents=True, exist_ok=True)


async def _download_file(orig_url: str, out_path: Path) -> str:
    """Download file from player service and save locally. Return static URL."""
    try:
        async with httpx.AsyncClient(timeout=None) as client:
            resp = await client.get(orig_url)
            resp.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"failed to fetch file: {e}")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(resp.content)

    return f"http://127.0.0.1:8000/static/{out_path.relative_to(STATIC_DIR).as_posix()}"


# -------------------------------
# Player Tracking
# -------------------------------
@router.post("/player/track", summary="Run player tracking and return stats")
async def run_player_track(
    req: PlayerTrackRequest,
    user_id: int = Depends(get_current_user)
):
    rec = get_upload(req.id)
    if not rec:
        raise HTTPException(status_code=404, detail="upload id not found")
    if rec["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this upload")

    abs_path = _resolve_upload_abs_path(rec)
    if not abs_path.exists():
        raise HTTPException(status_code=410, detail="file missing on disk")

    # ✅ Save job as "Analyzing..."
    save_inference(req.id, user_id, "player", "Analyzing...", {})

    try:
        # 🔹 Call player tracking microservice
        async with httpx.AsyncClient(timeout=None) as client:
            with abs_path.open("rb") as f:
                files = {"file": (abs_path.name, f, "video/mp4")}
                resp = await client.post(f"{PLAYER_SVC_URL}/track", files=files)

        if resp.status_code != 200:
            save_inference(req.id, user_id, "player", "Failed", {"error": resp.text})
            raise HTTPException(status_code=502, detail=f"player service error: {resp.text}")

        tracking_result = resp.json()

        # -------------------------------
        # Save analytics + heatmaps locally
        # -------------------------------
        analytics_dir = ANALYTICS_ROOT / req.id
        heatmap_dir = HEATMAP_ROOT / req.id
        analytics_dir.mkdir(parents=True, exist_ok=True)
        (heatmap_dir / "players").mkdir(parents=True, exist_ok=True)
        (heatmap_dir / "zones").mkdir(parents=True, exist_ok=True)

        # Save analytics.json
        team_json_path = analytics_dir / "analytics.json"
        with open(team_json_path, "w") as jf:
            json.dump(tracking_result["analytics"], jf, indent=2)
        backend_team_json_url = f"http://127.0.0.1:8000/static/analytics/{req.id}/analytics.json"

        # Save team heatmap
        team_heatmap_url = None
        if tracking_result["analytics"].get("team_heatmap"):
            team_heatmap_url = await _download_file(
                tracking_result["analytics"]["team_heatmap"],
                heatmap_dir / "team.png"
            )

        # Save zone heatmaps
        zone_urls = {}
        for zone, url in tracking_result["analytics"].get("zones", {}).items():
            zone_urls[zone] = await _download_file(
                url,
                heatmap_dir / "zones" / f"{zone}.png"
            )

        # -------------------------------
        # Save per-player analysis to DB
        # -------------------------------
        for player in tracking_result["analytics"]["players"]:
            pid = int(player["id"])
            player_heatmap_url = await _download_file(
                player["heatmap"],
                heatmap_dir / "players" / f"id_{pid}.png"
            )

            save_player_analysis(
                upload_id=req.id,
                player_id=pid,
                json_path=backend_team_json_url,
                heatmap_path=player_heatmap_url,
                team_heatmap_path=team_heatmap_url,
                stats={
                    "distance_m": player.get("distance_m"),
                    "average_speed_m_s": player.get("average_speed_m_s"),
                    "average_speed_kmh": player.get("average_speed_kmh"),
                    "max_speed_m_s": player.get("max_speed_m_s"),
                    "max_speed_kmh": player.get("max_speed_kmh"),
                },
                zone_back_50_path=zone_urls.get("back_50"),
                zone_midfield_path=zone_urls.get("midfield"),
                zone_forward_50_path=zone_urls.get("forward_50"),
            )

        # ✅ Update inference as Completed
        save_inference(req.id, user_id, "player", "Completed", tracking_result)

        return {
            "id": rec["id"],
            "task": "player-track",
            "status": "ok",
            "team_heatmap": team_heatmap_url,
            "zones": zone_urls,
            "team_analytics_json": backend_team_json_url,
            "data": tracking_result,
        }

    except Exception as e:
        save_inference(req.id, user_id, "player", "Failed", {"error": str(e)})
        raise HTTPException(status_code=500, detail=f"player tracking failed: {str(e)}")
    
    
# -------------------------------
# Get Inference Records
# -------------------------------
@router.get("/inferences", summary="List inference jobs")
def list_inferences(
    upload_id: str,
    user_id: int = Depends(get_current_user)
):
    results = get_inferences(upload_id)

    # 🔹 Ensure user can only see their own inferences
    filtered = [r for r in results if r["user_id"] == user_id]

    if not filtered:
        raise HTTPException(status_code=404, detail="No inferences found for this upload")

    return filtered