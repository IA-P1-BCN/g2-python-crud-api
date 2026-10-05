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
