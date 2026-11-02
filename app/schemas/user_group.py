from pydantic import BaseModel


class UserGroupCreate(BaseModel):
    user_id: int
    group_id: int


class UserGroupResponse(BaseModel):
    id: int
    user_id: int
    group_id: int

    class Config:
        from_attributes = True