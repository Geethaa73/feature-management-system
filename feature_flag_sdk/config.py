import os


class FeatureFlagConfig:
    """
    Configuration for the FeatureFlag SDK.

    Values can be supplied explicitly or through environment variables:

        FLAG_API_URL
        API_KEY
        CACHE_TTL
        FLAG_ENVIRONMENT
        FLAG_DEFAULT_VALUE
    """

    def __init__(
        self,
        api_url: str | None = None,
        api_key: str | None = None,
        cache_ttl: int | None = None,
        environment: str | None = None,
        default_value: bool = False,
    ):
        self.api_url = (
            api_url
            or os.getenv(
                "FLAG_API_URL",
                "http://127.0.0.1:8001",
            )
        ).rstrip("/")

        self.api_key = (
            api_key
            if api_key is not None
            else os.getenv("API_KEY", "")
        )

        ttl_value = (
            cache_ttl
            if cache_ttl is not None
            else os.getenv("CACHE_TTL", "300")
        )

        try:
            self.cache_ttl = int(ttl_value)
        except (TypeError, ValueError):
            self.cache_ttl = 300

        self.environment = (
            environment
            or os.getenv(
                "FLAG_ENVIRONMENT",
                "Production",
            )
        )

        self.default_value = default_value