PKGS ?= $(shell glide novendor)
PKG_FILES ?= *.go

PROTOC ?= protoc

# Update path variable to have .bin directory (protoc-gen-go)
export PATH := ./.bin:$(PATH)

default: test

# Installs dependencies
.PHONY: dependencies
dependencies:
	@echo "Installing Glide and locked dependencies..."
	glide --version || go get -u -f github.com/Masterminds/glide
	glide install

# Cleans up produced artifacts
.PHONY: clean
clean:
	rm -rf .gen

# Cleans up dependencies and produced artifacts
.PHONY: purge
purge:
	make clean
	rm -rf vendor
	rm -rf .bin

# Protocol buffers generator (API model)
.gen/api/identity/v2/identity-model-v2.pb.go: .gen api/identity/v2/identity-model-v2.proto .bin/protoc-gen-go
	protoc -Iapi -Ivendor/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:.gen api/identity/v2/identity-model-v2.proto

.gen/api/identity/v2/identity-model-v2.pb.gw.go: .bin/protoc-gen-grpc-gateway .gen/api/identity/v2/identity-model-v2.pb.go
	protoc -Iapi -Ivendor/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis --grpc-gateway_out=logtostderr=true:.gen api/identity/v2/identity-model-v2.proto

.gen:
	mkdir .gen

# Run Targets

.PHONY: run-gateway
run-gateway: .gen/api/identity/v2/identity-model-v2.pb.gw.go
	go run gateway/identity-rest-gateway.go

.PHONY: run-server
run-server: .gen/api/identity/v2/identity-model-v2.pb.go
	go run server/identity-server.go

# Tests
.PHONY: test
test: .gen/api/identity/v2/identity-model-v2.pb.go .gen/api/identity/v2/identity-model-v2.pb.gw.go
	@scripts/test.sh

# Builds protobuf generator plugin
.bin/protoc-gen-go:
	./scripts/build_vendored.sh .bin github.com/golang/protobuf/protoc-gen-go

# Builds grpc gateway generator plugin
.bin/protoc-gen-grpc-gateway:
	./scripts/build_vendored.sh .bin github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway
