import os
from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "feature_management_secret_key_change_this"
)

ALGORITHM = "HS256"

# 7 days
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7


FEATURE_FLAG_API_KEY = os.getenv(
    "FEATURE_FLAG_API_KEY",
    ""
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(data: dict) -> str:

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def verify_feature_api_key(api_key: str) -> bool:
    """
    Verify the API key used by external SDK clients.
    """
    if not FEATURE_FLAG_API_KEY:
        return False

    return api_key == FEATURE_FLAG_API_KEY