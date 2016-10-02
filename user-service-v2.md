
# User Service v. 2 Codename "GRUS"

V.2 API proposal

# REST API

REST API will be split into several groups:

* Group-specific.
* Resource-specific.
* User account-specific.
* Scope-specific.

First letters of those concepts form the acronym "GRUS", hence the name.

Users, groups, resources and roles may be registered in particular scopes.
A user may be a member of particular group. A participation in the group may provide an access to particular resources
for a particular scope.

Let's consider an example:

* There is a scope ``library``, group ``librarians`` and resource ``book-storage``.
* There is a rule, that provides everyone in the group ``librarians`` an access to resource ``books``.
* We register users ``alice``, ``bob`` and ``carol`` under this scope.
* We give ``alice`` a membership in the group ``librarians``.
* Now ``alice`` has an access to ``book-storage`` while ``bob`` and ``carol`` have not.

A resource may also represent a particular role, e.g. ``subscribers```.

I.e. considering an example given above, more complicated relations are possible,
e.g. membership in ``subscribers`` may give user ``bob`` a right to borrow a book.
On the other hand, user ``alice``, who is a member of the group ``librarians``
may borrow books from resource ``book-storage`` to the user ``bob``,
but not to the user ``carol`` if she is not in ``subscribers``.

## Scopes

Every scope represents particular area or namespace where particular entities (users, groups, resources) may reside in.

* ``POST    /scopes/register``
* ``PUT     /scopes/{string:id}``
* ``DELETE  /scopes/{string:id}``
* ``GET     /scopes/{string:id}``
* ``GET     /scopes?from={string?:pageId}&limit={int?:limit}``

## Users

Correspond to user registration data. User must be registered in a scope.

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
