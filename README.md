
## Dev Start

Create a property file somewhere in your home directory, e.g. ``/home/user/user-service.properties``:

```
# Make shutdown much faster, server will wait 100 milliseconds before stopping serving
# pending connections and shutting down
brikar.settings.gracefulShutdownMillis=100

# Turn off basic auth
brikar.dev.disableSecurity=true

# Uncomment to also fetch static content directly from your build folder
#brikar.dev.overrideStaticPath=/File_path_to/orion/user-service/user-service-static-content/target/release
```

Then add VM property, e.g.: ``-Dbrikar.settings.path=file:/home/user/user-service.properties``.

### AJAX in-browser debugging

Install debug interceptor by passing ``debug=1`` as query param:

```
http://127.0.0.1:8080/index.html?debug=1#/accounts/update/22
```

## Release

In ``user-service-server`` do ``mvn package -Passembly``.

## Web Client Build

```
npm install --save-dev
./node_modules/grunt-cli/bin/grunt
./node_modules/grunt-cli/bin/grunt watch
```

## Samples

### Health Check

```
curl -u testonly:test -X POST 127.0.0.1:8080/rest/health
```

Should result in

```
OK
```

### Fetching Server Configuration

```
curl -u testonly:test -X POST 127.0.0.1:8080/g/admin/config
```


### Lookup

#### User List

```
curl -u testonly:test -H 'Accept: application/json; charset=UTF-8' -H 'Content-Type: application/json; charset=UTF-8' -X POST 127.0.0.1:8080/rest/user/account/list -d '{"limit": 8}' -s | python -mjson.tool
```

Results in:

```json
{
    "accounts": [
        {
            "active": true,
            "authorities": [
                "ROLE_GENERIC_USER"
            ],
            "contacts": [],
            "created": 1435042800000,
            "id": 20,
            "nickname": "alice",
            "password": "$2a$10$W5YdtLrCN.3dH8hilF2queEvfJedIhzSEzszgcjJ8e/NrWBCURIUW"
        },
        {
            "active": false,
            "authorities": [
                "ROLE_GENERIC_USER"
            ],
            "contacts": [],
            "created": 1435215600000,
            "id": 21,
            "nickname": "bob",
            "password": "$2a$10$W5YdtLrCN.3dH8hilF2queEvfJedIhzSEzszgcjJ8e/NrWBCURIUW"
        },
        {
            "active": true,
            "authorities": [
                "ROLE_ADMIN",
                "ROLE_GENERIC_USER"
            ],
            "contacts": [],
            "created": 1434783600000,
            "id": 22,
            "nickname": "admin",
            "password": "$2a$10$W5YdtLrCN.3dH8hilF2queEvfJedIhzSEzszgcjJ8e/NrWBCURIUW"
        }
    ]
}
```

#### Lookup Account

```
curl -u testonly:test -H 'Accept: application/json; charset=UTF-8' -H 'Content-Type: application/json; charset=UTF-8' -X POST 127.0.0.1:8080/rest/user/account/lookup -d '{"username": "admin", "password": "$2a$10$W5YdtLrCN.3dH8hilF2queEvfJedIhzSEzszgcjJ8e/NrWBCURIUW"}' -s | python -mjson.tool
```

Results in:

```json
{
    "account": {
        "active": true,
        "authorities": [
            "ROLE_ADMIN",
            "ROLE_GENERIC_USER"
        ],
        "contacts": [],
        "created": 1434783600000,
        "id": 22,
        "nickname": "admin",
        "password": "$2a$10$W5YdtLrCN.3dH8hilF2queEvfJedIhzSEzszgcjJ8e/NrWBCURIUW"
    }
}
```

## How to create a file-based database

Create database and fill it with test data:

```
java -cp ~/.m2/repository/com/h2database/h2/1.4.183/h2-1.4.183.jar org.h2.tools.RunScript -url jdbc:h2:/tmp/userdb -user sa -script user-service-server/src/main/resources/userService/sql/user-schema.sql
java -cp ~/.m2/repository/com/h2database/h2/1.4.183/h2-1.4.183.jar org.h2.tools.RunScript -url jdbc:h2:/tmp/userdb -user sa -script user-service-server/src/main/resources/userService/sql/user-fixture.sql
```


Then you can connect to it using h2 shell (remove rlwrap if you don't want to use readline):

```
rlwrap java -cp ~/.m2/repository/com/h2database/h2/1.4.183/h2-1.4.183.jar org.h2.tools.Shell -url jdbc:h2:/tmp/userdb -user sa
```


