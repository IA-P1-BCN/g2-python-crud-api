"""add users two-factor authentication

Revision ID: f5a8d2c7e9b1
Revises: e3f9c6b1a2d4
Create Date: 2026-10-15 16:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f5a8d2c7e9b1"
down_revision: str | None = "e3f9c6b1a2d4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("totp_secret", sa.String(length=64), nullable=True))
    op.add_column("users", sa.Column("totp_enabled_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("users") as batch:
        batch.drop_column("totp_enabled_at")
        batch.drop_column("totp_secret")
