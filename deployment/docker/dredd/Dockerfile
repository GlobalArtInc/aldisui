FROM golang:1.26-alpine3.24 as golang

RUN apk add --no-cache -U \
    curl git

WORKDIR /usr/local
# hadolint ignore=DL4006
RUN curl -sL https://taskfile.dev/install.sh | sh

WORKDIR /go/src/aldis
COPY . /go/src/aldis

RUN --mount=type=cache,target=/go/pkg \
    go mod download -x

RUN --mount=type=cache,target=/go/pkg --mount=type=cache,target=/root/.cache/go-build \
    task deps:tools && \
    task deps:be && \
    task dredd:goodman && \
    task dredd:hooks

FROM apiaryio/dredd:14.0.0

RUN apk add --no-cache -U \
    bash git go

COPY --from=golang /go/bin/goodman /root/go/bin/goodman
COPY --from=golang /go/src/aldis /aldis
WORKDIR /aldis

COPY deployment/docker/dredd/entrypoint /usr/local/bin
ENTRYPOINT ["/usr/local/bin/entrypoint"]
