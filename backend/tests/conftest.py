import pytest
import json
import time
import urllib.request
import urllib.error 



BASE = "http://127.0.0.1:8000"


def req(method, path, token =None, body=None, form = False):
    url = BASE + path
    headers ={} 
    data = None 

    if token:
        headers["Authorization"] = "Bearer " + token
    if body is not None:
        if form:
            data = body.encode() 
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json" 

    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            raw = resp.read() 
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        raw = e.read() 
        try: 
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw.decode(errors="replace")
    

@pytest.fixture
def token():
    email = f"test_{int(time.time_ns())}@example.com"
    req("POST", "/auth/register", body={"email": email, "password": "pw123456"})
    status, tok = req("POST", "/auth/login", body=f"username={email}&password=pw123456", form=True)
    return tok["access_token"]


from datetime import datetime, timedelta, timezone

def future(days=1):
    """An ISO timestamp comfortably in the future — boringly valid setup data."""
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

def new_module(token, name="Test module"):
    s, mod = req("POST", "/modules/", token, {"name": name, "term": "T"})
    assert s == 201, f"module fixture failed: {s} {mod}"
    return mod

def new_task(token, module_id, title="test task", kind="reading"):
    s, task = req("POST", f"/modules/{module_id}/tasks/", token,
                  {"title": title, "kind": kind, "due_at": future()})
    assert s == 201, f"task fixture failed: {s} {task}"
    return task

def make_commitment(token, stake=500, required_seconds=60):
    deadline = (datetime.now(timezone.utc) + timedelta(days =1)).isoformat()
    _, mod = req("POST", "/modules/", token, {"name": "Test module", "term": "T"})
    _, task = req("POST", f"/modules/{mod['id']}/tasks/", token,
                  {"title":"test task", "kind": "revision", "due_at": deadline})
    s, com = req("POST", f"/tasks/{task['id']}/commitments/", token,
                 {"stake_pence": stake, "deadline": deadline,
                  "verification_type": "timer", "required_seconds": required_seconds})
    assert s == 201, f"fixture commitment failed: {s} {com}"
    return com