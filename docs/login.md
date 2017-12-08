# Identity Login API

This document describes how login API is intended to work.

## Interaction Overview

1. Client tries to access a website ``foo.com``.
1. A ``foo.com`` checks if there is an active JWT token.
1. If JWT token exists and is still valid, nothing happens (profile is shown).
1. If JWT token expired or does not exist, "login" link is shown.

## API

### Login Page

```raw
GET https://login.truward.com/login?redirectUrl={url}
```

Action: Displays login page and gives redirect to the specified URL once login process is completed.

Redirect URL contract:

```raw
GET https://website?code={login-code}&token={token}
```

### Logout

No login API provided. Caller is supposed to erase Authentication cookie containing ``Bearer`` token.

## Links

* [Stop Using JWT for Sessions](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/)
* [Cookies vs Tokens Guide](https://auth0.com/blog/cookies-vs-tokens-definitive-guide/)
* [JWT vs Session Cookies](https://ponyfoo.com/articles/json-web-tokens-vs-session-cookies)
