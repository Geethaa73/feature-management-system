from pydantic import BaseModel, Field


class RolloutPercentageUpdate(BaseModel):
    rollout_percentage: int = Field(
        ge=0,
        le=100
    )