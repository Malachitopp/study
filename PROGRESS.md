# Progress Log

Technical handoff notes for resuming work — see CLAUDE.md for the project's architecture/rules, this file is just "where did we leave off."

## Current state (2026-07-18)

Backend core (CLAUDE.md build step 2) **and** the deadline worker (build step 3) are both complete. Auth + full CRUD for `modules`/`tasks`/`commitments` tested end-to-end through Swagger UI against a live Neon Postgres database; an APScheduler job runs every minute inside the FastAPI process, automatically finding overdue `active` commitments, marking them `failed`, and writing `transactions` ledger rows — verified working with zero manual intervention.

## What exists

Git repo initialized at the project root, committed incrementally — run `git log --oneline` for the full history.

`backend/app/`:
- `config.py` — loads `DATABASE_URL`, `SECRET_KEY`, `algorithm`, `access_token_expire_minutes` from `.env`
- `database.py` — SQLAlchemy `engine`, `SessionLocal`, `Base`, `get_db` dependency
- `models/` — `User`, `Module`, `Task` (+ `TaskKind` enum), `Commitment` (+ `CommitmentStatus`, `VerificationType` enums), `Checkin` (`commitment_id`, `submitted_at`, `evidence_url`, `focus_seconds` — the latter two both nullable, since a check-in only has one or the other depending on the commitment's `verification_type`), `Transaction` (the append-only ledger: `commitment_id`, `amount_pence`, `stripe_payment_id`, `reason`). All six are imported in `models/__init__.py` so SQLAlchemy can resolve cross-model relationships at startup — this matters, see gotchas below.
- `schemas/` — `UserCreate`/`UserOut`, `ModuleCreate`/`ModuleOut`, `TaskCreate`/`TaskOut`, `CommitmentCreate`/`CommitmentOut` (no `Checkin`/`Transaction` schemas yet — no routes touch them directly)
- `core/security.py` — password hashing (passlib + bcrypt) and JWT create/decode (python-jose)
- `core/deps.py` — `get_current_user` dependency: extracts + verifies the JWT, looks up the real user
- `routers/auth.py` — `POST /auth/register`, `POST /auth/login`
- `routers/modules.py` — `POST /modules/`, `GET /modules/` (scoped to the authenticated user)
- `routers/tasks.py` — `POST /modules/{module_id}/tasks`, `GET /modules/{module_id}/tasks` (ownership checked through the parent module)
- `routers/commitments.py` — `POST /tasks/{task_id}/commitments`, `GET /tasks/{task_id}/commitments` (ownership checked through task → module)
- `worker.py` — `process_deadlines()`: finds `active` commitments past `deadline` with no check-in, marks them `failed`, writes a `Transaction` row. Uses its own `SessionLocal()` directly (not `Depends(get_db)`, since it's not triggered by an HTTP request)
- `main.py` — wires all routers together, imports `app.models` so every model registers at startup, and its `lifespan` context manager starts a `BackgroundScheduler` (APScheduler) that calls `process_deadlines` every 1 minute for the life of the app process. Same `yield`-splits-setup-from-teardown shape as `get_db`, applied to the whole app instead of one request.

Neon Postgres has all six tables created (via a one-off `Base.metadata.create_all()` — **no Alembic migrations yet**, deliberately deferred). Note: `create_all()` only creates missing tables, it never alters an existing one — we hit this directly when `Transaction.stripe_payment_id`'s type got fixed in the Python model (`Integer` → `String`) but the already-existing Postgres column stayed `Integer` until the table was manually dropped and recreated. The next schema change to an existing table (not a brand new one) is the real trigger to finally set up Alembic properly.

One real test user exists: `malachi@example.com` (id 1), plus various test modules/tasks/commitments/transactions created while verifying each router and the worker.

## Environment gotchas (things that already bit us once)

- **Always run the server with `uvicorn app.main:app --reload` from inside `backend/`.** Never the VS Code ▷ Run button or `python app/main.py` directly on any file inside `app/` — both break imports, since `app` is only importable when `backend/` is the working directory.
- **`bcrypt` is pinned to `4.0.1`** in `requirements.txt`. Newer `bcrypt` releases break `passlib` (unmaintained since 2020) — don't let this get unpinned by an unrelated `pip install --upgrade`.
- **`access_token_expire_minutes` is `15`.** Swagger UI's "Authorize" token goes stale quickly during a long debugging session — a `401 "Invalid or expired"` often just means re-click Authorize and log in again, not a real bug.
- **All four model files must stay imported together** (via `models/__init__.py` + `from app import models` in `main.py`). SQLAlchemy resolves `relationship("Task")`-style string references by scanning whatever classes have actually been imported somewhere in the process — skip importing one model and every mapper fails to configure the moment any query runs.
- **`ForeignKey("tablename.column")` uses the actual DB table name** (`tasks`, plural), **`relationship("ClassName")` uses the Python class name** (`Task`, singular). Easy to mix up; SQLAlchemy's error messages for this are a bit cryptic (`NoReferencedTableError`).
- **Both sides of a `back_populates` pair must name each other exactly** — `A.b = relationship("B", back_populates="a")` requires `B` to have an attribute literally named `a`. Got this wrong twice (`Module`/`Task`, then `Commitment`/`Checkin`/`Transaction`) — a mismatch doesn't fail until the first real query anywhere in the app, and the error (`Mapper 'X' has no property 'y'`) can look unrelated to the actual broken pair.
- **`Base.metadata.create_all()` only creates missing tables — it never alters an existing one.** Changing a column's type (or any other property) on a model that already has a live table requires either dropping and recreating that table (fine for disposable test data) or a real Alembic migration (needed once real data exists). Hit this directly with `Transaction.stripe_payment_id`.
- **`.env` holds the real Neon connection string and secret key** — confirmed never committed (`.gitignore` + `git check-ignore` both checked). Never paste its contents into a chat session.

## Next step

Build step 4 from CLAUDE.md: **React basics + Expo setup** — components, props, state, `useEffect` fetching from the backend API just built. Budget ~a week of feeling lost before it clicks, per CLAUDE.md.

Note the deadline worker currently only handles the *failure* path (marks `failed` + writes a ledger row). It doesn't yet trigger a real Stripe charge or Expo push — those come later (build steps 6/7), and `Transaction.stripe_payment_id` is deliberately left `None` until then. Also unbuilt: any endpoint for actually creating a `Checkin` (the `Checkin` model exists, but nothing writes to it yet) — that arrives with build step 5 (core loop) and step 6 (photo check-ins).

## Working style reminder

Malachi writes all the code himself. The assistant explains concepts and gives direction in chat, but does not use Write/Edit to generate backend/app source files on his behalf — see CLAUDE.md's "Working style" section.
