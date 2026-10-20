"""add users personal_data_erased_at

Revision ID: a2c4e6f8b0d1
Revises: f5a8d2c7e9b1
Create Date: 2026-10-20 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a2c4e6f8b0d1"
down_revision: str | None = "f5a8d2c7e9b1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("personal_data_erased_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    with op.batch_alter_table("users") as batch:
        batch.drop_column("personal_data_erased_at")
