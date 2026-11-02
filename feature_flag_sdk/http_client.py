import requests

from .exceptions import (
    FeatureFlagAPIError,
    FeatureFlagConnectionError,
)


class FeatureFlagHTTPClient:
    """
    Handles communication between the SDK and FeatureOps API.
    """

    def __init__(
        self,
        api_url: str,
        api_key: str = "",
        timeout: float = 5.0,
    ):
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    def evaluate(
        self,
        flag_key: str,
        environment: str,
        user_id: str | None = None,
        groups: list[str] | None = None,
    ) -> dict:
        url = f"{self.api_url}/flags/evaluate"

        headers = {
            "Content-Type": "application/json",
        }

        if self.api_key:
            headers["X-API-Key"] = self.api_key

        payload = {
            "flag_key": flag_key,
            "environment": environment,
            "user_id": user_id,
            "groups": groups or [],
        }

        try:
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=self.timeout,
            )

        except requests.RequestException as exc:
            raise FeatureFlagConnectionError(
                f"Unable to connect to FeatureOps API: {exc}"
            ) from exc

        if response.status_code >= 400:
            try:
                detail = response.json().get(
                    "detail",
                    response.text,
                )
            except ValueError:
                detail = response.text

            raise FeatureFlagAPIError(
                message=f"FeatureOps API error: {detail}",
                status_code=response.status_code,
            )

        try:
            return response.json()
        except ValueError as exc:
            raise FeatureFlagAPIError(
                "FeatureOps API returned invalid JSON.",
                status_code=response.status_code,
            ) from exc