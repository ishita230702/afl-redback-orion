from fastapi import APIRouter, HTTPException, Depends
from storage import (
    get_player_analysis,
    get_crowd_analysis,
    _db,
    PlayerAnalysis,
    get_upload
)
from routes.auth import get_current_user
import uuid

router = APIRouter(tags=["Analysis"])

# -------------------------------
# Player Analysis - all players
# -------------------------------
@router.get("/players/{upload_id}", summary="Get all player analysis for a video")
def fetch_all_players(upload_id: str, user_id: int = Depends(get_current_user)):
    rec = get_upload(upload_id)
    if not rec or rec["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized or upload not found")

    with _db() as db:
        rows = db.query(PlayerAnalysis).filter(
            PlayerAnalysis.upload_id == uuid.UUID(upload_id)
        ).all()

        if not rows:
            raise HTTPException(status_code=404, detail="No players found for this upload")

        return [
            {
                "player_id": row.player_id,
                "heatmap_url": row.heatmap_path,
                "distance_m": row.stats.get("distance_m", 0.0),
                "avg_speed_kmh": row.stats.get("average_speed_kmh", 0.0),
                "max_speed_kmh": row.stats.get("max_speed_kmh", 0.0),
                "created_at": row.created_at.isoformat()
            }
            for row in rows
        ]


# -------------------------------
# Player Analysis - one player
# -------------------------------
@router.get("/player/{upload_id}/{player_id}", summary="Get detailed analysis for one player")
def fetch_player(upload_id: str, player_id: int, user_id: int = Depends(get_current_user)):
    rec_upload = get_upload(upload_id)
    if not rec_upload or rec_upload["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized or upload not found")

    rec = get_player_analysis(upload_id, player_id)
    if not rec:
        raise HTTPException(status_code=404, detail="No analysis found for this player")

    return {
        "player_id": rec["player_id"],
        "heatmap_url": rec["heatmap_path"],
        "team_heatmap_url": rec.get("team_heatmap_path"),
        "zone_heatmaps": {
            "back_50": rec.get("zone_back_50_path"),
            "midfield": rec.get("zone_midfield_path"),
            "forward_50": rec.get("zone_forward_50_path"),
        },
        "stats": rec.get("stats", {}),
        "created_at": rec["created_at"]
    }


# -------------------------------
# Team Heatmaps
# -------------------------------
@router.get("/team/{upload_id}/heatmap", summary="Get team + zone heatmaps for a video")
def fetch_team_heatmap(upload_id: str, user_id: int = Depends(get_current_user)):
    rec_upload = get_upload(upload_id)
    if not rec_upload or rec_upload["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized or upload not found")

    with _db() as db:
        row = db.query(PlayerAnalysis).filter(
            PlayerAnalysis.upload_id == uuid.UUID(upload_id)
        ).first()

        if not row or not row.team_heatmap_path:
            raise HTTPException(status_code=404, detail="No team heatmap found for this upload")

        return {
            "upload_id": str(row.upload_id),
            "team_heatmap_url": row.team_heatmap_path,
            "zones": {
                "back_50": row.zone_back_50_path,
                "midfield": row.zone_midfield_path,
                "forward_50": row.zone_forward_50_path
            },
            "created_at": row.created_at.isoformat()
        }


# -------------------------------
# ✅ New: Combined Player Dashboard
# -------------------------------
@router.get("/player-dashboard/{upload_id}", summary="Get team heatmaps + player stats for dashboard")
def fetch_player_dashboard(upload_id: str, user_id: int = Depends(get_current_user)):
    rec_upload = get_upload(upload_id)
    if not rec_upload or rec_upload["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized or upload not found")

    with _db() as db:
        rows = db.query(PlayerAnalysis).filter(
            PlayerAnalysis.upload_id == uuid.UUID(upload_id)
        ).all()

        if not rows:
            raise HTTPException(status_code=404, detail="No player analysis found for this upload")

        # Collect team-level heatmaps (take from first record that has them)
        team_data = None
        for row in rows:
            if row.team_heatmap_path:
                team_data = {
                    "team_heatmap_url": row.team_heatmap_path,
                    "zones": {
                        "back_50": row.zone_back_50_path,
                        "midfield": row.zone_midfield_path,
                        "forward_50": row.zone_forward_50_path,
                    },
                }
                break

        # Collect per-player stats
        players = [
            {
                "player_id": row.player_id,
                "heatmap_url": row.heatmap_path,
                "distance_m": row.stats.get("distance_m", 0.0),
                "avg_speed_kmh": row.stats.get("average_speed_kmh", 0.0),
                "max_speed_kmh": row.stats.get("max_speed_kmh", 0.0),
            }
            for row in rows
        ]

        return {
            "upload_id": upload_id,
            "team": team_data,
            "players": players
        }


# -------------------------------
# Crowd Analysis
# -------------------------------
@router.get("/crowd/{upload_id}", summary="Get crowd analysis results")
def fetch_crowd(upload_id: str, user_id: int = Depends(get_current_user)):
    rec_upload = get_upload(upload_id)
    if not rec_upload or rec_upload["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized or upload not found")

    rows = get_crowd_analysis(upload_id)  # returns list[dict] with heatmap_image_path

    if not rows:
        return {
            "status": "no-heatmaps",
            "message": "No people detected in this video. No crowd analysis results available.",
            "upload_id": upload_id,
            "results": [],
            "time_series": []
        }

    # Compute summary stats
    counts = [row["people_count"] for row in rows if row["people_count"] is not None]
    avg_count = sum(counts) / len(counts) if counts else 0
    max_count = max(counts) if counts else 0
    min_count = min(counts) if counts else 0

    # Build time-series for charts
    time_series = [
        {
            "frame_number": row["frame_number"],
            "people_count": row["people_count"]
        }
        for row in rows
    ]

    # Build results with heatmap URLs
    results = [
        {
            "frame_number": row["frame_number"],
            "people_count": row["people_count"],
            "heatmap_url": row["heatmap_image_path"]  # ✅ add URL here
        }
        for row in rows
    ]

    return {
        "status": "success",
        "upload_id": upload_id,
        "frames_detected": len(rows),
        "avg_count": avg_count,
        "peak_count": max_count,
        "min_count": min_count,
        "results": results,         # now includes heatmap_url
        "time_series": time_series  # chart data
    }
