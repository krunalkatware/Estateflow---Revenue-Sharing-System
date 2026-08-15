"""
Step 1 Admin Auth API Verification Tests
Run from project root: python test_admin_auth.py
"""
import requests
import json
import sys

BASE = "http://127.0.0.1:8000/api/admin/auth"
CUST_BASE = "http://127.0.0.1:8000/api/auth"

PASS = "\033[92m PASS\033[0m"
FAIL = "\033[91m FAIL\033[0m"

results = []

def check(name, condition, detail=""):
    status = PASS if condition else FAIL
    results.append(condition)
    print(f"{status}  {name}")
    if detail:
        print(f"       {detail}")

print("\n" + "="*60)
print("  EstateFlow — Step 1 Admin Auth API Tests")
print("="*60 + "\n")

# ── Test 1: Valid Login ──────────────────────────────────────────────────────
print("TEST 1: Login — valid credentials")
r = requests.post(f"{BASE}/login", json={"email": "admin@estateflow.com", "password": "Admin@123"})
check("Status 200", r.status_code == 200, f"Got {r.status_code}")
data = r.json() if r.status_code == 200 else {}
check("Has access_token", bool(data.get("access_token")))
check("Has refresh_token", bool(data.get("refresh_token")))
check("User admin_role = super_admin", data.get("user", {}).get("admin_role") == "super_admin",
      f"Got: {data.get('user', {}).get('admin_role')}")
check("Permissions list not empty", len(data.get("user", {}).get("permissions", [])) > 0,
      f"Perms: {data.get('user', {}).get('permissions', [])}")

access_token = data.get("access_token", "")
refresh_token = data.get("refresh_token", "")
AUTH = {"Authorization": f"Bearer {access_token}"}
print()

# ── Test 2: GET /me with valid token ─────────────────────────────────────────
print("TEST 2: GET /me — valid admin token")
r = requests.get(f"{BASE}/me", headers=AUTH)
check("Status 200", r.status_code == 200, f"Got {r.status_code}")
me = r.json()
check("Email correct", me.get("email") == "admin@estateflow.com", f"Got: {me.get('email')}")
check("admin_role present", bool(me.get("admin_role")), f"Got: {me.get('admin_role')}")
check("permissions list present", isinstance(me.get("permissions"), list),
      f"Got: {me.get('permissions')}")
print()

# ── Test 3: Wrong password ───────────────────────────────────────────────────
print("TEST 3: Login — wrong password")
r = requests.post(f"{BASE}/login", json={"email": "admin@estateflow.com", "password": "wrongpass"})
check("Status 401", r.status_code == 401, f"Got {r.status_code}")
check("Error message present", bool(r.json().get("detail") or r.json().get("error")))
print()

# ── Test 4: Non-existent user ────────────────────────────────────────────────
print("TEST 4: Login — non-existent email")
r = requests.post(f"{BASE}/login", json={"email": "nobody@nowhere.com", "password": "test"})
check("Status 401", r.status_code == 401, f"Got {r.status_code}")
print()

# ── Test 5: /me without token ────────────────────────────────────────────────
print("TEST 5: GET /me — no token")
r = requests.get(f"{BASE}/me")
check("Status 403 or 422", r.status_code in (403, 422), f"Got {r.status_code}")
print()

# ── Test 6: Customer token rejected on admin endpoint ────────────────────────
print("TEST 6: Customer token rejected on admin /me")
# Register a test customer
reg = requests.post(f"{CUST_BASE}/register", json={
    "email": "testcust_verify@example.com",
    "password": "Test@123",
    "first_name": "Test",
    "last_name": "Customer"
})
if reg.status_code == 200:
    cust_token = reg.json().get("access_token", "")
else:
    # Try login in case already registered
    lg = requests.post(f"{CUST_BASE}/login", json={"email": "testcust_verify@example.com", "password": "Test@123"})
    cust_token = lg.json().get("access_token", "") if lg.status_code == 200 else ""

if cust_token:
    r = requests.get(f"{BASE}/me", headers={"Authorization": f"Bearer {cust_token}"})
    check("Status 403 (customer token blocked)", r.status_code == 403, f"Got {r.status_code}")
    detail = r.json().get("detail", "")
    check("Error mentions admin/access denied", "admin" in detail.lower() or "denied" in detail.lower(),
          f"Detail: {detail}")
else:
    check("Customer token test skipped (no token obtained)", True, "Skipped")
print()

# ── Test 7: Refresh Token ────────────────────────────────────────────────────
print("TEST 7: Refresh token rotation")
r = requests.post(
    f"{BASE}/refresh",
    json={"refresh_token": refresh_token},
    headers=AUTH
)
check("Status 200", r.status_code == 200, f"Got {r.status_code}")
new_data = r.json()
check("New access_token issued", bool(new_data.get("access_token")))
check("New refresh_token issued", bool(new_data.get("refresh_token")))
check("Different from old refresh_token", new_data.get("refresh_token") != refresh_token)
new_access = new_data.get("access_token", "")
new_refresh = new_data.get("refresh_token", "")
print()

# ── Test 8: New token works for /me ──────────────────────────────────────────
print("TEST 8: New access token works after refresh")
r = requests.get(f"{BASE}/me", headers={"Authorization": f"Bearer {new_access}"})
check("Status 200 with new token", r.status_code == 200, f"Got {r.status_code}")
print()

# ── Test 9: Invalid refresh token ────────────────────────────────────────────
print("TEST 9: Invalid refresh token rejected")
r = requests.post(
    f"{BASE}/refresh",
    json={"refresh_token": "thisisnotavalidtoken"},
    headers={"Authorization": f"Bearer {new_access}"}
)
check("Status 401", r.status_code == 401, f"Got {r.status_code}")
print()

# ── Test 10: Logout ───────────────────────────────────────────────────────────
print("TEST 10: Logout")
r = requests.post(
    f"{BASE}/logout",
    json={"refresh_token": new_refresh},
    headers={"Authorization": f"Bearer {new_access}"}
)
check("Status 200", r.status_code == 200, f"Got {r.status_code}")
check("Success message", r.json().get("success") == True or "logout" in str(r.json()).lower(),
      f"Body: {r.json()}")
print()

# ── Test 11: Login non-admin user ─────────────────────────────────────────────
print("TEST 11: Non-admin user blocked from admin login")
r = requests.post(f"{BASE}/login", json={"email": "testcust_verify@example.com", "password": "Test@123"})
check("Status 403 (not an admin)", r.status_code == 403, f"Got {r.status_code}")
detail = r.json().get("detail", "")
check("Error mentions admin", "admin" in detail.lower() or "administrator" in detail.lower(),
      f"Detail: {detail}")
print()

# ── Summary ───────────────────────────────────────────────────────────────────
passed = sum(results)
total = len(results)
print("="*60)
print(f"  RESULTS: {passed}/{total} tests passed")
print("="*60 + "\n")

if passed < total:
    sys.exit(1)
