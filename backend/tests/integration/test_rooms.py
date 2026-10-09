import pytest

ROOMS_URL = "/api/v1/rooms"
UNKNOWN_ROOM_URL = f"{ROOMS_URL}/999999"


def _room_payload(**overrides) -> dict:
    return {"name": "Sala Nueva", "capacity": 15} | overrides


# POST /rooms


def test_create_room(client) -> None:
    response = client.post(ROOMS_URL, json=_room_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["id"] > 0
    assert body["name"] == "Sala Nueva"
    assert body["capacity"] == 15


def test_create_room_with_an_existing_name_returns_409(client, room) -> None:
    response = client.post(ROOMS_URL, json=_room_payload(name=room.name))

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"


@pytest.mark.parametrize(
    "overrides",
    [
        {"name": ""},
        {"name": "x" * 121},
        {"capacity": 0},
        {"capacity": -5},
        {"capacity": "muchas"},
    ],
)
def test_create_room_validates_fields(client, overrides: dict) -> None:
    response = client.post(ROOMS_URL, json=_room_payload(**overrides))

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.parametrize("missing_field", ["name", "capacity"])
def test_create_room_requires_name_and_capacity(client, missing_field: str) -> None:
    payload = _room_payload()
    del payload[missing_field]

    response = client.post(ROOMS_URL, json=payload)

    assert response.status_code == 422


# GET /rooms


def test_list_rooms_is_paginated(client) -> None:
    for number in range(1, 4):
        client.post(ROOMS_URL, json=_room_payload(name=f"Sala {number}"))

    response = client.get(ROOMS_URL, params={"page": 2, "size": 2})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert body["page"] == 2
    assert body["size"] == 2
    assert [item["name"] for item in body["items"]] == ["Sala 3"]


def test_list_rooms_without_rooms_is_empty(client) -> None:
    body = client.get(ROOMS_URL).json()

    assert body["total"] == 0
    assert body["items"] == []


# GET /rooms/{id}


def test_get_room(client, room) -> None:
    response = client.get(f"{ROOMS_URL}/{room.id}")

    assert response.status_code == 200
    assert response.json() == {"id": room.id, "name": "Sala 1", "capacity": 20}


def test_get_unknown_room_returns_404(client) -> None:
    response = client.get(UNKNOWN_ROOM_URL)

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# PUT /rooms/{id}


def test_update_room(client, room) -> None:
    response = client.put(f"{ROOMS_URL}/{room.id}", json={"name": "Sala Grande", "capacity": 40})

    assert response.status_code == 200
    assert response.json() == {"id": room.id, "name": "Sala Grande", "capacity": 40}


def test_update_room_changes_only_the_fields_sent(client, room) -> None:
    response = client.put(f"{ROOMS_URL}/{room.id}", json={"capacity": 25})

    assert response.status_code == 200
    assert response.json()["name"] == "Sala 1"
    assert response.json()["capacity"] == 25


def test_update_room_with_the_name_of_another_room_returns_409(client, room) -> None:
    other = client.post(ROOMS_URL, json=_room_payload()).json()

    response = client.put(f"{ROOMS_URL}/{other['id']}", json={"name": room.name})

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"


def test_update_room_keeping_its_own_name_is_allowed(client, room) -> None:
    response = client.put(f"{ROOMS_URL}/{room.id}", json={"name": room.name, "capacity": 30})

    assert response.status_code == 200
    assert response.json()["capacity"] == 30


@pytest.mark.parametrize("payload", [{"name": ""}, {"capacity": 0}, {"capacity": -1}])
def test_update_room_validates_fields(client, room, payload: dict) -> None:
    response = client.put(f"{ROOMS_URL}/{room.id}", json=payload)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_update_unknown_room_returns_404(client) -> None:
    response = client.put(UNKNOWN_ROOM_URL, json={"capacity": 10})

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# DELETE /rooms/{id}


def test_delete_room(client, room) -> None:
    response = client.delete(f"{ROOMS_URL}/{room.id}")

    assert response.status_code == 204
    assert client.get(f"{ROOMS_URL}/{room.id}").status_code == 404


def test_delete_unknown_room_returns_404(client) -> None:
    response = client.delete(UNKNOWN_ROOM_URL)

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"
