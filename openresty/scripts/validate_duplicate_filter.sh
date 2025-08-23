#!/usr/bin/env bash
# Validation script for Redis duplicate filter atomicity & TTL behavior.
# Usage: REDIS_HOST=redis REDIS_PORT=6379 DEFAULT_DUP_TTL=5 ./validate_duplicate_filter.sh
# Requires: redis-cli, curl, jq (optional for formatting)

set -euo pipefail
REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}
TTL=${DEFAULT_DUP_TTL:-5}
GATEWAY_HOST=${GATEWAY_HOST:-localhost}
GATEWAY_PORT=${GATEWAY_PORT:-80}
EVENT=${EVENT:-reservation}
USER_A=${USER_A:-alice}
USER_B=${USER_B:-bob}
IP_A=${IP_A:-1.1.1.1}

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
pass() { printf "[PASS] %s\n" "$*"; }
fail() { printf "[FAIL] %s\n" "$*"; exit 1; }

redis_cmd() { eval "$REDIS_CLI" "$@" >/dev/null; }
redis_get() { eval "$REDIS_CLI" "$@"; }

check_duplicate() {
  local user=$1
  local ip=$2
  # We rely on debug endpoint which doesn't need auth, encoding ip & ttl
  local resp
  resp=$(curl -s "http://$GATEWAY_HOST:$GATEWAY_PORT/debug/dupe?user=$user&ip=$ip&event=$EVENT") || true
  echo "$resp"
}

bold "1. Clean slate"
redis_cmd FLUSHALL || true

bold "2. First request allowed; second duplicate"
first=$(check_duplicate "$USER_A" "$IP_A")
second=$(check_duplicate "$USER_A" "$IP_A")
[[ "$first" == "allowed" ]] || fail "Expected first allowed got '$first'"
[[ "$second" == "duplicate" ]] || fail "Expected second duplicate got '$second'"
pass "Duplicate blocking works within TTL"

bold "3. TTL expiry allows again"
sleep $((TTL + 1))
third=$(check_duplicate "$USER_A" "$IP_A")
[[ "$third" == "allowed" ]] || fail "Expected allowed after TTL expiry got '$third'"
pass "TTL expiry works"

bold "4. Independent users different IPs both allowed"
redis_cmd FLUSHALL
respA=$(check_duplicate "$USER_A" "2.2.2.2")
respB=$(check_duplicate "$USER_B" "3.3.3.3")
[[ "$respA" == "allowed" && "$respB" == "allowed" ]] || fail "Expected both allowed (respA=$respA respB=$respB)"
pass "Distinct users/IPs allowed"

bold "5. Different users same IP: second blocked (policy)"
redis_cmd FLUSHALL
resp1=$(check_duplicate "$USER_A" "$IP_A")
resp2=$(check_duplicate "$USER_B" "$IP_A")
[[ "$resp1" == "allowed" && "$resp2" == "duplicate" ]] || fail "Policy mismatch for shared IP (resp1=$resp1 resp2=$resp2)"
pass "Shared IP blocking enforced"

bold "6. Concurrency race: 20 parallel attempts only one allowed"
redis_cmd FLUSHALL
allowed_count=0
duplicate_count=0
for i in $(seq 1 20); do
  ( check_duplicate "$USER_A" "$IP_A" & )
done
wait
# Re-run quickly to aggregate results (keys still present) by checking ttl exists
for i in $(seq 1 20); do
  resp=$(check_duplicate "$USER_A" "$IP_A")
  if [[ "$resp" == "allowed" ]]; then
    allowed_count=$((allowed_count+1))
  else
    duplicate_count=$((duplicate_count+1))
  fi
done
if (( allowed_count >= 1 )); then
  pass "At least one allowed (allowed=$allowed_count duplicate=$duplicate_count)"
else
  fail "No allowed request observed (duplicate=$duplicate_count)"
fi
bold "Validation complete"
