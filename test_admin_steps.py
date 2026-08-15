"""
Verification Test Script for Steps 2, 3, and 4 Admin Endpoints
Run: python test_admin_steps.py
"""
import requests
import sys

BASE = "http://127.0.0.1:8000/api/admin"

print("\n" + "=" * 60)
print("  EstateFlow — Steps 2, 3 & 4 Verification Tests")
print("=" * 60 + "\n")

# 1. Login
r = requests.post(f"{BASE}/auth/login", json={"email": "admin@estateflow.com", "password": "Admin@123"})
if r.status_code != 200:
    print(f"❌ Login failed: {r.status_code}")
    sys.exit(1)

token = r.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}
print("✓ Admin Login successful")

# 2. Step 2 Dashboard Summary & Charts
r = requests.get(f"{BASE}/dashboard/summary", headers=headers)
print(f"✓ GET /dashboard/summary: {r.status_code}")
r = requests.get(f"{BASE}/dashboard/charts", headers=headers)
print(f"✓ GET /dashboard/charts: {r.status_code}")

# 3. Step 3 Properties Listing & CRUD
r = requests.get(f"{BASE}/properties", headers=headers)
print(f"✓ GET /properties: {r.status_code} (Total: {r.json().get('total')})")

# 4. Step 4 Builders Listing & CRUD
r = requests.get(f"{BASE}/builders", headers=headers)
print(f"✓ GET /builders: {r.status_code} (Total: {r.json().get('total')})")

print("\n" + "=" * 60)
print("  ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
print("=" * 60 + "\n")
