from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth
from app.routers import environment
from app.routers import feature_flag
from app.routers import override
from app.routers import audit
from app.routers import group
from app.routers import user_group
from app.routers import evaluate
from app.routers import flag_evaluation
from app.routers import user_override
from app.routers import user
from app.routers import audit_log
from app.routers import targeting_rule
from app.routers import release
from app.routers import analytics


app = FastAPI(
    title="Feature Management System"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API ROUTES
# --------------------------------------------------

API_PREFIX = "/api"


app.include_router(
    auth.router,
    prefix=API_PREFIX
)

app.include_router(
    environment.router,
    prefix=API_PREFIX
)

app.include_router(
    feature_flag.router,
    prefix=API_PREFIX
)

app.include_router(
    override.router,
    prefix=API_PREFIX
)

app.include_router(
    audit.router,
    prefix=API_PREFIX
)

app.include_router(
    group.router,
    prefix=API_PREFIX
)

app.include_router(
    user_group.router,
    prefix=API_PREFIX
)

app.include_router(
    evaluate.router,
    prefix=API_PREFIX
)

app.include_router(
    flag_evaluation.router,
    prefix=API_PREFIX
)

app.include_router(
    user_override.router,
    prefix=API_PREFIX
)

app.include_router(
    user.router,
    prefix=API_PREFIX
)

app.include_router(
    audit_log.router,
    prefix=API_PREFIX
)

app.include_router(
    targeting_rule.router,
    prefix=API_PREFIX
)

app.include_router(
    release.router,
    prefix=API_PREFIX
)

app.include_router(
    analytics.router,
    prefix=API_PREFIX
)


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Feature Management System API"
    }