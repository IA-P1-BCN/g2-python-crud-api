from pwdlib import PasswordHash

_password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Devuelve el hash de una contraseña en texto plano."""
    return _password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Comprueba si la contraseña coincide con su hash."""
    return _password_hash.verify(password, hashed_password)
