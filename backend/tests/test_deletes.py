"""Delete/archive policy: commitments are the boundary.

Active commitments -> 409. Any commitment history -> soft-archive
(row survives, vanishes from lists). Virgin -> hard delete.
"""
from conftest import req, new_module, new_task, future


def stake(token, task_id):
    s, com = req("POST", f"/tasks/{task_id}/commitments/", token,
                 {"stake_pence": 500, "deadline": future(),
                  "verification_type": "timer", "required_seconds": 60})
    assert s == 201, f"stake fixture failed: {s} {com}"
    return com


# --- modules ---

def test_delete_empty_module(token):
    mod = new_module(token)
    s, _ = req("DELETE", f"/modules/{mod['id']}", token)
    assert s == 204
    _, mods = req("GET", "/modules/", token)
    assert not any(m["id"] == mod["id"] for m in mods)


def test_delete_module_with_free_task(token):
    # the case that 500s on the FK if children aren't deleted first
    mod = new_module(token)
    new_task(token, mod["id"])
    s, _ = req("DELETE", f"/modules/{mod['id']}", token)
    assert s == 204


def test_delete_staked_module_refused(token):
    mod = new_module(token)
    task = new_task(token, mod["id"])
    com = stake(token, task["id"])

    s, _ = req("DELETE", f"/modules/{mod['id']}", token)
    assert s == 409

    # wreckage check: a refusal changes nothing
    _, mods = req("GET", "/modules/", token)
    assert any(m["id"] == mod["id"] for m in mods)
    _, tasks = req("GET", "/tasks/", token)
    assert any(t["id"] == task["id"] for t in tasks)
    _, coms = req("GET", "/commitments/", token)
    assert any(c["id"] == com["id"] for c in coms)


def test_delete_unknown_module(token):
    s, _ = req("DELETE", "/modules/999999", token)
    assert s == 404


def test_module_with_history_archives(token):
    # cancelled commitment = history, not live money: module leaves the
    # list (archived) instead of being refused or hard-deleted
    mod = new_module(token)
    task = new_task(token, mod["id"])
    com = stake(token, task["id"])
    s, _ = req("POST", f"/commitments/{com['id']}/cancel", token)
    assert s == 200

    s, _ = req("DELETE", f"/modules/{mod['id']}", token)
    assert s == 204
    _, mods = req("GET", "/modules/", token)
    assert not any(m["id"] == mod["id"] for m in mods)


# --- tasks ---

def test_delete_free_task(token):
    mod = new_module(token)
    task = new_task(token, mod["id"])
    s, _ = req("DELETE", f"/modules/{mod['id']}/tasks/{task['id']}", token)
    assert s == 204


def test_delete_staked_task_refused(token):
    mod = new_module(token)
    task = new_task(token, mod["id"])
    stake(token, task["id"])
    s, _ = req("DELETE", f"/modules/{mod['id']}/tasks/{task['id']}", token)
    assert s == 409


def test_delete_unknown_task(token):
    mod = new_module(token)
    s, _ = req("DELETE", f"/modules/{mod['id']}/tasks/999999", token)
    assert s == 404


def test_task_with_history_archives(token):
    mod = new_module(token)
    task = new_task(token, mod["id"])
    com = stake(token, task["id"])
    s, _ = req("POST", f"/commitments/{com['id']}/cancel", token)
    assert s == 200

    s, _ = req("DELETE", f"/modules/{mod['id']}/tasks/{task['id']}", token)
    assert s == 204
    # gone from both task lists: the scoped one and the flat one
    _, scoped = req("GET", f"/modules/{mod['id']}/tasks/", token)
    assert not any(t["id"] == task["id"] for t in scoped)
    _, flat = req("GET", "/tasks/", token)
    assert not any(t["id"] == task["id"] for t in flat)
