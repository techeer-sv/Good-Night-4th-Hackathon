-- Redis 연결 디버깅 스크립트
local redis_env = require 'redis_env'

ngx.header.content_type = 'application/json'

-- 환경 변수 읽기
local redis_host = os.getenv('REDIS_HOST') or 'redis'
local redis_port = os.getenv('REDIS_PORT') or '6379'
local redis_password = os.getenv('REDIS_PASSWORD') or 'redis_pass'

ngx.say('{"debug": {')
ngx.say('  "environment": {')
ngx.say('    "REDIS_HOST": "', redis_host, '",')
ngx.say('    "REDIS_PORT": "', redis_port, '",')
ngx.say('    "REDIS_PASSWORD": "', (redis_password and redis_password ~= '') and "***set***" or "not_set", '"')
ngx.say('  },')

-- Redis 연결 테스트
local redis = require 'resty.redis'
local r = redis:new()
r:set_timeout(2000)

local connection_results = {}
local test_hosts = {
    {name = "environment_host", host = redis_host, port = tonumber(redis_port)},
    {name = "container_name", host = "redis", port = 6379},
}

ngx.say('  "connection_tests": [')
for i, test in ipairs(test_hosts) do
    local ok, err = r:connect(test.host, test.port)
    local result = {
        name = test.name,
        host = test.host,
        port = test.port,
        connected = ok and true or false,
        error = err or nil
    }
    
    if ok then
        -- 인증 테스트
        local auth_ok, auth_err = r:auth(redis_password)
        result.authenticated = auth_ok and true or false
        result.auth_error = auth_err or nil
        
        if auth_ok then
            -- 간단한 명령 테스트
            local ping_result = r:ping()
            result.ping = (ping_result == "PONG") and true or false
        end
        
        -- 연결 종료
        r:close()
    end
    
    ngx.say('    {')
    ngx.say('      "name": "', result.name, '",')
    ngx.say('      "host": "', result.host, '",')
    ngx.say('      "port": ', result.port, ',')
    ngx.say('      "connected": ', result.connected and 'true' or 'false', ',')
    if result.error then
        ngx.say('      "error": "', result.error, '",')
    end
    if result.authenticated ~= nil then
        ngx.say('      "authenticated": ', result.authenticated and 'true' or 'false', ',')
    end
    if result.auth_error then
        ngx.say('      "auth_error": "', result.auth_error, '",')
    end
    if result.ping ~= nil then
        ngx.say('      "ping": ', result.ping and 'true' or 'false')
    end
    ngx.say('    }', (i < #test_hosts) and ',' or '')
end
ngx.say('  ]')
ngx.say('}}')
