""""add flag and environment to audit logs

Revision ID: 77b755d87356
Revises: 4ae6b6eec3e6
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "77b755d87356"
down_revision: Union[str, Sequence[str], None] = "4ae6b6eec3e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "audit_logs",
        sa.Column("flag_id", sa.Integer(), nullable=True),
    )

    op.add_column(
        "audit_logs",
        sa.Column("environment_id", sa.Integer(), nullable=True),
    )

    op.create_foreign_key(
        "fk_audit_logs_flag_id",
        "audit_logs",
        "feature_flags",
        ["flag_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_foreign_key(
        "fk_audit_logs_environment_id",
        "audit_logs",
        "environments",
        ["environment_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_audit_logs_environment_id",
        "audit_logs",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_audit_logs_flag_id",
        "audit_logs",
        type_="foreignkey",
    )

    op.drop_column("audit_logs", "environment_id")
    op.drop_column("audit_logs", "flag_id")