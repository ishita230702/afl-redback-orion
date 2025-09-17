# backend/main.py
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from routes import upload, inference, metrics, tracking_analysis_simple, analysis, auth, crowd,inference
from config.cors import add_cors
from storage import init_db   # ✅ switched to PostgreSQL storage
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# -----------------------------
# App Initialization
# -----------------------------
app = FastAPI(
    title="AFL Vision Backend",
    version="1.0.0",
    description="Backend API for AFL Vision Insight project "
                "(Upload, Inference, Metrics)."
)

# -----------------------------
# Startup Event (DB init, etc.)
# -----------------------------
@app.on_event("startup")
async def startup_event():
    init_db()  # ✅ now creates tables in Postgres instead of memory

# -----------------------------
# CORS Middleware
# -----------------------------
add_cors(app)

# -----------------------------
# Global Middleware
# -----------------------------
@app.middleware("http")
async def api_version_header(request: Request, call_next):
    """Attach API version header to every response."""
    response = await call_next(request)
    response.headers["X-API-Version"] = "1"
    return response

# -----------------------------
# Healthcheck Root
# -----------------------------
@app.get("/", tags=["Health"])
def read_root():
    return {
        "status": "success",
        "message": "AFL Vision Backend Running",
        "version": "1.0.0"
    }

# -----------------------------
# Routers
# -----------------------------
app.include_router(upload.router, prefix="/api/v1/uploads", tags=["Uploads"])
app.include_router(inference.router, prefix="/api/v1/inference", tags=["Inference"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(metrics.router,   prefix="/api/v1/metrics",  tags=["Metrics"])
app.include_router(tracking_analysis_simple.router, prefix="/api/v1/tracking", tags=["Player Tracking"])
app.include_router(auth.router)
app.include_router(crowd.router, prefix="/api/v1")
app.include_router(inference.router, prefix="/api/v1/inference")


# -----------------------------
# Static files
# -----------------------------

STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")