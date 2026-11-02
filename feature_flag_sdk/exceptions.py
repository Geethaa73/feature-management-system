class FeatureFlagSDKError(Exception):
    """Base exception for FeatureFlag SDK errors."""


class FeatureFlagAPIError(FeatureFlagSDKError):
    """Raised when the Feature Flag API returns an error."""

    def __init__(
        self,
        message: str,
        status_code: int | None = None,
    ):
        super().__init__(message)
        self.status_code = status_code


class FeatureFlagConnectionError(FeatureFlagSDKError):
    """Raised when the Feature Flag API cannot be reached."""