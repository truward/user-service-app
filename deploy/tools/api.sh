#!/usr/bin/env bash

# Include common script base
TOOLS_DIR=$(dirname "$0")
source "$TOOLS_DIR/common.sh"

# Get input parameters
ACTION=$1

# Infer application target parameters
HOST=$(prop 'brikar.tools.host')
PORT=$(prop 'brikar.tools.port')
SVC_URI="$HOST:$PORT"
SVC_CREDS="$(prop 'brikar.tools.username'):$(prop 'brikar.tools.password')"

function invokeApi {
  curl -u $SVC_CREDS -H 'Accept: application/json; charset=UTF-8' -H 'Content-Type: application/json; charset=UTF-8' -X ${1} $SVC_URI/api/${2} -d "${3}" -s | python -mjson.tool
}

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
    LIMIT=$2
    OFFSET_TOKEN=$3

    if [ -z "$LIMIT" ]; then
      LIMIT=8
    fi

    OFFSET_TOKEN_KV=""
    if [ "$OFFSET_TOKEN" ]; then
      OFFSET_TOKEN_KV=", \"offsetToken\": \"$OFFSET_TOKEN\""
    fi

    invokeApi "POST" "user/v1/account/list" "{\"limit\": $LIMIT $OFFSET_TOKEN_KV}"
    ;;

  lookup-account)
    USERNAME=$2
    invokeApi "POST" "user/v1/account/lookup" "{\"username\": \"$USERNAME\"}"
    ;;

  create-invitation-token)
    AUTHORITIES=$2
    if [ -z "$AUTHORITIES" ]; then
      echo 'No authorities provided, sample: ["ROLE_GENERIC_USER"]'
      exit 1
    fi
    # Current time in milliseconds + hour (3600000 is a number of milliseconds per hour)
    EXPIRATION_TIME=$3
    if [ -z "$EXPIRATION_TIME" ]; then
      EXPIRATION_TIME=$(($(date +%s%N)/1000000+3600000))
    fi
    invokeApi "POST" "user/v1/token/create" "{\"authorities\": $AUTHORITIES, \"count\": 1, \"expirationTime\": $EXPIRATION_TIME}"
    ;;

  register-account)
    REGISTRATION_REQUEST=$2
    if [ -z "$REGISTRATION_REQUEST" ]; then
      echo 'No registration request provided, sample: "{\"nickname\": \"johndoe\", \"passwordHash\": \"$PASSWORD_HASH\", \"authorities\": [\"ROLE_GENERIC_USER\"], \"invitationToken\": \"$INVITATION_TOKEN\"}"'
      exit 1
    fi
    invokeApi "POST" "user/v1/account" "$REGISTRATION_REQUEST"
    ;;

  update-account)
    UPDATE_REQUEST=$2
    if [ -z "$UPDATE_REQUEST" ]; then
      echo "No update request provided"
      exit 1
    fi
    invokeApi "PUT" "user/v1/account" "$UPDATE_REQUEST"
    ;;

  delete-account)
    ACCOUNT_ID=$2
    if [ -z "$ACCOUNT_ID" ]; then
      echo 'No account ID provided, sample: 12345'
      exit 1
    fi

    invokeApi "DELETE" "user/v1/account/list" "{\"userIds\": [$ACCOUNT_ID]}"
    ;;

  encode-password)
    # Read Password
    echo -n "Enter Password:"
    read -s PASSWORD
    echo

    echo -n "Repeat Password:"
    read -s PASSWORD2
    echo

    if [ "$PASSWORD" != "$PASSWORD2" ]; then
      echo "Entered passwords do not match"
      exit 1
    fi

    curl -u $SVC_CREDS -H 'Accept: application/text; charset=UTF-8' -H 'Content-Type: application/text; charset=UTF-8' -X POST $SVC_URI/api/password/v1/encode -d "$PASSWORD" -s
    ;;

  get-admin-url)
    echo "http://$SVC_CREDS@127.0.0.1:$PORT/index.html"
    ;;

  *)
    echo "Unknown action $ACTION"
esac

