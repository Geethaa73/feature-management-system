from typing import Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from .client import FeatureFlagClient


class FeatureFlagMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for FeatureOps feature flag evaluation.

    The middleware creates one FeatureFlagClient for the application
    and makes it available through:

        request.state.flag_client
    """

    def __init__(
        self,
        app,
        client: FeatureFlagClient | None = None,
        **client_kwargs,
    ):
        super().__init__(app)

        self.client = client or FeatureFlagClient(
            **client_kwargs
        )

    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ):
        request.state.flag_client = self.client

        response = await call_next(request)

        return response


class DjangoFeatureFlagMiddleware:
    """
    Django middleware for FeatureOps feature flag evaluation.

    The middleware attaches a FeatureFlagClient to the Django request:

        request.flag_client
    """

    def __init__(
        self,
        get_response,
        client: FeatureFlagClient | None = None,
        **client_kwargs,
    ):
        self.get_response = get_response

        self.client = client or FeatureFlagClient(
            **client_kwargs
        )

    def __call__(self, request):
        request.flag_client = self.client

        response = self.get_response(request)

        return response