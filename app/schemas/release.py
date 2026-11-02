from pydantic import BaseModel, field_validator


class ReleaseStatusUpdate(BaseModel):
    release_status: str

    @field_validator("release_status")
    @classmethod
    def validate_release_status(cls, value: str):
        value = value.strip().upper()

        allowed_statuses = {
            "DRAFT",
            "ACTIVE",
            "ROLLOUT",
            "FULL_RELEASE",
            "DISABLED",
        }

        if value not in allowed_statuses:
            raise ValueError(
                "release_status must be one of: "
                "DRAFT, ACTIVE, ROLLOUT, FULL_RELEASE, DISABLED"
            )

        return value


class ReleaseStatusResponse(BaseModel):
    id: int
    release_status: str

    class Config:
        from_attributes = True