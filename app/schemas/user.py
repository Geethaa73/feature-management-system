from pydantic import BaseModel, EmailStr
from datetime import datetime


# Data received during signup
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "Developer"


# Data returned from API
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Login request
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# JWT token response
class Token(BaseModel):
    access_token: str
    token_type: str