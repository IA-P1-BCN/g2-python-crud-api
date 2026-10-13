import pytest

CLASSES_URL = "/api/v1/classes"


def _class_payload(trainer_id: int, **overrides) -> dict:
    return {"name": "Pilates", "capacity": 10, "trainer_id": trainer_id} | overrides


# POST /classes


def test_create_class(client, trainer, room) -> None:
    response = client.post(CLASSES_URL, json=_class_payload(trainer.id, room_id=room.id))

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Pilates"
    assert body["capacity"] == 10
    assert body["trainer_id"] == trainer.id
    assert body["room_id"] == room.id
    assert body["is_active"] is True


def test_create_class_without_room(client, trainer) -> None:
    response = client.post(CLASSES_URL, json=_class_payload(trainer.id))

    assert response.status_code == 201
    assert response.json()["room_id"] is None


@pytest.mark.parametrize("capacity", [0, -5])
def test_create_class_capacity_must_be_positive(client, trainer, capacity: int) -> None:
    response = client.post(CLASSES_URL, json=_class_payload(trainer.id, capacity=capacity))

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.parametrize("missing_field", ["name", "capacity", "trainer_id"])
def test_create_class_requires_name_capacity_and_trainer(
    client, trainer, missing_field: str
) -> None:
    payload = _class_payload(trainer.id)
    del payload[missing_field]

    response = client.post(CLASSES_URL, json=payload)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_create_class_rejects_trainer_without_trainer_role(client, member) -> None:
    response = client.post(CLASSES_URL, json=_class_payload(member.id))

    assert response.status_code == 400
    assert response.json()["code"] == "business_rule"


def test_create_class_with_unknown_trainer_returns_404(client) -> None:
    response = client.post(CLASSES_URL, json=_class_payload(9999))

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_create_class_with_unknown_room_returns_404(client, trainer) -> None:
    response = client.post(CLASSES_URL, json=_class_payload(trainer.id, room_id=9999))

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# GET /classes


def test_list_classes_is_paginated(client, trainer) -> None:
    for name in ("Pilates", "Spinning", "Boxing"):
        client.post(CLASSES_URL, json=_class_payload(trainer.id, name=name))

    response = client.get(CLASSES_URL, params={"page": 2, "size": 2})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert body["pages"] == 2
    assert [item["name"] for item in body["items"]] == ["Boxing"]


def test_list_classes_filters_by_trainer(client, gym_class, trainer, admin) -> None:
    own = client.get(CLASSES_URL, params={"trainer_id": trainer.id})
    other = client.get(CLASSES_URL, params={"trainer_id": admin.id})

    assert [item["id"] for item in own.json()["items"]] == [gym_class.id]
    assert other.json()["total"] == 0


def test_list_classes_active_only_hides_inactive(client, gym_class, trainer) -> None:
    client.post(CLASSES_URL, json=_class_payload(trainer.id, is_active=False))

    everything = client.get(CLASSES_URL)
    active = client.get(CLASSES_URL, params={"active_only": True})

    assert everything.json()["total"] == 2
    assert [item["id"] for item in active.json()["items"]] == [gym_class.id]


# GET /classes/{class_id}


def test_get_class(client, gym_class) -> None:
    response = client.get(f"{CLASSES_URL}/{gym_class.id}")

    assert response.status_code == 200
    assert response.json()["name"] == "Yoga"


def test_get_unknown_class_returns_404(client) -> None:
    response = client.get(f"{CLASSES_URL}/9999")

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# PUT /classes/{class_id}


def test_update_class(client, gym_class) -> None:
    response = client.put(
        f"{CLASSES_URL}/{gym_class.id}", json={"name": "Yoga Flow", "capacity": 15}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Yoga Flow"
    assert body["capacity"] == 15
    assert body["trainer_id"] == gym_class.trainer_id


def test_update_class_can_deactivate_it(client, gym_class) -> None:
    response = client.put(f"{CLASSES_URL}/{gym_class.id}", json={"is_active": False})

    assert response.status_code == 200
    assert response.json()["is_active"] is False


def test_update_class_rejects_trainer_without_trainer_role(client, gym_class, member) -> None:
    response = client.put(f"{CLASSES_URL}/{gym_class.id}", json={"trainer_id": member.id})

    assert response.status_code == 400
    assert response.json()["code"] == "business_rule"


def test_update_class_capacity_must_be_positive(client, gym_class) -> None:
    response = client.put(f"{CLASSES_URL}/{gym_class.id}", json={"capacity": 0})

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_update_class_with_unknown_room_returns_404(client, gym_class) -> None:
    response = client.put(f"{CLASSES_URL}/{gym_class.id}", json={"room_id": 9999})

    assert response.status_code == 404


def test_update_unknown_class_returns_404(client) -> None:
    response = client.put(f"{CLASSES_URL}/9999", json={"name": "Ghost"})

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# DELETE /classes/{class_id}


def test_delete_class(client, gym_class) -> None:
    deleted = client.delete(f"{CLASSES_URL}/{gym_class.id}")

    assert deleted.status_code == 204
    assert client.get(f"{CLASSES_URL}/{gym_class.id}").status_code == 404


def test_delete_unknown_class_returns_404(client) -> None:
    response = client.delete(f"{CLASSES_URL}/9999")

    assert response.status_code == 404


def test_delete_class_with_schedules_returns_409(client, gym_class, schedule) -> None:
    response = client.delete(f"{CLASSES_URL}/{gym_class.id}")

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"
    assert client.get(f"{CLASSES_URL}/{gym_class.id}").status_code == 200
    assert client.get(f"/api/v1/class-schedules/{schedule.id}").status_code == 200


def test_class_can_be_deleted_after_its_schedules(client, gym_class, schedule) -> None:
    client.delete(f"/api/v1/class-schedules/{schedule.id}")

    response = client.delete(f"{CLASSES_URL}/{gym_class.id}")

    assert response.status_code == 204


# GET /classes/{class_id}/schedules


def test_list_class_schedules(client, gym_class, schedule) -> None:
    response = client.get(f"{CLASSES_URL}/{gym_class.id}/schedules")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["id"] == schedule.id
    assert body["items"][0]["class_id"] == gym_class.id


def test_list_schedules_of_unknown_class_returns_404(client) -> None:
    response = client.get(f"{CLASSES_URL}/9999/schedules")

    assert response.status_code == 404
