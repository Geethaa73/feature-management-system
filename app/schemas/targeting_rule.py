from pydantic import BaseModel, field_validator


class TargetingRuleCreate(BaseModel):
    feature_flag_id: int
    rule_type: str
    rule_value: str

    @field_validator("rule_type")
    @classmethod
    def validate_rule_type(cls, value: str):
        value = value.lower().strip()

        if value not in {"user", "group"}:
            raise ValueError("rule_type must be either 'user' or 'group'")

        return value

    @field_validator("rule_value")
    @classmethod
    def validate_rule_value(cls, value: str):
        value = value.strip()

        if not value:
            raise ValueError("rule_value cannot be empty")

        return value


class TargetingRuleResponse(BaseModel):
    id: int
    feature_flag_id: int
    rule_type: str
    rule_value: str

    class Config:
        from_attributes = True



