# backend/config/cors.py
from fastapi.middleware.cors import CORSMiddleware

def add_cors(app, extra_origins=None):
    """
    Attach CORS middleware to the FastAPI app.
    Allows React dev server + optional extra origins.
    """
    default_origins = [
        "http://localhost:8080",  # Vite dev server
        "http://127.0.0.1:8080",  # sometimes Vite uses this
    ]

    # Add extra origins
    if extra_origins:
        default_origins.extend(extra_origins)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=default_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
