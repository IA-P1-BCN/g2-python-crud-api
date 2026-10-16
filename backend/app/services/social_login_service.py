"""Login with a GitHub account, OAuth2 authorization code flow.

See specs/414-social-login-with-github.md.
"""

import secrets
from dataclasses import dataclass
from urllib.parse import urlencode

import httpx
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AuthenticationError, BusinessRuleError, PermissionDeniedError
from app.models.user import User, UserRole
from app.schemas.auth import Token
from app.schemas.user import UserCreate
from app.services import auth_service, user_service

AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API = "https://api.github.com"
SCOPE = "read:user user:email"
STATE_LIFETIME_SECONDS = 600
FAILED = "No se pudo completar el login con GitHub"


@dataclass(frozen=True)
class GithubProfile:
    email: str
    name: str


def authorization_url(state: str) -> str:
    """Where to send the browser so the user authorizes Athletica on GitHub."""
    if not settings.github_client_id:
        raise BusinessRuleError("El login con GitHub no está configurado")
    query = urlencode(
        {
            "client_id": settings.github_client_id,
            "redirect_uri": settings.github_redirect_uri,
            "scope": SCOPE,
            "state": state,
        }
    )
    return f"{AUTHORIZE_URL}?{query}"


def new_state() -> str:
    return secrets.token_urlsafe(32)


def complete_login(
    db: Session,
    *,
    code: str | None,
    state: str | None,
    expected_state: str | None,
    error: str | None = None,
    client: httpx.Client | None = None,
) -> Token:
    """Back from GitHub: check the request is ours, then open a session for that account.

    `expected_state` is the one this browser started with; a different one is a CSRF attempt.
    `error` is set by GitHub when the user does not authorize the app.
    """
    if not state or not expected_state or not secrets.compare_digest(state, expected_state):
        raise AuthenticationError(
            "El login con GitHub ha caducado o no es válido. Inténtalo de nuevo"
        )
    if error or not code:
        raise AuthenticationError("No se autorizó el acceso en GitHub")
    return _login(db, fetch_profile(code, client))


def _login(db: Session, profile: GithubProfile) -> Token:
    """Open a session for the GitHub account, creating the member or linking the existing user."""
    user = user_service.get_user_by_email(db, profile.email)
    if user is None:
        user = _create_member(db, profile)
    if not user.is_active:
        raise PermissionDeniedError("La cuenta está desactivada")
    if user.totp_enabled_at is not None:
        raise AuthenticationError(
            "Esta cuenta tiene verificación en dos pasos: entra con tu email, contraseña y código"
        )
    user_service.mark_email_verified(db, user)
    return auth_service.issue_token(user)


def fetch_profile(code: str, client: httpx.Client | None = None) -> GithubProfile:
    """Exchange the code for a GitHub token and read the primary verified email and the name.

    The GitHub token is only used here and never stored.
    """
    http = client or httpx.Client(timeout=10)
    try:
        answer = http.post(
            ACCESS_TOKEN_URL,
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": settings.github_redirect_uri,
            },
            headers={"Accept": "application/json"},
        ).json()
        token = answer.get("access_token")
        if not token:
            raise AuthenticationError(FAILED)
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"}
        emails = http.get(f"{GITHUB_API}/user/emails", headers=headers).raise_for_status().json()
        account = http.get(f"{GITHUB_API}/user", headers=headers).raise_for_status().json()
    except (httpx.HTTPError, ValueError) as exc:
        raise AuthenticationError(FAILED) from exc
    finally:
        if client is None:
            http.close()
    email = next((e["email"] for e in emails if e.get("primary") and e.get("verified")), None)
    if email is None:
        raise BusinessRuleError("Tu cuenta de GitHub no tiene un email verificado")
    return GithubProfile(email=email, name=account.get("name") or account.get("login") or email)


def _create_member(db: Session, profile: GithubProfile) -> User:
    # Nobody knows this password: the user can set one with the password recovery link.
    password = secrets.token_urlsafe(24) + "Aa1!"
    try:
        data = UserCreate(
            email=profile.email,
            full_name=profile.name[:255],
            role=UserRole.member,
            password=password,
        )
    except ValidationError as exc:
        raise BusinessRuleError("No se puede crear una cuenta con el email de GitHub") from exc
    return user_service.create_user(db, data, created_by=None)
