--   * IP Blocking Semantics: Any request arriving while either the user key OR the IP key exists is blocked.
--       - Different users, different IPs: both allowed (distinct key pairs).
--       - Different users, same IP: second user blocked (tradeoff: mitigates script‑kiddie multi‑account spam from a single IP, but can false‑block NAT/shared networks).
--       - Same user, different IPs (rare / suspicious): second attempt blocked because user key still present.
--   * Tradeoff: Simpler early defense. If later we need per-user but not per-IP blocking, change EXISTS condition to require both keys existing (AND) or remove IP dimension.
-- Validation Scenarios (Task 2.3): see scripts/validate_duplicate_filter.sh for automated checks.
local _M = {}

-- Temporary workaround: direct IP fallback if DNS fails
local redis_host = os.getenv("REDIS_HOST") or "redis"
if redis_host == 'redis' then
  -- fallback static guess (docker compose network often 10.89.0.7 from inspect earlier)
  local fallback_ip = os.getenv('REDIS_FALLBACK_IP') or '10.89.0.7'
  -- we will attempt name first, then ip
end
local redis_port = tonumber(os.getenv("REDIS_PORT")) or 6379
local redis_password = os.getenv("REDIS_PASSWORD") or "redis_pass"  -- fallback to default
local ttl_default = tonumber(os.getenv("DEFAULT_DUP_TTL")) or 5  -- default short window (seconds); adjustable

local SCRIPT = [[
  local ukey = KEYS[1]
  local ipkey = KEYS[2]
  if redis.call("EXISTS", ukey) == 1 or redis.call("EXISTS", ipkey) == 1 then
    return 0
  end
  redis.call("SET", ukey, ARGV[1], "EX", ARGV[3])
  redis.call("SET", ipkey, ARGV[2], "EX", ARGV[3])
  return 1
]]

local function get_redis()
  local redis = require "resty.redis"
  local r = redis:new()
  r:set_timeout(2000)
  local ok, err = r:connect(redis_host, redis_port)
  if not ok then
    -- second attempt: fallback IP if provided
    local fh = os.getenv('REDIS_FALLBACK_IP') or '10.89.0.7'
    ok, err = r:connect(fh, redis_port)
  end
  if not ok then
    return nil, "redis_connect_failed:" .. (err or "")
  end
  if redis_password then
    local auth_ok, auth_err = r:auth(redis_password)
    if not auth_ok then
      return nil, "redis_auth_failed:" .. (auth_err or "")
    end
  end
  return r
end

function _M.preload()
  local dict = ngx.shared.lua_cache
  if dict:get("dupe_sha") then
    return true
  end
  local r, err = get_redis()
  if not r then return nil, err end
  local ok, sha = r:script("load", SCRIPT)
  if ok then
    dict:set("dupe_sha", sha)
  else
    ngx.log(ngx.ERR, "script load failed: ", sha)
  end
  r:set_keepalive(60000, 200)
  return true
end

-- Executes duplicate check. Returns: true (allowed) | false, reason
function _M.check(opts)
  opts = opts or {}
  local user = opts.user
  local ip = opts.ip
  local event = opts.event or "default"
  local ttl = tonumber(opts.ttl) or ttl_default
  if not user or user == '' then
    return false, 'missing_user'
  end
  if not ip or ip == '' then
    return false, 'missing_ip'
  end

  local dict = ngx.shared.lua_cache
  local sha = dict:get("dupe_sha")
  local r, err = get_redis()
  if not r then return false, err end

  local ukey = "fcfs:"..event..":user:"..user
  local ipkey = "fcfs:"..event..":ip:"..ip
  if event == 'fcfs' then
    -- unify with backend key convention (fcfs:user:<id>)
    ukey = "fcfs:user:"..user
    ipkey = "fcfs:ip:"..ip
  end
  -- debug: only log at very low rate (skip heavy logging)
  if math.random() < 0.01 then ngx.log(ngx.NOTICE, "dup_check keys=", ukey, ",", ipkey) end

  local function eval_fallback()
    local res, ev_err = r:eval(SCRIPT, 2, ukey, ipkey, user, ip, ttl)
    if not res then return nil, ev_err end
    return res
  end

  local res, call_err
  if sha then
    res, call_err = r:evalsha(sha, 2, ukey, ipkey, user, ip, ttl)
    if not res and call_err and call_err:find("NOSCRIPT") then
      dict:delete("dupe_sha")
      res, call_err = eval_fallback()
    end
  else
    res, call_err = eval_fallback()
  end

  if not res then
    r:set_keepalive(60000, 200)
    return false, 'redis_error:'..(call_err or 'unknown')
  end
  r:set_keepalive(60000, 200)
  if res == 0 then
    return false, 'duplicate'
  end
  return true
end

return _M
