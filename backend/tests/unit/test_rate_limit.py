"""Sliding-window limiter checked with a fake clock (specs/409-login-rate-limiting.md)."""

import pytest

from app.api.deps import login_limiter
from app.core.config import Settings, settings
from app.core.rate_limit import SlidingWindowLimiter


class FakeClock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


@pytest.fixture()
def clock() -> FakeClock:
    return FakeClock()


@pytest.fixture()
def limiter(clock: FakeClock) -> SlidingWindowLimiter:
    return SlidingWindowLimiter(attempts=5, window_seconds=60, clock=clock)


def test_allows_up_to_the_limit(limiter) -> None:
    assert [limiter.hit("1.1.1.1") for _ in range(5)] == [None] * 5


def test_refuses_the_next_hit_and_says_how_long_to_wait(limiter, clock) -> None:
    for _ in range(5):
        limiter.hit("1.1.1.1")
    clock.now += 20

    assert limiter.hit("1.1.1.1") == 40


def test_a_refused_hit_does_not_extend_the_wait(limiter, clock) -> None:
    for _ in range(5):
        limiter.hit("1.1.1.1")
    clock.now += 10
    limiter.hit("1.1.1.1")
    limiter.hit("1.1.1.1")

    assert limiter.hit("1.1.1.1") == 50


def test_the_window_slides_hit_by_hit(limiter, clock) -> None:
    limiter.hit("1.1.1.1")
    clock.now += 30
    for _ in range(4):
        limiter.hit("1.1.1.1")

    clock.now += 29.9
    assert limiter.hit("1.1.1.1") is not None
    clock.now += 0.1
    assert limiter.hit("1.1.1.1") is None
    assert limiter.hit("1.1.1.1") is not None


def test_everything_is_allowed_again_after_the_window(limiter, clock) -> None:
    for _ in range(5):
        limiter.hit("1.1.1.1")

    clock.now += 60

    assert [limiter.hit("1.1.1.1") for _ in range(5)] == [None] * 5


def test_each_key_has_its_own_count(limiter) -> None:
    for _ in range(5):
        limiter.hit("1.1.1.1")

    assert limiter.hit("2.2.2.2") is None
    assert limiter.hit("1.1.1.1") is not None


def test_the_wait_is_at_least_one_second(limiter, clock) -> None:
    for _ in range(5):
        limiter.hit("1.1.1.1")
    clock.now += 59.99

    assert limiter.hit("1.1.1.1") == 1


def test_reset_forgets_every_key(limiter) -> None:
    for _ in range(5):
        limiter.hit("1.1.1.1")

    limiter.reset()

    assert limiter.hit("1.1.1.1") is None


def test_the_login_limiter_uses_the_settings() -> None:
    assert login_limiter.attempts == settings.login_rate_limit_attempts
    assert login_limiter.window_seconds == settings.login_rate_limit_window_seconds


def test_the_defaults_are_five_attempts_per_minute(monkeypatch) -> None:
    monkeypatch.delenv("LOGIN_RATE_LIMIT_ATTEMPTS", raising=False)
    monkeypatch.delenv("LOGIN_RATE_LIMIT_WINDOW_SECONDS", raising=False)

    defaults = Settings(_env_file=None)

    assert defaults.login_rate_limit_attempts == 5
    assert defaults.login_rate_limit_window_seconds == 60


def test_the_limit_and_window_come_from_the_environment(monkeypatch) -> None:
    monkeypatch.setenv("LOGIN_RATE_LIMIT_ATTEMPTS", "3")
    monkeypatch.setenv("LOGIN_RATE_LIMIT_WINDOW_SECONDS", "900")

    configured = Settings()

    assert configured.login_rate_limit_attempts == 3
    assert configured.login_rate_limit_window_seconds == 900
