"""Login with GitHub (specs/414-social-login-with-github.md).

GitHub is never called: the API tests replace the profile lookup, and the HTTP exchange is tested
against httpx.MockTransport.
"""

from datetime import UTC, datetime
from urllib.parse import parse_qs, urlsplit

import httpx
import pytest
from sqlalchemy import select

from app.core.config import settings
from app.core.exceptions import AuthenticationError, BusinessRuleError
from app.core.security import decode_access_token
from app.models.user import User, UserRole
from app.services import social_login_service
from app.services.social_login_service import GithubProfile

API = "/api/v1"
CALLBACK = f"{API}/auth/github/callback"
STATE = "state-from-this-browser"


@pytest.fixture(autouse=True)
def _github_configured(monkeypatch) -> None:
    monkeypatch.setattr(settings, "github_client_id", "test-client-id")
    monkeypatch.setattr(settings, "github_client_secret", "test-client-secret")
    monkeypatch.setattr(settings, "frontend_url", "http://web.test")


@pytest.fixture()
def github_profile(monkeypatch):
    """Make GitHub answer with this profile, and record the codes it was asked about."""
    calls: list[str] = []

    def use(profile: GithubProfile) -> list[str]:
        def fake_fetch(code, client=None):
            calls.append(code)
            return profile

        monkeypatch.setattr(social_login_service, "fetch_profile", fake_fetch)
        return calls

    return use


def _callback(client, *, state: str | None = STATE, cookie: str | None = STATE, **params):
    query = {"code": "the-code", **params}
    if state is not None:
        query["state"] = state
    headers = {"Cookie": f"github_oauth_state={cookie}"} if cookie is not None else {}
    return client.get(CALLBACK, params=query, headers=headers, follow_redirects=False)


def _fragment(response) -> dict[str, str]:
    location = urlsplit(response.headers["location"])
    assert (
        f"{location.scheme}://{location.netloc}{location.path}" == "http://web.test/auth/callback"
    )
    return {key: values[0] for key, values in parse_qs(location.fragment).items()}


# Starting the login


def test_login_redirects_to_github_with_a_state_cookie(anon_client) -> None:
    response = anon_client.get(f"{API}/auth/github/login", follow_redirects=False)

    assert response.status_code == 307
    location = urlsplit(response.headers["location"])
    assert f"{location.netloc}{location.path}" == "github.com/login/oauth/authorize"
    query = parse_qs(location.query)
    assert query["client_id"] == ["test-client-id"]
    assert query["redirect_uri"] == [settings.github_redirect_uri]
    assert query["scope"] == ["read:user user:email"]
    cookie = response.headers["set-cookie"]
    assert cookie.startswith(f"github_oauth_state={query['state'][0]};")
    assert "HttpOnly" in cookie
    assert "Path=/api/v1/auth/github/callback" in cookie
    assert "samesite=lax" in cookie.lower()


def test_each_login_gets_a_new_state(anon_client) -> None:
    states = {
        parse_qs(
            urlsplit(
                anon_client.get(f"{API}/auth/github/login", follow_redirects=False).headers[
                    "location"
                ]
            ).query
        )["state"][0]
        for _ in range(3)
    }

    assert len(states) == 3


def test_login_without_configuration_returns_400(anon_client, monkeypatch) -> None:
    monkeypatch.setattr(settings, "github_client_id", "")

    response = anon_client.get(f"{API}/auth/github/login", follow_redirects=False)

    assert response.status_code == 400
    assert response.json() == {
        "detail": "El login con GitHub no está configurado",
        "code": "business_rule",
    }


# Back from GitHub


def test_a_new_email_creates_a_verified_member(anon_client, db_session, github_profile) -> None:
    github_profile(GithubProfile(email="nueva@example.com", name="Nueva Persona"))

    response = _callback(anon_client)

    assert response.status_code == 307
    tokens = _fragment(response)
    assert tokens["token_type"] == "bearer"
    user = db_session.execute(select(User).where(User.email == "nueva@example.com")).scalar_one()
    assert user.role == UserRole.member
    assert user.full_name == "Nueva Persona"
    assert user.email_verified_at is not None
    assert decode_access_token(tokens["access_token"])["sub"] == str(user.id)
    assert "refresh_token" in tokens


def test_an_existing_email_is_linked_not_duplicated(
    anon_client, db_session, member, github_profile
) -> None:
    github_profile(GithubProfile(email=member.email, name="Otro Nombre"))
    users_before = len(db_session.execute(select(User)).all())

    tokens = _fragment(_callback(anon_client))

    assert decode_access_token(tokens["access_token"])["sub"] == str(member.id)
    assert len(db_session.execute(select(User)).all()) == users_before
    db_session.refresh(member)
    assert member.full_name != "Otro Nombre"
    assert member.email_verified_at is not None


def test_the_session_opens_the_api(anon_client, github_profile) -> None:
    github_profile(GithubProfile(email="nueva@example.com", name="Nueva"))
    token = _fragment(_callback(anon_client))["access_token"]

    me = anon_client.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert me.status_code == 200
    assert me.json()["email"] == "nueva@example.com"


