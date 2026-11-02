from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token
)
from app.services.auth_service import (
    create_user,
    authenticate_user,
    generate_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================
# REGISTER
# =========================

@router.post(
    "/signup",
    response_model=UserResponse
)
def signup(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    created_user = create_user(
        db,
        user
    )

    if not created_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists"
        )

    return created_user


# =========================
# LOGIN - FRONTEND
# =========================

@router.post(
    "/login",
    response_model=Token
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    authenticated_user = authenticate_user(
        db,
        user.email,
        user.password
    )

    if not authenticated_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = generate_token(
        authenticated_user
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================
# LOGIN - SWAGGER / OAUTH2
# =========================

@router.post(
    "/login/oauth2",
    response_model=Token,
    include_in_schema=False
)
def login_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    authenticated_user = authenticate_user(
        db,
        form_data.username,
        form_data.password
    )

    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    access_token = generate_token(
        authenticated_user
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }