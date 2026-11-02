from feature_flag_sdk import DjangoFeatureFlagMiddleware


# Add this to Django settings.py:
#
# MIDDLEWARE = [
#     ...
#     "feature_flag_sdk.middleware.DjangoFeatureFlagMiddleware",
# ]


def dashboard_view(request):
    """
    Example Django view using the FeatureOps SDK.
    """

    enabled = request.flag_client.is_enabled(
        "new_dashboard",
        user_id="user_101",
    )

    return {
        "feature": "new_dashboard",
        "enabled": enabled,
    }