"""create_commitment guards: only winnable bets, one live stake per task."""
from datetime import datetime, timedelta, timezone

from conftest import req, new_module, new_task, future


def stake(token, task_id, deadline, required_seconds=1800, pence=500):
    """No assert here — the refusals ARE the experiments."""
    return req("POST", f"/tasks/{task_id}/commitments/", token,
               {"stake_pence": pence, "deadline": deadline,
                "verification_type": "timer", "required_seconds": required_seconds})


def soon(minutes):
    return (datetime.now(timezone.utc) + timedelta(minutes=minutes)).isoformat()


def test_create_normal(token):
    mod = new_module(token)
    task = new_task(token, mod["id"])
    s, _ = stake(token, task["id"], future())
    assert s == 201


def test_deadline_sooner_than_required_refused(token):
    # 30 min of focus demanded, 5 min of clock available: unwinnable
    mod = new_module(token)
    task = new_task(token, mod["id"])
    s, _ = stake(token, task["id"], soon(5), required_seconds=1800)
    assert s == 400


def test_just_enough_time_allowed(token):
    # boundary: 31 min available for 30 min needed must still pass
    mod = new_module(token)
    task = new_task(token, mod["id"])
    s, _ = stake(token, task["id"], soon(31), required_seconds=1800)
    assert s == 201


def test_second_active_on_same_task_refused(token):
    mod = new_module(token)
    task = new_task(token, mod["id"])
    s, _ = stake(token, task["id"], future())
    assert s == 201
    s, _ = stake(token, task["id"], future())
    assert s == 409


def test_restake_after_cancel_allowed(token):
    # history must not lock a task: only LIVE money blocks a new stake
    mod = new_module(token)
    task = new_task(token, mod["id"])
    s, first = stake(token, task["id"], future())
    assert s == 201
    s, _ = req("POST", f"/commitments/{first['id']}/cancel", token)
    assert s == 200
    s, _ = stake(token, task["id"], future())
    assert s == 201
