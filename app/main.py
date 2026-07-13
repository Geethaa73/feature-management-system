from fastapi import FastAPI

from app.routers import auth
from app.routers import environment
from app.routers import feature_flag
from app.routers import override
from app.routers import audit
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Feature Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(environment.router)
app.include_router(feature_flag.router)
app.include_router(override.router)
app.include_router(audit.router)


@app.get("/")
def root():
    return {"message": "Feature Management System API"}