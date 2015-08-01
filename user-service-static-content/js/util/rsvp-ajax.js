var rsvp = require('rsvp');


/** Global AJAX error handlers used in onError function */
var GLOBAL_ERROR_HANDLERS = {};

/**
 * Executes global error handlers. Sample error handler is shown below:
 * <code>
 * function sampleErrorHandler(xmlHttpRequest) {
 *   window["lastErrorXhr"] = xmlHttpRequest;
 *   console.error("AJAX error, status:", xmlHttpRequest.status, xmlHttpRequest.statusText,
 *       "responseURL:", xmlHttpRequest.responseURL);
 * }
 * </code>
 *
 * Installation of an error handler is as simple as calling promise's reject:
 * <code>
 * reject(ajax.onError)
 * </code>
 */
function onError(xmlHttpRequest) {
  var errorHandlers = GLOBAL_ERROR_HANDLERS;
  for (var handlerName in errorHandlers) {
    if (errorHandlers.hasOwnProperty(handlerName)) {
      var fn = errorHandlers[handlerName];
      if (fn) {
        fn(xmlHttpRequest, handlerName);
      }
    }
  }
}

/**
 * Installs new global error handler
 */
function installGlobalErrorHandler(key, handler) {
  GLOBAL_ERROR_HANDLERS[key] = handler;
}

/** Helper function, that creates a handler for XMLHttpRequest.onreadystatechange */
function createHttpRequestHandler(resolve, reject) {
  return function xmlHttpRequestHandler() {
    if (this.readyState !== this.DONE) {
      return;
    }

    if (this.status === 200 || this.status === 201 || this.status === 204) {
      resolve(this.response);
    } else {
      onError(this);
      reject(this);
    }
  };
}

/**
 * Creates a new HTTP request for data fetched by using async AJAX interface.
 *
 * @arg options Request options:
 *    <tt>options.method</tt> String, that identifies HTTP request method, e.g. 'GET', 'PUT', 'POST', 'DELETE'
 *    <tt>url</tt> URL to the AJAX resource, e.g. '/rest/ajax/foo/bar/baz'
 *    <tt>requestBody</tt> An object, that represents a request, can be null
 *    <tt>responseType</tt> Response type code, can be null - if so, default value 'text' will be picked up
 *    <tt>accept</tt> MIME type to be passed in 'Accept' header
 *    <tt>contentType</tt> MIME type to be put to 'Content-Type' header, can be null if requestBody is null
 *
 * @return A new rsvp.Promise instance
 */
function requestObject(options) {
  var responseType = options.responseType || "text";
  var method = options.method || "GET";
  var url = options.url || "/";
  var requestBody = options.requestBody || null;
  var accept = options.accept || "*/*";
  var contentType = options.contentType || null;

  return new rsvp.Promise(function(resolve, reject) {
    var client = new XMLHttpRequest();
    client.open(method, url);
    client.onreadystatechange = createHttpRequestHandler(resolve, reject);
    client.responseType = responseType;
    client.setRequestHeader("Accept", accept);

    if (requestBody != null) {
      client.setRequestHeader("Content-Type", contentType);
      client.send(requestBody);
    } else {
      client.send();
    }
  });
}

/**
 * Creates a new HTTP request for data fetched by using async AJAX interface.
 *
 * @arg method String, that identifies HTTP request method, e.g. 'GET', 'PUT', 'POST', 'DELETE'
 * @arg url URL to the AJAX resource, e.g. '/rest/ajax/foo/bar/baz'
 * @arg requestBody An object, that represents a request, can be null
 * @return A new rsvp.Promise instance
 */
function request(method, url, requestBody) {
  return requestObject({
    method: method,
    url: url,
    requestBody: JSON.stringify(requestBody),
    accept: "application/json",
    contentType: "application/json",
    responseType: "json"
  });
}

//
// Exports
//

// Error Handling
module.exports.installGlobalErrorHandler = installGlobalErrorHandler;

// Making AJAX requests
module.exports.requestObject = requestObject;
module.exports.request = request;
