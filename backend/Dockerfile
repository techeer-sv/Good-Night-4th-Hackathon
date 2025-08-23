# Simple two-stage build (removed sccache/cargo-chef for reliability)
FROM rust:1.89-alpine AS builder
WORKDIR /app

# ✅ pkgconf(=pkg-config), git, ca-certificates 추가
RUN apk add --no-cache \
    build-base musl-dev openssl-dev sqlite-dev \
    pkgconf git ca-certificates

# Workspace manifests first (cache friendly)
COPY Cargo.toml Cargo.lock ./
COPY config/api/Cargo.toml config/api/
COPY config/database/Cargo.toml config/database/
COPY config/migration/Cargo.toml config/migration/
COPY config/redis/Cargo.toml config/redis/
COPY seat/model/Cargo.toml seat/model/
COPY seat/service/Cargo.toml seat/service/
COPY seat/controller/Cargo.toml seat/controller/
COPY test/ test/

# 루트 워크스페이스 기준으로 fetch (Cargo.lock이 있으니 --locked 가능)
RUN cargo fetch --locked --manifest-path Cargo.toml \
 || cargo fetch --manifest-path Cargo.toml

# Copy source
COPY . ./

# 필요 시 패키지/바이너리 이름 확인해서 수정하세요(아래는 예시 그대로 유지)
RUN cargo build --release --manifest-path Cargo.toml --bin tickettock \
 || (echo "Binary name mismatch. Adjust in Dockerfile." && ls target/release && exit 1)

FROM alpine:3.20 AS runtime
WORKDIR /app
RUN apk add --no-cache ca-certificates openssl sqlite-libs \
    && addgroup -S app && adduser -S app -G app
COPY --from=builder /app/target/release/tickettock /usr/local/bin/tickettock
USER app
EXPOSE 5800
ENV RUST_LOG=info
CMD ["/usr/local/bin/tickettock"]