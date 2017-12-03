# User Service

## Sample Start

```bash
# Do once
make dependencies

# Start server (first terminal window) - uses 9090 port
make run-server

# Start REST API gateway (second terminal window) - uses 8080 port
make run-gateway
```

Sample calls:

```bash
curl -X POST -H "Content-Type: application/json" http://127.0.0.1:8080/v2/accounts/list -d '{"offsetToken": "", "limit": 5}'
```

## Implementation Specifics

### REST API

See [grpc coreos](https://grpc.io/blog/coreos).
Also: [type safe web api](https://improbable.io/games/blog/grpc-web-moving-past-restjson-towards-type-safe-web-apis).

### Credentials Encryption

See also: [bcrypt.go](https://github.com/golang/crypto/blob/master/bcrypt/bcrypt.go).
Also: [bcrypt godoc](https://godoc.org/golang.org/x/crypto/bcrypt).
