#!/usr/bin/env bash
set -euo pipefail

# FCFS 체인 스모크: /fcfs/join (게이트웨이) → /api/v1/seats/reservation/fcfs (예약)
#
# 기본 설정:
#   GATEWAY_URL                 (기본: http://localhost:${GATEWAY_EXTERNAL_PORT:-8080})
#   SEAT_LIST_PATH              (기본: /api/v1/seats)
#   FCFS_JOIN_PATH              (기본: /fcfs/join)           # 게이트웨이 엔드포인트
#   FCFS_RESERVE_PATH           (기본: /api/v1/seats/reservation/fcfs)  # 예약 엔드포인트
#   FCFS_USER_HEADER            (기본: X-User-Id)
#   FCFS_SEQ_HEADER             (기본: X-Fcfs-Seq)
#   ADMIN_TOKEN_HEADER          (기본: X-Admin-Token)
#   ADMIN_RESET_TOKEN           (옵션: 있으면 리셋 시도)
#   FCFS_JOIN_BODY              (기본: '{"user_name":"smoke user","phone":"010"}')
#   RESERVE_BODY                (기본: '{}')
#
# 사용:
#   chmod +x scripts/api-smoke.sh && ./scripts/api-smoke.sh
#   GATEWAY_URL=http://localhost:18080 ./scripts/api-smoke.sh

GATEWAY_URL=${GATEWAY_URL:-"http://localhost:${GATEWAY_EXTERNAL_PORT:-8080}"}
SEAT_LIST_PATH=${SEAT_LIST_PATH:-/api/v1/seats}
FCFS_JOIN_PATH=${FCFS_JOIN_PATH:-/fcfs/join}
FCFS_RESERVE_PATH=${FCFS_RESERVE_PATH:-/api/v1/seats/reservation/fcfs}

USER_HEADER=${FCFS_USER_HEADER:-X-User-Id}
SEQ_HEADER=${FCFS_SEQ_HEADER:-X-Fcfs-Seq}
ADMIN_TOKEN_HEADER=${ADMIN_TOKEN_HEADER:-X-Admin-Token}
ADMIN_TOKEN=${ADMIN_RESET_TOKEN:-}

FCFS_JOIN_BODY=${FCFS_JOIN_BODY:-'{"user_name":"smoke user","phone":"010"}'}
RESERVE_BODY=${RESERVE_BODY:-'{}'}

PASS_CT=0
FAIL_CT=0
FAILED=()

section() { echo -e "\n==== $* ===="; }
ok() { echo "[PASS] $1"; PASS_CT=$((PASS_CT+1)); }
fail() { echo "[FAIL] $1"; FAIL_CT=$((FAIL_CT+1)); FAILED+=("$1"); }

require_cmd() { command -v "$1" >/dev/null || { echo "Missing required command: $1"; exit 2; }; }
require_cmd curl
require_cmd jq
require_cmd awk
require_cmd sed
require_cmd tr

health() {
  local url=$1 name=$2 max=${3:-30} i=0 code=000
  while (( i < max )); do
    code=$(curl -s -o /dev/null -w '%{http_code}' "$url" || true)
    [[ "$code" == "200" ]] && { ok "${name} healthy (200)"; return 0; }
    sleep 1; ((i++))
  done
  fail "${name} not healthy (last=$code)"; return 1
}

admin_reset() {
  if [[ -n "$ADMIN_TOKEN" ]]; then
    local resp code body
    resp=$(curl -s -w '\n%{http_code}' -X POST \
      "$GATEWAY_URL/api/v1/seats/reset" \
      -H "$ADMIN_TOKEN_HEADER: $ADMIN_TOKEN" \
      -H 'Content-Type: application/json' -d '{}') || true
    code=$(echo "$resp" | tail -n1)
    body=$(echo "$resp" | sed '$d')
    if [[ "$code" == "200" ]] && echo "$body" | jq -e '.seatCount>=0 and (.sequence|type=="number")' >/dev/null 2>&1; then
      ok "Admin reset"
    else
      fail "Admin reset (code=$code body=$(echo "$body" | head -c 200))"
    fi
  else
    ok "Admin reset skipped (no ADMIN_RESET_TOKEN)"
  fi
}

