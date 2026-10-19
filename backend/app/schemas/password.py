"""Strength rule for new passwords, shared by every schema that sets one.

Login does not use it, so accounts created before the rule existed can still log in.
"""

from typing import Annotated

from pydantic import AfterValidator, Field
from pydantic_core import PydanticCustomError

MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128

PASSWORD_RULE = (
    f"La contraseña debe tener al menos {MIN_PASSWORD_LENGTH} caracteres, una mayúscula, "
    "una minúscula, un número y un carácter especial"
)


def _has_special_character(value: str) -> bool:
    return any(not char.isalnum() and not char.isspace() for char in value)


def check_password_strength(value: str) -> str:
    """Return the password unchanged, or raise a validation error with the rule."""
    if (
        len(value) < MIN_PASSWORD_LENGTH
        or not any(char.isupper() for char in value)
        or not any(char.islower() for char in value)
        or not any(char.isdigit() for char in value)
        or not _has_special_character(value)
    ):
        # A custom error keeps the message clean (no "Value error," prefix).
        raise PydanticCustomError("weak_password", PASSWORD_RULE)
    return value


StrongPassword = Annotated[
    str,
    Field(max_length=MAX_PASSWORD_LENGTH, description=PASSWORD_RULE),
    AfterValidator(check_password_strength),
]
