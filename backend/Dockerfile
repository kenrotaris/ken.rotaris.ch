FROM rust:1.75-alpine AS builder

WORKDIR /app

RUN apk add --no-cache musl-dev

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

FROM alpine:latest

RUN apk add --no-cache libgcc

COPY --from=builder /app/target/release/backend /usr/local/bin/backend

EXPOSE 3001

CMD ["backend"]
