# Simple two-stage build (removed sccache/cargo-chef for reliability)
FROM rust:1.89-alpine AS builder
WORKDIR /app
RUN apk add --no-cache build-base musl-dev openssl-dev pkgconfig sqlite-dev

# Workspace manifests first (cache friendly)
COPY Cargo.toml Cargo.lock ./
COPY config/api/Cargo.toml config/api/
COPY config/database/Cargo.toml config/database/
COPY config/migration/Cargo.toml config/migration/
COPY config/redis/Cargo.toml config/redis/
COPY seat/model/Cargo.toml seat/model/
COPY seat/service/Cargo.toml seat/service/
COPY seat/controller/Cargo.toml seat/controller/

RUN cargo fetch --locked --manifest-path Cargo.toml || cargo fetch --manifest-path Cargo.toml

# Copy source
COPY . ./

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