var cache = require('../util/rsvp-cache.js');
var rsvp = require('rsvp');
var ajax = require('rsvp-ajax');

var DEFAULT_LIMIT = 10;

//
// Service
//

function AjaxUserService() {
  this.cache = {
    accounts: new cache.SimpleObjectRsvpCache()
  };
}

AjaxUserService.prototype.getAccounts = function (offsetToken, limit) {
  limit = limit || DEFAULT_LIMIT;
  var accountCache = this.cache.accounts;

  // [1] get accounts
  var promise = ajax.request("POST", "/rest/user/account/list", {
    "offsetToken": offsetToken,
    "limit": limit
  });

  // [2] save fetched values to the cache
  promise.then(function (listAccountResponse) {
    // save fetched values to the cache
    listAccountResponse["accounts"].map(function (account) {
      accountCache.setValue(account["id"], account);
    });
  });

  return promise;
}

AjaxUserService.prototype.getAccountById = function (userId) {
  return this.cache.accounts.getValue(userId, function () {
    return ajax.request("GET", "/rest/user/account/" + userId);
  });
}

AjaxUserService.prototype.updateAccount = function (account) {
  return ajax.request("PUT", "/rest/user/account", {
    "userId": account["id"],
    "nickname": account["nickname"],
    "passwordHash": account["passwordHash"],
    "contacts": account["contacts"],
    "authorities": account["authorities"],
    "active": account["active"]
  });
}

AjaxUserService.prototype.registerAccount = function (account) {
  return ajax.request("POST", "/rest/user/account", {
    "nickname": account["nickname"],
    "passwordHash": account["passwordHash"],
    "contacts": account["contacts"],
    "invitationToken": account["invitationToken"],
    "authorities": account["authorities"]
  });
}

AjaxUserService.prototype.deleteAccount = function (userId) {
  return ajax.request("DELETE", "/rest/user/account/list", {"userIds": [userId]});
}

AjaxUserService.prototype.generateTokens = function (count) {
  return ajax.request("POST", "/rest/user/token/create", {"count": count, "authorities": []});
}

//
// exports
//

module.exports.DEFAULT_LIMIT = DEFAULT_LIMIT;

if (window.location.href.startsWith("file")) {
  var s = function StubUserService() {};
  s.prototype.getAccounts = function () {
    return new rsvp.Promise(function (resolve) { resolve({"accounts": [], "offsetToken": null}); });
  };
  s.prototype.deleteAccount = function (userId) {
    return new rsvp.Promise(function (resolve) { resolve({}); });
  };
  s.prototype.getAccountById = function (userId) {
    return new rsvp.Promise(function (resolve) { resolve(null); });
  }
  s.prototype.registerAccount = function () {
    return new rsvp.Promise(function (resolve) { resolve({"userId": 1}); });
  }

  module.exports.UserService = s;
} else {
  module.exports.UserService = AjaxUserService;
}
