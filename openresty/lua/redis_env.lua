-- 환경 변수 기반 Redis 설정 모듈
local _M = {}

-- 환경 변수에서 Redis 설정 읽기
local function get_redis_config()
    local config = {
        host = os.getenv('REDIS_HOST') or 'redis',
        port = tonumber(os.getenv('REDIS_PORT')) or 6379,
        password = os.getenv('REDIS_PASSWORD') or 'redis_pass',
        timeout = tonumber(os.getenv('REDIS_TIMEOUT')) or 2000
    }
    
    ngx.log(ngx.INFO, "Redis config - host:", config.host, " port:", config.port)
    return config
end

-- Redis 연결 (환경 변수 기반)
local function connect_redis()
    local config = get_redis_config()
    local redis = require 'resty.redis'
    local r = redis:new()
    r:set_timeout(config.timeout)
    
    -- 주 연결 시도
    local ok, err = r:connect(config.host, config.port)
    if ok then
        ngx.log(ngx.INFO, "Redis connected to ", config.host, ":", config.port)
        
        -- 인증
        if config.password and config.password ~= '' then
            local auth_ok, auth_err = r:auth(config.password)
            if not auth_ok then
                ngx.log(ngx.ERR, "Redis auth failed: ", auth_err or "unknown")
                return nil, "auth_failed"
            end
        end
        
        return r, nil
    end
    
    -- 폴백 연결들 (환경 변수 실패시)
    ngx.log(ngx.WARN, "Primary Redis connection failed, trying fallbacks...")
    local fallbacks = {
        { host = '127.0.0.1', port = 6379 },
        { host = '10.89.0.3', port = 6379 },
        { host = 'localhost', port = 6379 }
    }
    
    for _, fb in ipairs(fallbacks) do
        local fb_ok, fb_err = r:connect(fb.host, fb.port)
        if fb_ok then
            ngx.log(ngx.INFO, "Redis fallback connected to ", fb.host, ":", fb.port)
            
            if config.password and config.password ~= '' then
                local auth_ok, auth_err = r:auth(config.password)
                if auth_ok then
                    return r, nil
                end
            else
                return r, nil
            end
        end
    end
    
    return nil, "all_connections_failed"
end

function _M.process_request()
    local headers = ngx.req.get_headers()
    local user_id = headers['X-User-Id']
    
    if not user_id or user_id == '' then
        ngx.status = 400
        ngx.header.content_type = 'application/json'
        ngx.say('{"success":false,"reason":"missing_user"}')
        return ngx.exit(400)
    end

    local r, err = connect_redis()
    if not r then
        ngx.status = 503
        ngx.header.content_type = 'application/json'
        ngx.say('{"success":false,"reason":"redis_unavailable","detail":"' .. (err or '') .. '"}')
        return ngx.exit(503)
    end
    
    -- 중복 체크
    local dupe_key = 'fcfs:user:' .. user_id
    local exists = r:get(dupe_key)
    if exists and exists ~= ngx.null then
        ngx.status = 409
        ngx.header.content_type = 'application/json'
        ngx.say('{"success":false,"reason":"duplicate"}')
        r:set_keepalive(60000, 200)
        return ngx.exit(409)
    end
    
    -- 중복 방지 키 설정
    r:set(dupe_key, 1, 'EX', 5)
    
    -- 시퀀스 할당
    local seq = r:incr('fcfs:seq')
    if not seq then
        ngx.status = 503
        ngx.header.content_type = 'application/json'
        ngx.say('{"success":false,"reason":"sequence_unavailable"}')
        r:set_keepalive(60000, 200)
        return ngx.exit(503)
    end
    
    ngx.req.set_header('X-Fcfs-Seq', seq)
    r:set_keepalive(60000, 200)
end

return _M
