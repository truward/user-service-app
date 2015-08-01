var React = require('React');

var Dispatcher = require('./view/dispatcher.js');
var UserService = require('./service/ajax-user-service.js').UserService;
var PasswordService = require('./service/ajax-password-service.js').PasswordService;
var installGlobalAjaxErrorHandler = require('./util/rsvp-ajax.js').installGlobalErrorHandler;
var installGlobalCacheEventHandler = require('./util/rsvp-cache.js').installGlobalCacheEventHandler;
var ajax = require('./util/rsvp-ajax.js');
var parseQueryString = require('./util/uri.js').parseQueryString;


function installDebugHooks() {
  console.log("Installing Debug Hooks...");

  // install AJAX interceptor
  installGlobalAjaxErrorHandler("userServiceAjaxHandler", function (xmlHttpRequest) {
    window["lastErrorXhr"] = xmlHttpRequest;
    console.error("AJAX error, status:", xmlHttpRequest.status, xmlHttpRequest.statusText,
      "responseURL:", xmlHttpRequest.responseURL, "requestId:", xmlHttpRequest.getResponseHeader("X-Rid"));
  });

  // install cache event handlers
  installGlobalCacheEventHandler("userServiceCacheEventHandler", function (cacheHit, key, value) {
    if (cacheHit) {
      console.log("cacheHit", key, "value", value);
    } else {
      console.log("cacheMiss", key);
    }
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
