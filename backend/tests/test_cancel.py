"""Cancel-endpoint test: the cooling-off triple plus edge cases.

Throwaway user, stdlib HTTP. The past-window case backdates created_at
with a raw SQL UPDATE (can't wait 5 real minutes), using the backend's
own DATABASE_URL from backend/.env.
"""
import json
import time
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone
from pathlib import Path
from sqlalchemy import create_engine, text
from conftest import req, make_commitment

def test_cancel_fresh_commitment(token):
    com = make_commitment(token)
    s, body = req("POST", f"/commitments/{com['id']}/cancel", token)
    assert s == 200
    assert body["status"] == "cancelled"

def test_cancel_twice(token):
    com = make_commitment(token) 
    req("POST", f"/commitments/{com['id']}/cancel", token) 
    s, _ = req("POST", f"/commitments/{com['id']}/cancel", token)
    assert s == 409

def test_cancel_completed(token):
    com = make_commitment(token) 
    s,_ = req("POST", f"/commitments/{com['id']}/checkins/", token,{"focus_seconds":60})
    assert s == 201 
    s, _ = req("POST", f"/commitments/{com['id']}/cancel", token)
    assert s == 409

def test_cancel_unknown(token):
    # no make_commitment at all — that's the point of this one
    s, _ = req("POST", "/commitments/999999/cancel", token)
    assert s == 404

"""
    find database address
    __file__ means this file, the file that youre in, test_cancel.py
    .resolve() = "c:\StartUp apps\Project 2\backend\tests\test_cancel.py"  (absolute)
    so doing parent[1] will poush the path up to /backend and /.env will then take the envb file out of backend
"""

ENV_PATH = Path(__file__).resolve().parents[1] / ".env" 
def database_url():
    for line in ENV_PATH.read_text().splitlines():
        if line.strip().lower().startswith("database_url"):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("DATABASE_URL not found")

def backdate(commitment_id, minutes=10):
    engine = create_engine(database_url())
    with engine.begin() as conn:
        conn.execute(
            text("UPDATE commitments SET created_at = created_at - interval '10 minutes' WHERE id = :id"),
            {"id": commitment_id},
        )

def test_cancel_past_window(token):
    com = make_commitment(token) 
    backdate(com["id"])
    s, _ = req("POST", f"/commitments/{com['id']}/cancel", token)
    assert s == 400  