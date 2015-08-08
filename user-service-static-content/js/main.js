var React = require('React');

var Dispatcher = require('./view/dispatcher.js');
var UserService = require('./service/ajax-user-service.js').UserService;
var PasswordService = require('./service/ajax-password-service.js').PasswordService;
var ajax = require('rsvp-ajax');
var cache = require('rsvp-cache');
var parseQueryString = require('./util/uri.js').parseQueryString;


function installDebugHooks() {
  console.log("Installing Debug Hooks...");

  // install AJAX interceptor
//  ajax.installGlobalAjaxErrorHandler("userServiceAjaxHandler", function (xmlHttpRequest) {
//    window["lastErrorXhr"] = xmlHttpRequest;
//    console.error("AJAX error, status:", xmlHttpRequest.status, xmlHttpRequest.statusText,
//      "responseURL:", xmlHttpRequest.responseURL, "requestId:", xmlHttpRequest.getResponseHeader("X-Rid"));
//  });

  // install cache event handlers
  cache.on(cache.CACHE_HIT, function (d) {
    console.log("cacheHit, key:", d.key, ", value:", d.value);
  });

  cache.on(cache.CACHE_MISS, function (d) {
    console.log("cacheMiss, key:", d.key);
  });
}

window.onload = function () {
  var services = {
    userService: new UserService(),
    passwordService: new PasswordService()
  };

  var queryParam = parseQueryString(window.location.search);
  if (queryParam["debug"] === "1") {
    installDebugHooks();
  }

  React.render(React.createElement(Dispatcher, {services: services}),
    document.getElementById('main-content'));
}
