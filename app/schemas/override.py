from pydantic import BaseModel


class OverrideCreate(BaseModel):
    flag_id: int
    environment_id: int
    value: bool


class OverrideUpdate(BaseModel):
    value: bool


class OverrideResponse(BaseModel):
    id: int
    flag_id: int
    environment_id: int
    value: bool

    class Config:
        from_attributes = True