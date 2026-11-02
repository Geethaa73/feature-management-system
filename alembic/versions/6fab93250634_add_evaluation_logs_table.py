"""add evaluation logs table

Revision ID: 6fab93250634
Revises: 77b755d87356
Create Date: 2026-09-16

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6fab93250634"
down_revision: Union[str, Sequence[str], None] = "77b755d87356"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "evaluation_logs",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "flag_id",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "environment_id",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "user_id",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "enabled",
            sa.Boolean(),
            nullable=False,
        ),
        sa.Column(
            "reason",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "timestamp",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["flag_id"],
            ["feature_flags.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["environment_id"],
            ["environments.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_evaluation_logs_id",
        "evaluation_logs",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_evaluation_logs_id",
        table_name="evaluation_logs",
    )

    op.drop_table("evaluation_logs")