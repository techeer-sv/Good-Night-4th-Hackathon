ARG OPENRESTY_VERSION=1.25.3.1-alpine-fat
FROM openresty/openresty:${OPENRESTY_VERSION}
LABEL maintainer="gim-yungi" \
	  org.opencontainers.image.source="tickettock" \
	  org.opencontainers.image.description="OpenResty base image with utilities for FCFS reservation gateway"

# Install minimal useful tooling (curl for healthcheck, bash for debugging, tzdata for correct logs)
RUN apk add --no-cache bash curl ca-certificates tzdata && \
	rm -rf /var/cache/apk/*

# Environment defaults (override via docker-compose / k8s manifests)
ENV REDIS_HOST=redis \
	REDIS_PORT=6379 \
	LUA_PATH="/usr/local/openresty/lualib/?.lua;;" \
	TZ=UTC

# Prepare directories for future nginx.conf + lua scripts (filled in later subtasks)
RUN mkdir -p /etc/openresty/lua /etc/openresty/conf.d /var/log/nginx

# Copy base nginx configuration (Task 1.2 skeleton)
COPY config/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY lua /etc/openresty/lua

# Expose HTTP port
EXPOSE 80

# Simple healthcheck hitting default server (subtask 1.2 will add /health location explicitly)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -fsS http://localhost/ || exit 1

# Use OpenResty master process in foreground (preferred over placeholder top)
CMD ["openresty", "-g", "daemon off;"]