from feature_flag_sdk import FeatureFlagClient


client = FeatureFlagClient(
    api_url="http://127.0.0.1:8001",
    environment="Production",
    cache_ttl=60,
)


result = client.is_enabled(
    "new_dashboard",
    user_id="user_101",
)

print("Feature enabled:", result)

