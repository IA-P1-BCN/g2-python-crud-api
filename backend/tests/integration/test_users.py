def _user_payload(email: str = "nuevo@test.dev") -> dict:
    return {
        "email": email,
        "full_name": "Usuario Nuevo",
        "role": "member",
        "password": "password123",
    }


def test_create_and_get_user(client) -> None:
    response = client.post("/api/v1/users", json=_user_payload())
    assert response.status_code == 201

    body = response.json()
    assert body["email"] == "nuevo@test.dev"
    assert "password" not in body
    assert "hashed_password" not in body

    fetched = client.get(f"/api/v1/users/{body['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["full_name"] == "Usuario Nuevo"


def test_duplicate_email_returns_409(client) -> None:
    client.post("/api/v1/users", json=_user_payload())
    response = client.post("/api/v1/users", json=_user_payload())

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"


def test_unknown_user_returns_404(client) -> None:
    response = client.get("/api/v1/users/999999")

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_list_users_is_paginated(client, member) -> None:
    response = client.get("/api/v1/users", params={"page": 1, "size": 10})
    assert response.status_code == 200

    body = response.json()
    assert body["total"] >= 1
    assert body["page"] == 1
    assert body["size"] == 10
    assert isinstance(body["items"], list)


def test_update_and_delete_user(client) -> None:
    created = client.post("/api/v1/users", json=_user_payload()).json()

    updated = client.put(
        f"/api/v1/users/{created['id']}", json={"full_name": "Renombrado"}
    )
    assert updated.status_code == 200
    assert updated.json()["full_name"] == "Renombrado"

    deleted = client.delete(f"/api/v1/users/{created['id']}")
    assert deleted.status_code == 204

    assert client.get(f"/api/v1/users/{created['id']}").status_code == 404
