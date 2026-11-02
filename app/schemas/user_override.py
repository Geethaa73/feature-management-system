from pydantic import BaseModel


class UserOverrideCreate(BaseModel):
    user_id: int
    feature_id: int
    enabled: bool


class UserOverrideResponse(BaseModel):
    id: int
    user_id: int
    feature_id: int
    enabled: bool

    class Config:
        from_attributes = True