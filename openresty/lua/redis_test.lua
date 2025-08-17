-- Simple Redis test script
local redis = require 'resty.redis'
local r = redis:new()
r:set_timeout(2000)

-- Compose 서비스명 기반으로 접속 (IP 고정 제거)
local redis_host = os.getenv("REDIS_HOST") or "redis"
local redis_port = tonumber(os.getenv("REDIS_PORT") or 6379)

ngx.log(ngx.ERR, "Attempting Redis connection to " .. redis_host .. ":" .. redis_port)

local ok, err = r:connect(redis_host, redis_port)
if not ok then
    ngx.log(ngx.ERR, "Redis connect failed: ", err)
    ngx.status = 503
    ngx.say('{"error":"redis_connect_failed","details":"' .. tostring(err) .. '"}')
    return ngx.exit(503)
end

ngx.log(ngx.ERR, "Redis connected, attempting auth")

local auth_pass = os.getenv("REDIS_PASS") or "redis_pass"
local auth_ok, auth_err = r:auth(auth_pass)
if not auth_ok then
    ngx.log(ngx.ERR, "Redis auth failed: ", auth_err)
    ngx.status = 503
    ngx.say('{"error":"redis_auth_failed","details":"' .. tostring(auth_err) .. '"}')
    return ngx.exit(503)
end

ngx.log(ngx.ERR, "Redis auth OK, testing INCR")

local seq, seq_err = r:incr('fcfs:seq')
if not seq then
    ngx.log(ngx.ERR, "Redis INCR failed: ", seq_err)
    ngx.status = 503
    ngx.say('{"error":"redis_incr_failed","details":"' .. tostring(seq_err) .. '"}')
    return ngx.exit(503)
end

ngx.log(ngx.ERR, "Redis INCR success, sequence: ", seq)

r:set_keepalive(60000, 200)

ngx.status = 200
ngx.header.content_type = 'application/json'
ngx.say('{"success":true,"sequence":' .. seq .. '}')