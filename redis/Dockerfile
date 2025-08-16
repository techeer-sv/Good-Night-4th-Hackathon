FROM 8.2.0-alpine3.22

# 타임존/로케일 등 추가 설정이 필요하면 아래 주석 해제 후 사용
# RUN apk add --no-cache tzdata && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && echo 'Asia/Seoul' > /etc/timezone

# 커스텀 설정 파일 복사
COPY redis.conf /usr/local/etc/redis/redis.conf

# 기본 CMD는 docker-compose.yml 의 command 로 대체 예정 (비밀번호 주입)
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]