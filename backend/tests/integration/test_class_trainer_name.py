"""Trainer name in class responses (specs/486-trainer-name-in-class-responses.md)."""

from sqlalchemy import event

from app.core.security import hash_password
from app.models.gym_class import GymClass
from app.models.user import User, UserRole

CLASSES_URL = "/api/v1/classes"


def _trainer(db, email: str, full_name: str) -> User:
    user = User(
        email=email,
        full_name=full_name,
        role=UserRole.trainer,
        hashed_password=hash_password("password123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _classes(db, trainers: list[User], per_trainer: int) -> None:
    for trainer in trainers:
        for n in range(per_trainer):
            db.add(GymClass(name=f"Clase {trainer.id}-{n}", capacity=10, trainer_id=trainer.id))
    db.commit()


def test_the_list_brings_each_trainer_name(anon_client, db_session) -> None:
    laura = _trainer(db_session, "laura@test.dev", "Laura Gómez")
    marc = _trainer(db_session, "marc@test.dev", "Marc Puig")
    _classes(db_session, [laura, marc], per_trainer=2)

    items = anon_client.get(CLASSES_URL).json()["items"]

    names = {item["trainer_id"]: item["trainer_name"] for item in items}
    assert names == {laura.id: "Laura Gómez", marc.id: "Marc Puig"}


def test_one_class_without_a_session_brings_the_trainer_name(anon_client, gym_class) -> None:
    body = anon_client.get(f"{CLASSES_URL}/{gym_class.id}").json()

    assert body["trainer_name"] == gym_class.trainer.full_name


def test_creating_a_class_returns_the_trainer_name(client, trainer) -> None:
    response = client.post(
        CLASSES_URL, json={"name": "Pilates", "capacity": 10, "trainer_id": trainer.id}
    )

    assert response.status_code == 201
    assert response.json()["trainer_name"] == trainer.full_name


def test_changing_the_trainer_returns_the_new_name(client, db_session, gym_class) -> None:
    marc = _trainer(db_session, "marc@test.dev", "Marc Puig")

    response = client.put(f"{CLASSES_URL}/{gym_class.id}", json={"trainer_id": marc.id})

    assert response.status_code == 200
    assert response.json()["trainer_name"] == "Marc Puig"


def test_the_list_does_not_query_once_per_class(anon_client, db_session) -> None:
    """The number of queries is the same for 2 classes as for 12."""
    trainers = [_trainer(db_session, f"t{n}@test.dev", f"Entrenador {n}") for n in range(3)]

    def queries_for_list() -> int:
        statements: list[str] = []
        engine = db_session.get_bind()

        def count(conn, cursor, statement, *args) -> None:
            statements.append(statement)

        # Forget the objects already loaded, as a fresh request would
        db_session.expunge_all()
        event.listen(engine, "before_cursor_execute", count)
        try:
            assert anon_client.get(CLASSES_URL).status_code == 200
        finally:
            event.remove(engine, "before_cursor_execute", count)
        return len(statements)

    _classes(db_session, trainers[:1], per_trainer=2)
    few = queries_for_list()
    _classes(db_session, trainers, per_trainer=4)

    assert queries_for_list() == few


def test_the_api_schema_declares_the_trainer_name(anon_client) -> None:
    schema = anon_client.get("/openapi.json").json()["components"]["schemas"]["GymClassRead"]

    assert "trainer_name" in schema["required"]
    assert schema["properties"]["trainer_name"]["type"] == "string"
