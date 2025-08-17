#!/usr/bin/env bash
set -euo pipefail

# Simple API smoke tests against the running Podman Compose stack.
# Requirements:
#  - podman compose up -d (services: postgres, redis, backend, gateway)
#  - curl, jq installed on host
#  - .env loaded or env vars exported (POSTGRES_*, REDIS_*, APP_PORT, GATEWAY_EXTERNAL_PORT, etc.)
#
# Usage:
#   chmod +x scripts/api-smoke.sh
#   ./scripts/api-smoke.sh            # default gateway http://localhost:${GATEWAY_EXTERNAL_PORT:-8080}
#   GATEWAY_URL=http://localhost:18080 ./scripts/api-smoke.sh
#
# Exit codes:
#   0 = all passed
#   >0 = one or more failures

GATEWAY_URL=${GATEWAY_URL:-"http://localhost:${GATEWAY_EXTERNAL_PORT:-8080}"}
USER_HEADER=${FCFS_USER_HEADER:-X-User-Id}

PASS_CT=0
FAIL_CT=0
FAILED=()

section() { echo -e "\n==== $* ===="; }
ok() { echo "[PASS] $1"; PASS_CT=$((PASS_CT+1)); }
fail() { echo "[FAIL] $1"; FAIL_CT=$((FAIL_CT+1)); FAILED+=("$1"); }

require_cmd() { command -v "$1" >/dev/null || { echo "Missing required command: $1"; exit 2; }; }
require_cmd curl

wait_http_200() {
  local url=$1; local name=$2; local max=${3:-30}; local i=0;
  while (( i < max )); do
    code=$(curl -s -o /dev/null -w '%{http_code}' "$url" || true)
    if [[ "$code" == "200" ]]; then ok "${name} healthy (200)"; return 0; fi
    sleep 1; i=$((i+1))
  done
  fail "${name} not healthy (last=$code)"; return 1
}

test_seat_list() {
  local code body json
  body=$(curl -s -w '\n%{http_code}' "$GATEWAY_URL/api/v1/seats/") || true
  code=$(echo "$body" | tail -n1)
  json=$(echo "$body" | sed '$d')
  if [[ "$code" == 200 && "$json" == *'"id"'* ]]; then
    ok "Seat list returns 200 with seat data"
  else
    fail "Seat list (code=$code)"
  fi
}

test_fcfs_success() {
  local code resp body
  resp=$(curl -s -w '\n%{http_code}' -X POST "$GATEWAY_URL/fcfs/join" \
    -H "Content-Type: application/json" \
    -H "$USER_HEADER: smoke-user-1" \
    -d '{"user_name":"smoke one","phone":"010"}') || true
  code=$(echo "$resp" | tail -n1)
  body=$(echo "$resp" | sed '$d')
  if [[ "$code" == 200 && "$body" == *'"success":true'* ]]; then
    ok "FCFS initial success"
  else
    fail "FCFS initial (code=$code body=$body)"
  fi
}

test_fcfs_duplicate() {
  local code resp body
  resp=$(curl -s -w '\n%{http_code}' -X POST "$GATEWAY_URL/fcfs/join" \
    -H "Content-Type: application/json" \
    -H "$USER_HEADER: smoke-user-1" \
    -d '{"user_name":"smoke one"}') || true
  code=$(echo "$resp" | tail -n1)
  body=$(echo "$resp" | sed '$d')
  if [[ "$code" =~ ^(200|409)$ && ("$body" == *'already_reserved'* || "$body" == *'duplicate'*) ]]; then
    ok "FCFS duplicate recognized"
  else
    fail "FCFS duplicate (code=$code body=$body)"
  fi
}

test_fcfs_missing_header() {
  local code resp
  resp=$(curl -s -w '\n%{http_code}' -X POST "$GATEWAY_URL/fcfs/join" \
    -H "Content-Type: application/json" \
    -d '{"user_name":"no header"}') || true
  code=$(echo "$resp" | tail -n1)
  if [[ "$code" == 400 ]]; then
    ok "FCFS missing header 400"
  else
    fail "FCFS missing header (code=$code)"
  fi
}

main() {
  section "Gateway health wait"
  wait_http_200 "$GATEWAY_URL/api/v1/seats/" "gateway" || true

  section "Seat list"
  test_seat_list

  section "FCFS success"
  test_fcfs_success

  section "FCFS duplicate"
  test_fcfs_duplicate

  section "FCFS missing header"
  test_fcfs_missing_header

  echo -e "\n==== SUMMARY ===="
  echo "Passed: $PASS_CT  Failed: $FAIL_CT"
  if (( FAIL_CT > 0 )); then
    printf 'Failed cases:\n'; printf ' - %s\n' "${FAILED[@]}"
    exit 1
  fi
  exit 0
}

main "$@"