seat_list() {
  local resp code body
  resp=$(curl -s -w '\n%{http_code}' "$GATEWAY_URL$SEAT_LIST_PATH") || true
  code=$(echo "$resp" | tail -n1)
  body=$(echo "$resp" | sed '$d')
  if [[ "$code" == "200" ]] && echo "$body" | jq -e 'type=="array"' >/dev/null 2>&1; then
    ok "Seat list ok"
  else
    fail "Seat list (code=$code body=$(echo "$body" | head -c 200))"
  fi
}

# ===== join_and_get_seq: 헤더/바디를 파일로 저장해 파싱 =====
join_and_get_seq() {
  local user=$1
  local H=$(mktemp) B=$(mktemp)
  local code seq body

  code=$(curl -s -D "$H" -o "$B" -w '%{http_code}' \
    -X POST "$GATEWAY_URL$FCFS_JOIN_PATH" \
    -H "Content-Type: application/json" \
    -H "$USER_HEADER: $user" \
    -d "$FCFS_JOIN_BODY" || true)

  # 헤더에서 X-Fcfs-Seq 추출
  seq=$(awk -v key="$(echo "$SEQ_HEADER" | tr '[:upper:]' '[:lower:]')" '
    BEGIN{IGNORECASE=1}
    tolower($1)==key":" {gsub("\r","",$2); print $2; exit}
  ' "$H")

  # 바디에서 .sequence 보강
  if [[ -z "$seq" ]]; then
    seq=$(jq -r 'try .sequence // empty' "$B" 2>/dev/null || true)
  fi

  body=$(cat "$B")
  rm -f "$H" "$B"

  echo "$code|$seq|$body"
}

# ===== test_flow_success: 위 함수 결과를 안전하게 사용 =====
test_flow_success() {
  local user="smoke-user-1" code seq body rcode rbody
  section "FCFS join → reserve (success)"

  IFS='|' read -r code seq body < <(join_and_get_seq "$user")

  if [[ "$code" != "200" ]]; then
    fail "FCFS join failed (code=$code body=$(echo "$body" | head -c 200))"
    return
  fi
  if [[ -z "$seq" ]]; then
    fail "FCFS join: sequence not found in header/body"
    return
  fi

  rbody=$(curl -s -X POST \
    "$GATEWAY_URL$FCFS_RESERVE_PATH" \
    -H "Content-Type: application/json" \
    -H "$USER_HEADER: $user" \
    -H "$SEQ_HEADER: $seq" \
    -d "$RESERVE_BODY" || true)
  rcode=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
    "$GATEWAY_URL$FCFS_RESERVE_PATH" \
    -H "Content-Type: application/json" \
    -H "$USER_HEADER: $user" \
    -H "$SEQ_HEADER: $seq" \
    -d "$RESERVE_BODY" || true)

  if [[ "$rcode" == "200" ]] && echo "$rbody" | jq -e '.success==true and (.seat|type=="object") and (.seat.id?!=null)' >/dev/null 2>&1; then
    ok "Reserve succeeded (user=$user, seq=$seq)"
  else
    fail "Reserve failed (code=$rcode body=$(echo "$rbody" | head -c 200))"
  fi
}

# 예약 호출
reserve_with_seq() {
  local user=$1 seq=$2 code=000 body
  resp=$(curl -s -w '\n%{http_code}' -X POST \
    "$GATEWAY_URL$FCFS_RESERVE_PATH" \
    -H "Content-Type: application/json" \
    -H "$USER_HEADER: $user" \
    -H "$SEQ_HEADER: $seq" \
    -d "$RESERVE_BODY") || true
  code=$(echo "$resp" | tail -n1)
  body=$(echo "$resp" | sed '$d')
  echo "$code" >&2
  echo "$body"
}

