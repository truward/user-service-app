
# User Service v. 2

V.2 API proposal

# REST API

REST API will be split into several groups:

* Service-specific. This is intended for registering services that will be operating
* Scope-specific.
* User account-specific.
* Group-specific.
* Resource-specific.

## Services

* ``POST    /services/register``
* ``PUT     /services/{string:id}``
* ``DELETE  /services/{string:id}``
* ``GET     /services?from={string?:pageId}&limit={int?:limit}``
* ``GET     /services/{string:id}``

## Scopes

* ``POST    /scopes/register``
* ``PUT     /scopes/{string:id}``
* ``DELETE  /scopes/{string:id}``
* ``GET     /scopes/{string:id}``
* ``GET     /scopes?from={string?:pageId}&limit={int?:limit}``

## Users

* ``POST    /users/register``
* ``PUT     /users/{string:id}``
* ``DELETE  /users/{string:id}``
* ``GET     /users/{string:id}``
* ``GET     /users?scope={string?:id}&name={string?:name}&from={string?:pageId}&limit={int?:limit}``
* ``GET     /users/{string:id}``

## Groups

* ``POST    /groups/register``
* ``PUT     /groups/{string:id}``
* ``DELETE  /groups/{string:id}``
* ``GET     /groups/{string:id}``
* ``GET     /groups?from={string?:pageId}&limit={int?:limit}``

## Resources

* ``POST    /resources/register``
* ``PUT     /resources/{string:id}``
* ``DELETE  /resources/{string:id}``
* ``GET     /resources/{string:id}``
* ``GET     /resources?from={string?:pageId}&limit={int?:limit}``

* ``PUT     /resources/{string:id}/links/users/{string:id}``
* ``DELETE  /resources/{string:id}/links/users/{string:id}``
* ``GET     /resources/{string:id}/links/users/{string:id}``
* ``GET     /resources/{string:id}/links/users?from={string?:pageId}&limit={int?:limit}``
