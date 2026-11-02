from fastapi import Header, HTTPException, status

from app.utils.security import verify_feature_api_key


def verify_sdk_api_key(
    x_api_key: str | None = Header(default=None)
):
    """
    Authenticate external SDK requests using X-API-Key.
    """

    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is required",
        )

    if not verify_feature_api_key(x_api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )

    return x_api_key