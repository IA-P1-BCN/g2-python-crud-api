"""add users audit trail

Revision ID: d7e2b5a9c1f3
Revises: c41f8a2d9b07
Create Date: 2026-10-15 10:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d7e2b5a9c1f3"
down_revision: str | None = "c41f8a2d9b07"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Batch mode so SQLite (used by the tests) can add the foreign keys; PostgreSQL alters in place.
    with op.batch_alter_table("users") as batch:
        batch.add_column(sa.Column("created_by_id", sa.Integer(), nullable=True))
        batch.add_column(sa.Column("updated_by_id", sa.Integer(), nullable=True))
        batch.add_column(sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))
        batch.create_foreign_key("fk_users_created_by_id_users", "users", ["created_by_id"], ["id"])
        batch.create_foreign_key("fk_users_updated_by_id_users", "users", ["updated_by_id"], ["id"])


def downgrade() -> None:
    with op.batch_alter_table("users") as batch:
        batch.drop_constraint("fk_users_updated_by_id_users", type_="foreignkey")
        batch.drop_constraint("fk_users_created_by_id_users", type_="foreignkey")
        batch.drop_column("updated_at")
        batch.drop_column("updated_by_id")
        batch.drop_column("created_by_id")
