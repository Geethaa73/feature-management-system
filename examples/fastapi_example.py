from fastapi import FastAPI, Request

from feature_flag_sdk import FeatureFlagMiddleware


app = FastAPI(
    title="FeatureOps SDK Example"
)


app.add_middleware(
    FeatureFlagMiddleware,
)


@app.get("/")
def home():
    return {
        "message": "FeatureOps SDK integration is working"
    }


@app.get("/dashboard")
def dashboard(request: Request):

    flag_client = request.state.flag_client

    enabled = flag_client.is_enabled(
        "new_dashboard",
        user_id="user_101",
    )

    return {
        "feature": "new_dashboard",
        "enabled": enabled,
    }