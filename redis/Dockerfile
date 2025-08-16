FROM redis:7.2-alpine

# 타임존/로케일 등 추가 설정이 필요하면 아래 주석 해제 후 사용
# RUN apk add --no-cache tzdata && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && echo 'Asia/Seoul' > /etc/timezone

COPY redis.conf /usr/local/etc/redis/redis.conf

# 기본 CMD는 docker-compose.yml 의 command 로 대체 예정 (비밀번호 주입)
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]