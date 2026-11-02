from .cache import LocalCache
from .config import FeatureFlagConfig
from .exceptions import FeatureFlagAPIError, FeatureFlagConnectionError
from .http_client import FeatureFlagHTTPClient


class FeatureFlagClient:
    """
    Main client used by applications to evaluate FeatureOps flags.
    """

    def __init__(
        self,
        api_url: str | None = None,
        api_key: str | None = None,
        cache_ttl: int | None = None,
        environment: str | None = None,
        default_value: bool = False,
        timeout: float = 5.0,
    ):
        self.config = FeatureFlagConfig(
            api_url=api_url,
            api_key=api_key,
            cache_ttl=cache_ttl,
            environment=environment,
            default_value=default_value,
        )

        self.cache = LocalCache(
            ttl=self.config.cache_ttl
        )

        self.http = FeatureFlagHTTPClient(
            api_url=self.config.api_url,
            api_key=self.config.api_key,
            timeout=timeout,
        )

    def _build_cache_key(
        self,
        flag_key: str,
        user_id: str | None,
        environment: str,
    ) -> str:
        user_part = user_id or "anonymous"

        return (
            f"{flag_key.strip()}:"
            f"{user_part}:"
            f"{environment.strip().lower()}"
        )

    def is_enabled(
        self,
        flag_key: str,
        user_id: str | None = None,
        environment: str | None = None,
        groups: list[str] | None = None,
        default: bool | None = None,
    ) -> bool:
        """
        Evaluate a feature flag.

        The SDK checks local cache first. If there is no
        cached value, it calls FeatureOps.

        If FeatureOps is unavailable:
            1. cached value is used when available
            2. otherwise the supplied/default fallback is returned
        """

        selected_environment = (
            environment or self.config.environment
        )

        fallback_value = (
            self.config.default_value
            if default is None
            else default
        )

        cache_key = self._build_cache_key(
            flag_key=flag_key,
            user_id=user_id,
            environment=selected_environment,
        )

        # --------------------------------------------------------
        # 1. LOCAL CACHE
        # --------------------------------------------------------

        cached_result = self.cache.get(cache_key)

        if cached_result is not None:
            return bool(cached_result["enabled"])

        # --------------------------------------------------------
        # 2. FEATUREOPS API
        # --------------------------------------------------------

        try:
            result = self.http.evaluate(
                flag_key=flag_key,
                environment=selected_environment,
                user_id=user_id,
                groups=groups,
            )

            self.cache.set(
                cache_key,
                result,
            )

            return bool(result["enabled"])

        # --------------------------------------------------------
        # 3. FALLBACK
        # --------------------------------------------------------

        except (
            FeatureFlagAPIError,
            FeatureFlagConnectionError,
        ):
            return fallback_value

    def clear_cache(self):
        """Clear all locally cached flag evaluations."""
        self.cache.clear()

    def clear_flag_cache(
        self,
        flag_key: str,
        user_id: str | None = None,
        environment: str | None = None,
    ):
        """Remove one specific cached evaluation."""

        selected_environment = (
            environment or self.config.environment
        )

        cache_key = self._build_cache_key(
            flag_key=flag_key,
            user_id=user_id,
            environment=selected_environment,
        )

        self.cache.delete(cache_key)