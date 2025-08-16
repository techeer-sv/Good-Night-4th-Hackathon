FROM rust:1.89-alpine AS builder
WORKDIR /app
RUN apk add --no-cache build-base musl-dev openssl-dev pkgconfig sqlite-dev

# Copy only manifests first for caching
COPY backend/Cargo.toml backend/Cargo.lock ./backend/
COPY backend/config/api/Cargo.toml backend/config/api/
COPY backend/config/database/Cargo.toml backend/config/database/
COPY backend/config/migration/Cargo.toml backend/config/migration/
COPY backend/config/redis/Cargo.toml backend/config/redis/
COPY backend/seat/model/Cargo.toml backend/seat/model/
COPY backend/seat/service/Cargo.toml backend/seat/service/
COPY backend/seat/controller/Cargo.toml backend/seat/controller/

RUN cargo fetch --locked --manifest-path backend/Cargo.toml || cargo fetch --manifest-path backend/Cargo.toml

# Now copy sources
COPY backend/ ./backend/

RUN cargo build --release --manifest-path backend/Cargo.toml --bin tickettock || (echo "Binary name mismatch. Adjust in Dockerfile." && ls backend/target/release && exit 1)

FROM alpine:3.19
WORKDIR /app
RUN apk add --no-cache ca-certificates openssl sqlite-libs \
	&& addgroup -S app && adduser -S app -G app
COPY --from=builder /app/backend/target/release/tickettock /usr/local/bin/tickettock
USER app
EXPOSE 5800
ENV RUST_LOG=info
CMD ["/usr/local/bin/tickettock"]
