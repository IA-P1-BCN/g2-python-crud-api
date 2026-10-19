import pytest
from pydantic import BaseModel, ValidationError

from app.schemas.password import PASSWORD_RULE, StrongPassword, check_password_strength


class _Form(BaseModel):
    password: StrongPassword


@pytest.mark.parametrize("password", ["Athletica123!", "Abcdef1?", "Ñandú2026#", "Pass word1!"])
def test_strong_passwords_are_accepted(password: str) -> None:
    assert check_password_strength(password) == password


@pytest.mark.parametrize(
    ("password", "missing"),
    [
        ("Ab1!", "8 characters"),
        ("athletica123!", "an uppercase letter"),
        ("ATHLETICA123!", "a lowercase letter"),
        ("Athletica!!!", "a digit"),
        ("Athletica123", "a special character"),
        ("Athletica 123", "a special character (spaces do not count)"),
    ],
)
def test_weak_passwords_are_rejected(password: str, missing: str) -> None:
    with pytest.raises(ValidationError) as error:
        _Form(password=password)

    [detail] = error.value.errors()
    assert detail["type"] == "weak_password", missing
    assert detail["msg"] == PASSWORD_RULE


def test_the_message_lists_every_condition() -> None:
    for condition in ("8 caracteres", "mayúscula", "minúscula", "número", "carácter especial"):
        assert condition in PASSWORD_RULE


def test_passwords_longer_than_the_maximum_are_rejected() -> None:
    with pytest.raises(ValidationError):
        _Form(password="Aa1!" + "x" * 130)
