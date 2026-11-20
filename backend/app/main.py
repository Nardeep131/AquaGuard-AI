from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.api.auth_routes import router as auth_router
from backend.app.api.water_routes import router as water_router
from backend.app.api.dashboard_routes import router as dashboard_router
from backend.app.api.report_routes import router as report_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AquaGuard AI: Enterprise Water Quality Analysis, Drinking Water Safety & Environmental Monitoring Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(water_router)
app.include_router(dashboard_router)
app.include_router(report_router)

@app.get("/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to AquaGuard AI Core API",
        "docs_url": "/docs",
        "version": "1.0.0"
    }
