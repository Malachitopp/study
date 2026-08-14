"""GET /users/me: identity comes from the token, and only from a token."""
from conftest import req


def test_me_returns_own_account(account):
    s, body = req("GET", "/users/me", account["token"])
    assert s == 200
    # exact identity: THIS token must yield THIS email, not any plausible
    # test user — a wrong-user regression fails here
    assert body["email"] == account["email"]
    # pin the whole contract: exactly these keys, nothing leaking
    # (hashed_password, stripe_customer_id, expo_push_token) and nothing
    # missing that the client's Account type relies on
    assert set(body) == {"id", "email"}


def test_me_without_token_refused():
    s, _ = req("GET", "/users/me")
    assert s == 401


def test_me_garbage_token_refused():
    # exercises the JWT-decode failure path, which the missing-header case
    # never reaches (OAuth2PasswordBearer rejects that before decoding)
    s, _ = req("GET", "/users/me", token="not.a.jwt")
    assert s == 401
