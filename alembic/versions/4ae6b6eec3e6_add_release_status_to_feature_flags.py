"""Add release status to feature flags

Revision ID: 4ae6b6eec3e6
Revises: 80084ed56ed0
Create Date: 2026-09-15 18:48:24.479709

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4ae6b6eec3e6"
down_revision: Union[str, Sequence[str], None] = "80084ed56ed0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "feature_flags",
        sa.Column(
            "release_status",
            sa.String(length=30),
            nullable=False,
            server_default="ACTIVE",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column("feature_flags", "release_status")