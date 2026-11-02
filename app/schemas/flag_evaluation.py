from pydantic import BaseModel, Field


class FlagEvaluationRequest(BaseModel):
    flag_key: str
    environment: str
    user_id: str | None = None
    groups: list[str] = Field(default_factory=list)


class FlagEvaluationResponse(BaseModel):
    flag_key: str
    enabled: bool
    reason: str