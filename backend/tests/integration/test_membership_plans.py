import pytest

PLANS_URL = "/api/v1/membership-plans"


def _plan_payload(**overrides) -> dict:
    return {"name": "Semestral", "price_cents": 17999, "duration_days": 180} | overrides


def test_create_plan(client) -> None:
    response = client.post(
        "/api/v1/membership-plans",
        json={"name": "Trimestral", "price_cents": 9999, "duration_days": 90},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Trimestral"
    assert body["is_active"] is True


def test_plan_price_must_be_positive(client) -> None:
    response = client.post(
        "/api/v1/membership-plans",
        json={"name": "Malo", "price_cents": 0, "duration_days": 30},
    )

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_duplicate_plan_name_returns_409(client) -> None:
    payload = {"name": "Anual", "price_cents": 10000, "duration_days": 365}
    client.post("/api/v1/membership-plans", json=payload)
    response = client.post("/api/v1/membership-plans", json=payload)

    assert response.status_code == 409


def test_list_and_delete_plan(client, plan) -> None:
    listed = client.get("/api/v1/membership-plans")
    assert listed.status_code == 200
    assert listed.json()["total"] >= 1

    deleted = client.delete(f"/api/v1/membership-plans/{plan.id}")
    assert deleted.status_code == 204
    assert client.get(f"/api/v1/membership-plans/{plan.id}").status_code == 404


# POST /membership-plans


@pytest.mark.parametrize("duration_days", [0, -30])
def test_plan_duration_must_be_positive(client, duration_days: int) -> None:
    response = client.post(PLANS_URL, json=_plan_payload(duration_days=duration_days))

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_plan_price_cannot_be_negative(client) -> None:
    response = client.post(PLANS_URL, json=_plan_payload(price_cents=-1))

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.parametrize("missing_field", ["name", "price_cents", "duration_days"])
def test_create_plan_requires_name_price_and_duration(client, missing_field: str) -> None:
    payload = _plan_payload()
    del payload[missing_field]

    response = client.post(PLANS_URL, json=payload)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_create_plan_name_cannot_be_empty(client) -> None:
    response = client.post(PLANS_URL, json=_plan_payload(name=""))

    assert response.status_code == 422


def test_create_plan_stores_optional_description(client) -> None:
    response = client.post(PLANS_URL, json=_plan_payload(description="Seis meses"))

    assert response.status_code == 201
    body = response.json()
    assert body["description"] == "Seis meses"
    assert body["price_cents"] == 17999
    assert body["duration_days"] == 180


# GET /membership-plans


def test_list_plans_is_paginated(client) -> None:
    for name in ("Mensual", "Trimestral", "Anual"):
        client.post(PLANS_URL, json=_plan_payload(name=name))

    response = client.get(PLANS_URL, params={"page": 2, "size": 2})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert body["pages"] == 2
    assert [item["name"] for item in body["items"]] == ["Anual"]


def test_list_plans_active_only_hides_inactive(client, plan) -> None:
    client.post(PLANS_URL, json=_plan_payload(is_active=False))

    everything = client.get(PLANS_URL)
    active = client.get(PLANS_URL, params={"active_only": True})

    assert everything.json()["total"] == 2
    assert [item["id"] for item in active.json()["items"]] == [plan.id]


# GET /membership-plans/{plan_id}


def test_get_plan(client, plan) -> None:
    response = client.get(f"{PLANS_URL}/{plan.id}")

    assert response.status_code == 200
    assert response.json()["name"] == "Mensual"


def test_get_unknown_plan_returns_404(client) -> None:
    response = client.get(f"{PLANS_URL}/9999")

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# PUT /membership-plans/{plan_id}


def test_update_plan(client, plan) -> None:
    response = client.put(
        f"{PLANS_URL}/{plan.id}", json={"price_cents": 4500, "description": "Nuevo precio"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["price_cents"] == 4500
    assert body["description"] == "Nuevo precio"
    assert body["name"] == "Mensual"
    assert body["duration_days"] == 30


def test_update_plan_can_deactivate_it(client, plan) -> None:
    response = client.put(f"{PLANS_URL}/{plan.id}", json={"is_active": False})

    assert response.status_code == 200
    assert response.json()["is_active"] is False


def test_update_plan_keeping_its_own_name_is_allowed(client, plan) -> None:
    response = client.put(f"{PLANS_URL}/{plan.id}", json={"name": "Mensual"})

    assert response.status_code == 200


def test_update_plan_to_an_existing_name_returns_409(client, plan) -> None:
    other = client.post(PLANS_URL, json=_plan_payload()).json()

    response = client.put(f"{PLANS_URL}/{other['id']}", json={"name": "Mensual"})

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"


@pytest.mark.parametrize("changes", [{"price_cents": 0}, {"duration_days": 0}, {"name": ""}])
def test_update_plan_validates_fields(client, plan, changes: dict) -> None:
    response = client.put(f"{PLANS_URL}/{plan.id}", json=changes)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_update_unknown_plan_returns_404(client) -> None:
    response = client.put(f"{PLANS_URL}/9999", json={"price_cents": 100})

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# DELETE /membership-plans/{plan_id}


def test_delete_unknown_plan_returns_404(client) -> None:
    response = client.delete(f"{PLANS_URL}/9999")

    assert response.status_code == 404
