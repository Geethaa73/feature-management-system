from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)


def create_user(
    db: Session,
    user: UserCreate
):

    # Check existing email
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        return None

    # Check existing username
    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_username:
        return None

    # Create user
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(
            user.password
        ),
        role=user.role,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(
    db: Session,
    email: str,
    password: str
):

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.hashed_password
    ):
        return None

    return user


def generate_token(user: User):

    token_data = {
        "sub": user.email,
        "role": user.role
    }

    return create_access_token(
        token_data
    )