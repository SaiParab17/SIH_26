"""
FastAPI Application Entry Point.
SocialScope Web Collection Subsystem for X & Facebook (SIH Problem Statement 26152).
"""

import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("main")

# Instantiate FastAPI App
app = FastAPI(
    title="SocialScope Web Collection API",
    description="Production-oriented Playwright/Camoufox web collection subsystem for X and Facebook (SIH 26152).",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes under /api
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "service": "SocialScope Web Collection API (X & Facebook)",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")

    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"🚀  SocialScope Python Web Collector running on http://{host}:{port}")
    print("    • Docs:     http://localhost:8000/docs")
    print("    • Health:   http://localhost:8000/api/health")
    print("    • X:        POST http://localhost:8000/api/collection/x")
    print("    • Facebook: POST http://localhost:8000/api/collection/facebook")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

    uvicorn.run("app.main:app", host=host, port=port, reload=True)
