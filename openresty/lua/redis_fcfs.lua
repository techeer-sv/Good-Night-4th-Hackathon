-- Redis FCFS 처리 모듈
local _M = {}

-- Redis 연결 설정
local function get_redis_connection()
    local redis = require 'resty.redis'
    local r = redis:new()
    r:set_timeout(2000)
    
    -- 여러 연결 방법 시도 (우선순위 순)
    local connection_attempts = {
        { host = 'redis', port = 6379, desc = 'container hostname' },
        { host = '127.0.0.1', port = 6379, desc = 'localhost' }
    }
    
    for _, attempt in ipairs(connection_attempts) do
        local ok, err = r:connect(attempt.host, attempt.port)
        if ok then
            ngx.log(ngx.INFO, "Redis connected via ", attempt.desc, " (", attempt.host, ":", attempt.port, ")")
            
            -- Redis 인증
            local auth_ok, auth_err = r:auth('redis_pass')
            if auth_ok then
                return r, nil
            else
                ngx.log(ngx.ERR, "Redis auth failed: ", auth_err or "unknown error")
                return nil, "auth_failed"
            end
        else
            ngx.log(ngx.WARN, "Redis connection failed via ", attempt.desc, ": ", err or "unknown error")
        end
    end
    
    return nil, "all_connections_failed"
end

-- 중복 요청 체크
local function check_duplicate(r, user_id)
    local dupe_key = 'fcfs:user:' .. user_id
    local exists = r:get(dupe_key)
    
    if exists and exists ~= ngx.null then
        return true -- 중복
    end
    
    -- 중복 방지 키 설정 (5초 TTL)
    r:set(dupe_key, 1, 'EX', 5)
    return false -- 중복 아님
end

-- 시퀀스 할당
local function allocate_sequence(r)
    local seq = r:incr('fcfs:seq')
    return seq
end

-- FCFS 요청 처리
function _M.process_fcfs_request()
    local headers = ngx.req.get_headers()
    local user_id = headers['X-User-Id']
    
    if not user_id or user_id == '' then
        ngx.status = 400
        ngx.header.content_type = 'application/json'
        ngx.say('{"success":false,"reason":"missing_user"}')
        return ngx.exit(400)
    end

    -- Redis 연결
    local r, err = get_redis_connection()
    if not r then
        ngx.status = 503
        ngx.header.content_type = 'application/json'
        ngx.say('{"success":false,"reason":"redis_unavailable","detail":"' .. (err or '') .. '"}')
        return ngx.exit(503)
    end
    
    -- 중복 체크
    if check_duplicate(r, user_id) then
        ngx.status = 409
        ngx.header.content_type = 'application/json'
        ngx.say('{"success":false,"reason":"duplicate"}')
        r:set_keepalive(60000, 200)
        return ngx.exit(409)
    end
    
    -- 시퀀스 할당
    local seq = allocate_sequence(r)
    if not seq then
        ngx.status = 503
        ngx.header.content_type = 'application/json'
        ngx.say('{"success":false,"reason":"sequence_unavailable"}')
        r:set_keepalive(60000, 200)
        return ngx.exit(503)
    end
    
    -- 백엔드로 전달할 헤더 설정
    ngx.req.set_header('X-Fcfs-Seq', seq)
    r:set_keepalive(60000, 200)
    
    ngx.log(ngx.INFO, "FCFS processed for user ", user_id, " with sequence ", seq)
end

return _M
