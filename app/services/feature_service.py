from sqlalchemy.orm import Session
from app.models.feature_flag import FeatureFlag
from app.schemas.feature_flag import FeatureFlagCreate


def create_feature_flag(db: Session, feature: FeatureFlagCreate):
    db_feature = FeatureFlag(
        name=feature.name,
        description=feature.description,
        is_enabled=feature.is_enabled,
        environment_id=feature.environment_id
    )

    db.add(db_feature)
    db.commit()
    db.refresh(db_feature)

    return db_feature


def get_all_feature_flags(db: Session):
    return db.query(FeatureFlag).all()


def get_feature_flag(db: Session, feature_id: int):
    return db.query(FeatureFlag).filter(
        FeatureFlag.id == feature_id
    ).first()


def delete_feature_flag(db: Session, feature_id: int):
    feature = get_feature_flag(db, feature_id)

    if feature:
        db.delete(feature)
        db.commit()

    return feature
def update_feature_flag(db: Session, feature_id: int, feature_data: FeatureFlagCreate):
    feature = db.query(FeatureFlag).filter(
        FeatureFlag.id == feature_id
    ).first()

    if not feature:
        return None

    feature.name = feature_data.name
    feature.description = feature_data.description
    feature.is_enabled = feature_data.is_enabled
    feature.environment_id = feature_data.environment_id

    db.commit()
    db.refresh(feature)

    return feature


def toggle_feature_flag(db: Session, feature_id: int):
    feature = db.query(FeatureFlag).filter(
        FeatureFlag.id == feature_id
    ).first()

    if not feature:
        return None

    feature.is_enabled = not feature.is_enabled

    db.commit()
    db.refresh(feature)

    return feature