import pytest

PAYMENTS_URL = "/api/v1/payments"
UNKNOWN_PAYMENT_URL = f"{PAYMENTS_URL}/999999"


def _payment_payload(member, membership, **overrides) -> dict:
    return {
        "user_id": member.id,
        "membership_id": membership.id,
        "amount_cents": 3999,
    } | overrides


@pytest.fixture()
def payment(client, member, active_membership) -> dict:
    return client.post(PAYMENTS_URL, json=_payment_payload(member, active_membership)).json()


# POST /payments


def test_create_payment(client, member, active_membership) -> None:
    response = client.post(PAYMENTS_URL, json=_payment_payload(member, active_membership))

    assert response.status_code == 201
    body = response.json()
    assert body["id"] > 0
    assert body["user_id"] == member.id
    assert body["membership_id"] == active_membership.id
    assert body["amount_cents"] == 3999
    assert body["created_at"]


def test_create_payment_is_pending_by_default(client, member, active_membership) -> None:
    response = client.post(PAYMENTS_URL, json=_payment_payload(member, active_membership))

    assert response.json()["status"] == "pending"


@pytest.mark.parametrize("status", ["pending", "paid", "failed"])
def test_create_payment_with_each_status(client, member, active_membership, status: str) -> None:
    response = client.post(
        PAYMENTS_URL, json=_payment_payload(member, active_membership, status=status)
    )

    assert response.status_code == 201
    assert response.json()["status"] == status


@pytest.mark.parametrize(
    "overrides",
    [
        {"amount_cents": 0},
        {"amount_cents": -100},
        {"amount_cents": "gratis"},
        {"status": "refunded"},
    ],
)
def test_create_payment_validates_fields(
    client, member, active_membership, overrides: dict
) -> None:
    response = client.post(
        PAYMENTS_URL, json=_payment_payload(member, active_membership, **overrides)
    )

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.parametrize("missing_field", ["user_id", "membership_id", "amount_cents"])
def test_create_payment_requires_user_membership_and_amount(
    client, member, active_membership, missing_field: str
) -> None:
    payload = _payment_payload(member, active_membership)
    del payload[missing_field]

    response = client.post(PAYMENTS_URL, json=payload)

    assert response.status_code == 422


@pytest.mark.parametrize("unknown_field", ["user_id", "membership_id"])
def test_create_payment_for_an_unknown_user_or_membership_returns_404(
    client, member, active_membership, unknown_field: str
) -> None:
    payload = _payment_payload(member, active_membership) | {unknown_field: 999999}

    response = client.post(PAYMENTS_URL, json=payload)

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_create_payment_on_the_membership_of_another_user_returns_422(
    client, trainer, active_membership
) -> None:
    response = client.post(PAYMENTS_URL, json=_payment_payload(trainer, active_membership))

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"
    assert client.get(PAYMENTS_URL).json()["total"] == 0


# GET /payments


def test_list_payments_is_paginated(client, member, active_membership) -> None:
    for amount in (1000, 2000, 3000):
        client.post(
            PAYMENTS_URL, json=_payment_payload(member, active_membership, amount_cents=amount)
        )

    response = client.get(PAYMENTS_URL, params={"page": 2, "size": 2})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert body["page"] == 2
    assert body["size"] == 2
    assert [item["amount_cents"] for item in body["items"]] == [3000]


def test_list_payments_without_payments_is_empty(client) -> None:
    body = client.get(PAYMENTS_URL).json()

    assert body["total"] == 0
    assert body["items"] == []


def test_list_payments_filters_by_status(client, member, active_membership) -> None:
    client.post(PAYMENTS_URL, json=_payment_payload(member, active_membership, status="paid"))
    client.post(PAYMENTS_URL, json=_payment_payload(member, active_membership, status="failed"))

    body = client.get(PAYMENTS_URL, params={"status_filter": "paid"}).json()

    assert body["total"] == 1
    assert body["items"][0]["status"] == "paid"


def test_list_payments_filters_by_user(client, payment, trainer) -> None:
    own = client.get(PAYMENTS_URL, params={"user_id": payment["user_id"]}).json()
    other = client.get(PAYMENTS_URL, params={"user_id": trainer.id}).json()

    assert own["total"] == 1
    assert other["total"] == 0


def test_list_payments_with_an_invalid_status_returns_422(client) -> None:
    response = client.get(PAYMENTS_URL, params={"status_filter": "refunded"})

    assert response.status_code == 422


# GET /payments/{id}


def test_get_payment(client, payment) -> None:
    response = client.get(f"{PAYMENTS_URL}/{payment['id']}")

    assert response.status_code == 200
    assert response.json() == payment


def test_get_unknown_payment_returns_404(client) -> None:
    response = client.get(UNKNOWN_PAYMENT_URL)

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# PUT /payments/{id}


def test_update_payment(client, payment) -> None:
    response = client.put(
        f"{PAYMENTS_URL}/{payment['id']}", json={"amount_cents": 4999, "status": "paid"}
    )

    assert response.status_code == 200
    assert response.json()["amount_cents"] == 4999
    assert response.json()["status"] == "paid"


def test_update_payment_changes_only_the_fields_sent(client, payment) -> None:
    response = client.put(f"{PAYMENTS_URL}/{payment['id']}", json={"status": "failed"})

    assert response.status_code == 200
    assert response.json()["status"] == "failed"
    assert response.json()["amount_cents"] == payment["amount_cents"]


@pytest.mark.parametrize("payload", [{"amount_cents": 0}, {"amount_cents": -1}, {"status": "x"}])
def test_update_payment_validates_fields(client, payment, payload: dict) -> None:
    response = client.put(f"{PAYMENTS_URL}/{payment['id']}", json=payload)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.parametrize("field", ["amount_cents", "status"])
def test_update_payment_with_a_null_field_returns_422(client, payment, field: str) -> None:
    response = client.put(f"{PAYMENTS_URL}/{payment['id']}", json={field: None})

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"
    assert client.get(f"{PAYMENTS_URL}/{payment['id']}").json() == payment


def test_update_unknown_payment_returns_404(client) -> None:
    response = client.put(UNKNOWN_PAYMENT_URL, json={"status": "paid"})

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# DELETE /payments/{id}


def test_delete_payment(client, payment) -> None:
    response = client.delete(f"{PAYMENTS_URL}/{payment['id']}")

    assert response.status_code == 204
    assert client.get(f"{PAYMENTS_URL}/{payment['id']}").status_code == 404


def test_delete_payment_keeps_the_membership(client, payment) -> None:
    client.delete(f"{PAYMENTS_URL}/{payment['id']}")

    assert client.get(f"/api/v1/memberships/{payment['membership_id']}").status_code == 200


def test_delete_unknown_payment_returns_404(client) -> None:
    response = client.delete(UNKNOWN_PAYMENT_URL)

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"