test_flow_duplicate() {
  local user="smoke-user-1" code body seq rcode rbody
  section "Duplicate: join or reserve should be rejected"
  # 다시 조인 (이미 예약한 사용자)
  # 1) 조인 자체에서 거부되거나(409/200+reason)
  resp=$(curl -s -w '\n%{http_code}' -X POST \
    "$GATEWAY_URL$FCFS_JOIN_PATH" \
    -H "Content-Type: application/json" \
    -H "$USER_HEADER: $user" \
    -d "$FCFS_JOIN_BODY" || true)
  code=$(echo "$resp" | tail -n1)
  body=$(echo "$resp" | sed '$d')

  if [[ "$code" == "409" ]] || ( [[ "$code" == "200" ]] && echo "$body" | jq -e '.success==false' >/dev/null 2>&1 ) \
     || echo "$body" | grep -Eiq 'duplicate|already_reserved|exists'; then
    ok "Duplicate recognized at join (code=$code)"
    return
  fi

  # 2) 조인이 허용됐다면 시퀀스 얻어 예약에서 거부되는지 확인
  seq=$( echo "$body" | jq -r 'try .sequence // empty' )
  if [[ -z "$seq" ]]; then
    # 헤더에서 시도
    seq=$(curl -sD - -o /dev/null -X POST \
      "$GATEWAY_URL$FCFS_JOIN_PATH" \
      -H "Content-Type: application/json" \
      -H "$USER_HEADER: $user" \
      -d "$FCFS_JOIN_BODY" | awk -v key="$(echo "$SEQ_HEADER" | tr '[:upper:]' '[:lower:]')" 'BEGIN{IGNORECASE=1}
        tolower($0) ~ "^"key":" {sub("\r",""); sub("^([^:]+):[[:space:]]*",""); print; exit }')
  fi

  if [[ -z "$seq" ]]; then
    fail "Duplicate test: could not obtain sequence"
    return
  fi

  rbody=$(curl -s -X POST \
    "$GATEWAY_URL$FCFS_RESERVE_PATH" \
    -H "Content-Type: application/json" \
    -H "$USER_HEADER: $user" \
    -H "$SEQ_HEADER: $seq" \
    -d "$RESERVE_BODY" || true)
  rcode=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
    "$GATEWAY_URL$FCFS_RESERVE_PATH" \
    -H "Content-Type: application/json" \
    -H "$USER_HEADER: $user" \
    -H "$SEQ_HEADER: $seq" \
    -d "$RESERVE_BODY" || true)

  if [[ "$rcode" =~ ^(200|409)$ ]] && { echo "$rbody" | jq -e '.success==false' >/dev/null 2>&1 || echo "$rbody" | grep -Eiq 'duplicate|already_reserved|exists'; }; then
    ok "Duplicate recognized at reserve (code=$rcode)"
  else
    fail "Duplicate not recognized (code=$rcode body=$(echo "$rbody" | head -c 200))"
  fi
}

test_missing_headers() {
  section "Missing headers"
  # 1) /fcfs/join 에서 사용자 헤더 없으면 400 기대
  jcode=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
    "$GATEWAY_URL$FCFS_JOIN_PATH" \
    -H "Content-Type: application/json" \
    -d "$FCFS_JOIN_BODY" || true)
  [[ "$jcode" == "400" ]] && ok "join missing $USER_HEADER → 400" || fail "join missing $USER_HEADER (code=$jcode)"

  # 2) /reservation/fcfs 에서 사용자 헤더 없으면 400 기대
  rcode=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
    "$GATEWAY_URL$FCFS_RESERVE_PATH" \
    -H "Content-Type: application/json" \
    -H "$SEQ_HEADER: 1" \
    -d "$RESERVE_BODY" || true)
  [[ "$rcode" == "400" ]] && ok "reserve missing $USER_HEADER → 400" || fail "reserve missing $USER_HEADER (code=$rcode)"

  # 3) /reservation/fcfs 에서 시퀀스 헤더 없으면 400 기대
  rcode=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
    "$GATEWAY_URL$FCFS_RESERVE_PATH" \
    -H "Content-Type: application/json" \
    -H "$USER_HEADER: smoke-user-2" \
    -d "$RESERVE_BODY" || true)
  [[ "$rcode" == "400" ]] && ok "reserve missing $SEQ_HEADER → 400" || fail "reserve missing $SEQ_HEADER (code=$rcode)"
}

main() {
  section "Health"
  health "$GATEWAY_URL$SEAT_LIST_PATH" "gateway" || true

  section "Admin reset (optional)"
  admin_reset

  section "Seat list"
  seat_list

  test_flow_success
  test_flow_duplicate
  test_missing_headers

  echo -e "\n==== SUMMARY ===="
  echo "Passed: $PASS_CT  Failed: $FAIL_CT"
  if (( FAIL_CT > 0 )); then
    printf 'Failed cases:\n'; printf ' - %s\n' "${FAILED[@]}"
    exit 1
  fi
  exit 0
}

main "$@"