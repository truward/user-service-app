# !/bin/bash

# Get input parameters
ACTION=$1

# Fail on error
set -e

# Infer directories
TOOLS_PATH=$(dirname "$0")
BASE_DIR=$(cd "$TOOLS_PATH/../" && pwd)

function prop {
  grep "${1}" $BASE_DIR/var/app.properties|cut -d'=' -f2
}

PORT="$(prop 'brikar.settings.port')"
SVC_URI="http://127.0.0.1:$PORT"

SVC_CREDS="$(prop 'userService.auth.1.username'):$(prop 'userService.auth.1.password')"


# Execute toolbox action
case $ACTION in
  healthcheck)
    curl -u $SVC_CREDS -s -X POST $SVC_URI/api/health
    ;;

  h)
    echo "Interactive service toolbox"
    echo "Parameters:"
    echo "  Base URI:     $SVC_URI"
    echo "  Credentials:  $SVC_CREDS"
    echo "Sample calls:"
    echo "  bash api.sh lookup-account admin"
    ;;

  get-config)
    curl -u $SVC_CREDS -X POST $SVC_URI/g/admin/config
    ;;

  list-accounts)
    curl -u $SVC_CREDS -H 'Accept: application/json; charset=UTF-8' -H 'Content-Type: application/json; charset=UTF-8' -X POST $SVC_URI/api/user/v1/account/list -d '{"limit": 8}' -s | python -mjson.tool
    ;;

  lookup-account)
    USERNAME=$2
    curl -u $SVC_CREDS -H 'Accept: application/json; charset=UTF-8' -H 'Content-Type: application/json; charset=UTF-8' -X POST $SVC_URI/api/user/v1/account/lookup -d "{\"username\": \"$USERNAME\"}" -s | python -mjson.tool
    ;;

  *)
    echo "Unknown action $ACTION"
esac
