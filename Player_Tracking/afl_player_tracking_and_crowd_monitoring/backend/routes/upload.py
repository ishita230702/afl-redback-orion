from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from pathlib import Path
import os, uuid

from routes.auth import get_current_user   # ✅ import auth dependency
from storage import save_upload, _db, Upload, PlayerAnalysis, CrowdAnalysis

router = APIRouter(tags=["Uploads"])

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "200"))
CHUNK_SIZE = 1024 * 1024  # 1 MB

BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
VIDEO_DIR = BASE_DIR / "uploaded_videos"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

VIDEO_MIME = {"video/mp4", "video/quicktime"}  # mp4 / mov
VIDEO_EXTS = {".mp4", ".mov"}


def _safe_ext(name: str) -> str:
    return Path(name).suffix.lower()


# -------------------------------
# Upload Endpoint
# -------------------------------
@router.post("/", summary="Upload video (mp4/mov only)")
async def upload_video(
    file: UploadFile = File(..., description="mp4/mov only"),
    user_id: int = Depends(get_current_user)   # ✅ require JWT auth
):
    """Upload a video file. Only accessible for authenticated users."""
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="file is required",
        )

    ext = _safe_ext(file.filename)
    content_type = (file.content_type or "").lower()

    mime_ok = content_type in VIDEO_MIME if content_type else False
    ext_ok = ext in VIDEO_EXTS
    if not (mime_ok or ext_ok):
        raise HTTPException(status_code=400, detail="Only video files (.mp4, .mov) are accepted")

    # Generate ID + destination path
    file_id = uuid.uuid4().hex
    suffix = ext if ext_ok else ".mp4"
    dest_path = VIDEO_DIR / f"{file_id}{suffix}"

    # Stream to disk with size guard
    max_bytes = MAX_UPLOAD_MB * 1024 * 1024
    written = 0
    try:
        with dest_path.open("wb") as out:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                written += len(chunk)
                if written > max_bytes:
                    out.close()
                    dest_path.unlink(missing_ok=True)
                    raise HTTPException(status_code=413, detail=f"file too large (> {MAX_UPLOAD_MB}MB)")
                out.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        dest_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()

    # Relative path stored in DB (relative to backend/ root)
    rel_path = f"uploaded_videos/{dest_path.name}"

    # ✅ Save to Postgres (now includes original_filename)
    rec = save_upload(
        path=rel_path,
        media_type="video",
        size_bytes=written,
        user_id=user_id,
        original_filename=file.filename
    )

    return JSONResponse(rec)


# -------------------------------
# List Uploads
# -------------------------------
@router.get("/", summary="List all uploads for current user")
def list_uploads(user_id: int = Depends(get_current_user)):
    with _db() as db:
        rows = db.query(Upload).filter(Upload.user_id == user_id).all()
        return [
            {
                "id": str(r.id),
                "user_id": r.user_id,
                "path": r.path,
                "media_type": r.media_type,
                "size_bytes": r.size_bytes,
                "created_at": r.created_at.isoformat(),
                "original_filename": r.original_filename,   # ✅ include name
            }
            for r in rows
        ]


# -------------------------------
# Delete Upload
# -------------------------------
@router.delete("/{upload_id}", summary="Delete an upload and its analyses")
def delete_upload(upload_id: str, user_id: int = Depends(get_current_user)):
    import uuid as uuid_pkg
    with _db() as db:
        row = db.query(Upload).filter(Upload.id == uuid_pkg.UUID(upload_id)).first()

        if not row:
            raise HTTPException(status_code=404, detail="Upload not found")
        if row.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this upload")

        # Delete related analyses
        db.query(PlayerAnalysis).filter(PlayerAnalysis.upload_id == row.id).delete()
        db.query(CrowdAnalysis).filter(CrowdAnalysis.upload_id == row.id).delete()

        # Delete the upload record
        db.delete(row)
        db.commit()

        # Delete the actual file from disk if it exists
        file_path = BASE_DIR / row.path
        try:
            if file_path.exists():
                file_path.unlink()
        except Exception:
            pass  # don’t block if file missing

        return {"status": "deleted", "upload_id": upload_id}
