# Progress Log

Technical handoff notes for resuming work — see CLAUDE.md for the project's architecture/rules, this file is just "where did we leave off."

## Current state (2026-07-18)

Backend core (CLAUDE.md build step 2) is complete: auth + full CRUD for `modules`/`tasks`/`commitments`, tested end-to-end through Swagger UI against a live Neon Postgres database.

## What exists

Git repo initialized at the project root, committed incrementally — run `git log --oneline` for the full history.

`backend/app/`:
- `config.py` — loads `DATABASE_URL`, `SECRET_KEY`, `algorithm`, `access_token_expire_minutes` from `.env`
- `database.py` — SQLAlchemy `engine`, `SessionLocal`, `Base`, `get_db` dependency
- `models/` — `User`, `Module`, `Task` (+ `TaskKind` enum), `Commitment` (+ `CommitmentStatus`, `VerificationType` enums). All four are imported in `models/__init__.py` so SQLAlchemy can resolve cross-model relationships at startup — this matters, see gotchas below.
- `schemas/` — `UserCreate`/`UserOut`, `ModuleCreate`/`ModuleOut`, `TaskCreate`/`TaskOut`, `CommitmentCreate`/`CommitmentOut`
- `core/security.py` — password hashing (passlib + bcrypt) and JWT create/decode (python-jose)
- `core/deps.py` — `get_current_user` dependency: extracts + verifies the JWT, looks up the real user
- `routers/auth.py` — `POST /auth/register`, `POST /auth/login`
- `routers/modules.py` — `POST /modules/`, `GET /modules/` (scoped to the authenticated user)
- `routers/tasks.py` — `POST /modules/{module_id}/tasks`, `GET /modules/{module_id}/tasks` (ownership checked through the parent module)
- `routers/commitments.py` — `POST /tasks/{task_id}/commitments`, `GET /tasks/{task_id}/commitments` (ownership checked through task → module)
- `main.py` — wires all routers + model registration together

Neon Postgres has all four tables created (via a one-off `Base.metadata.create_all()` — **no Alembic migrations yet**, deliberately deferred until the schema needs to actually change after real data exists).

One real test user exists: `malachi@example.com` (id 1), plus a few test modules/tasks/commitments created while verifying each router.

## Environment gotchas (things that already bit us once)

- **Always run the server with `uvicorn app.main:app --reload` from inside `backend/`.** Never the VS Code ▷ Run button or `python app/main.py` directly on any file inside `app/` — both break imports, since `app` is only importable when `backend/` is the working directory.
- **`bcrypt` is pinned to `4.0.1`** in `requirements.txt`. Newer `bcrypt` releases break `passlib` (unmaintained since 2020) — don't let this get unpinned by an unrelated `pip install --upgrade`.
- **`access_token_expire_minutes` is `15`.** Swagger UI's "Authorize" token goes stale quickly during a long debugging session — a `401 "Invalid or expired"` often just means re-click Authorize and log in again, not a real bug.
- **All four model files must stay imported together** (via `models/__init__.py` + `from app import models` in `main.py`). SQLAlchemy resolves `relationship("Task")`-style string references by scanning whatever classes have actually been imported somewhere in the process — skip importing one model and every mapper fails to configure the moment any query runs.
- **`ForeignKey("tablename.column")` uses the actual DB table name** (`tasks`, plural), **`relationship("ClassName")` uses the Python class name** (`Task`, singular). Easy to mix up; SQLAlchemy's error messages for this are a bit cryptic (`NoReferencedTableError`).
- **`.env` holds the real Neon connection string and secret key** — confirmed never committed (`.gitignore` + `git check-ignore` both checked). Never paste its contents into a chat session.

## Next step

Build step 3 from CLAUDE.md: **the deadline worker** — an APScheduler job that finds `active` commitments past their `deadline` with no valid check-in, marks them `failed`, writes a `transactions` ledger row, and (eventually) triggers a Stripe charge + Expo push. CLAUDE.md calls this "the one genuinely new backend concept" in the project.

This will need two new SQLAlchemy models that don't exist yet — `Checkin` and `Transaction` — deliberately not built yet, following CLAUDE.md's "work top to bottom" build sequence.

## Working style reminder

Malachi writes all the code himself. The assistant explains concepts and gives direction in chat, but does not use Write/Edit to generate backend/app source files on his behalf — see CLAUDE.md's "Working style" section.