def test_the_state_cookie_is_removed(anon_client, github_profile) -> None:
    github_profile(GithubProfile(email="nueva@example.com", name="Nueva"))

    cookie = _callback(anon_client).headers["set-cookie"]

    assert cookie.startswith('github_oauth_state="";') or "Max-Age=0" in cookie


@pytest.mark.parametrize(
    ("state", "cookie"),
    [(None, STATE), (STATE, None), ("someone-else", STATE), (None, None)],
)
def test_a_missing_or_different_state_never_reaches_github(
    anon_client, github_profile, state, cookie
) -> None:
    calls = github_profile(GithubProfile(email="nueva@example.com", name="Nueva"))

    response = _callback(anon_client, state=state, cookie=cookie)

    assert response.status_code == 307
    assert "caducado o no es válido" in _fragment(response)["error"]
    assert calls == []


def test_the_user_cancelling_on_github(anon_client, github_profile) -> None:
    calls = github_profile(GithubProfile(email="nueva@example.com", name="Nueva"))

    response = _callback(anon_client, error="access_denied")

    assert _fragment(response) == {"error": "No se autorizó el acceso en GitHub"}
    assert calls == []


def test_a_deactivated_account_cannot_enter(
    anon_client, db_session, member, github_profile
) -> None:
    member.is_active = False
    db_session.commit()
    github_profile(GithubProfile(email=member.email, name="Socio"))

    assert _fragment(_callback(anon_client)) == {"error": "La cuenta está desactivada"}


def test_an_account_with_two_factor_must_use_the_password_login(
    anon_client, db_session, member, github_profile
) -> None:
    member.totp_secret = "JBSWY3DPEHPK3PXP"
    member.totp_enabled_at = datetime.now(UTC)
    db_session.commit()
    github_profile(GithubProfile(email=member.email, name="Socio"))

    error = _fragment(_callback(anon_client))["error"]

    assert "verificación en dos pasos" in error
    assert "access_token" not in _fragment(_callback(anon_client))


def test_an_email_the_api_does_not_accept_is_shown_on_the_web(anon_client, github_profile) -> None:
    github_profile(GithubProfile(email="nueva@reserved.test", name="Nueva"))

    response = _callback(anon_client)

    assert _fragment(response) == {"error": "No se puede crear una cuenta con el email de GitHub"}


def test_a_github_failure_is_shown_on_the_web(anon_client, monkeypatch) -> None:
    def failing_fetch(code, client=None):
        raise AuthenticationError(social_login_service.FAILED)

    monkeypatch.setattr(social_login_service, "fetch_profile", failing_fetch)

    assert _fragment(_callback(anon_client)) == {"error": social_login_service.FAILED}


# The exchange with GitHub, against a fake GitHub


def _fake_github(token_answer: dict, emails: list[dict], account: dict, status: int = 200):
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        if request.url.path == "/login/oauth/access_token":
            return httpx.Response(200, json=token_answer)
        if request.url.path == "/user/emails":
            return httpx.Response(status, json=emails)
        return httpx.Response(status, json=account)

    return httpx.Client(transport=httpx.MockTransport(handler)), seen


EMAILS = [
    {"email": "secundario@example.com", "primary": False, "verified": True},
    {"email": "principal@example.com", "primary": True, "verified": True},
]


def test_fetch_profile_reads_the_primary_verified_email() -> None:
    client, seen = _fake_github(
        {"access_token": "gh-token"}, EMAILS, {"name": "Ana", "login": "ana"}
    )

    profile = social_login_service.fetch_profile("the-code", client)

    assert profile == GithubProfile(email="principal@example.com", name="Ana")
    exchange = parse_qs(seen[0].content.decode())
    assert exchange["code"] == ["the-code"]
    assert exchange["client_secret"] == ["test-client-secret"]
    assert seen[1].headers["authorization"] == "Bearer gh-token"


def test_fetch_profile_uses_the_login_when_there_is_no_name() -> None:
    client, _ = _fake_github({"access_token": "t"}, EMAILS, {"name": None, "login": "ana"})

    assert social_login_service.fetch_profile("c", client).name == "ana"


def test_fetch_profile_needs_a_verified_primary_email() -> None:
    emails = [{"email": "principal@example.com", "primary": True, "verified": False}]
    client, _ = _fake_github({"access_token": "t"}, emails, {"login": "ana"})

    with pytest.raises(BusinessRuleError, match="email verificado"):
        social_login_service.fetch_profile("c", client)


def test_fetch_profile_with_a_rejected_code() -> None:
    client, seen = _fake_github({"error": "bad_verification_code"}, EMAILS, {"login": "ana"})

    with pytest.raises(AuthenticationError):
        social_login_service.fetch_profile("c", client)
    assert len(seen) == 1


def test_fetch_profile_when_github_fails() -> None:
    client, _ = _fake_github({"access_token": "t"}, EMAILS, {"login": "ana"}, status=500)

    with pytest.raises(AuthenticationError):
        social_login_service.fetch_profile("c", client)
