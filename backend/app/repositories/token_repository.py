"""Data access for revoked tokens. No business rules here."""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.revoked_token import RevokedToken


def is_revoked(db: Session, jti: str) -> bool:
    return db.execute(select(RevokedToken.id).where(RevokedToken.jti == jti)).first() is not None


def revoke(db: Session, *, jti: str, user_id: int, expires_at: datetime) -> None:
    """Store the token as revoked; revoking it twice keeps the first row."""
    if not is_revoked(db, jti):
        db.add(RevokedToken(jti=jti, user_id=user_id, expires_at=expires_at))
    db.commit()
