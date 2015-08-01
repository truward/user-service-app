/*
 * Caching utilities using rsvp promises.
 * The cache contract is as follows:
 * It should implement two functions - getValue(key, loadFn) and setValue(key, value)
 */

var rsvp = require('rsvp');

/** Global cache event handler chain */
var GLOBAL_CACHE_EVENT_HANDLER = {};

/**
 * Installs new global error handler
 */
function installGlobalCacheEventHandler(key, handler) {
  GLOBAL_CACHE_EVENT_HANDLER[key] = handler;
}

/** Internal helper that triggers cache events */
function triggerCacheEvent(cacheHit, key, value) {
  var eventHandlers = GLOBAL_CACHE_EVENT_HANDLER;
  for (var handlerName in eventHandlers) {
    if (eventHandlers.hasOwnProperty(handlerName)) {
      var fn = eventHandlers[handlerName];
      if (fn) {
        fn(cacheHit, key, value);
      }
    }
  }
}

/** Default function which will be used instead of loadFn in getValue method if loadFn is null or undefined */
function defaultLoadFn(key) {
  return new rsvp.Promise(function(resolve, reject) {
    reject(key);
  });
}

//
// A cache which is always empty
//

function AlwaysEmptyRsvpCache() {
}

AlwaysEmptyRsvpCache.prototype.getValue = function(key, loadFn) {
  var actualLoadFn = loadFn || defaultLoadFn;
  triggerCacheEvent(false, key, undefined);
  return actualLoadFn(key);
}

AlwaysEmptyRsvpCache.prototype.setValue = function(key, value) {
  // do nothing
}

AlwaysEmptyRsvpCache.prototype.deleteValue = function(key) {
  // do nothing
}

//
// A wrapper around standard javascript object
//

function SimpleObjectRsvpCache(cacheObject) {
  this.cacheObject = cacheObject || {};
}

SimpleObjectRsvpCache.prototype.getValue = function(key, loadFn) {
  var actualLoadFn = loadFn || defaultLoadFn;

  var promise = new rsvp.Promise(function(resolve, reject) {
    if (this.cacheObject.hasOwnProperty(key)) {
      var value = this.cacheObject[key];
      this.onCacheHit(key, value);
      resolve(this.cacheObject[key]);
    } else {
      this.onCacheMiss(key);
      reject(key);
    }
  }.bind(this));

  if (loadFn) {
    // load function is defined - use it if promise failed to deliver value from the cache
    promise = promise.then(null, function valueNotFoundInCache(key) {
      var promise = actualLoadFn(key);

      // intercept value, returned by load function and put it into the cache
      promise.then(function valueLoadedFromCache(loadedValue) {
        this.setValue(key, loadedValue);
      }.bind(this));

      return promise;
    }.bind(this));
  }

  return promise;
}

SimpleObjectRsvpCache.prototype.setValue = function(key, value) {
  this.cacheObject[key] = value;
}

SimpleObjectRsvpCache.prototype.deleteValue = function(key) {
  if (this.cacheObject.hasOwnProperty(key)) {
    delete this.cacheObject[key];
  }
}

SimpleObjectRsvpCache.prototype.onCacheHit = function (key, value) {
  triggerCacheEvent(true, key, value);
}

SimpleObjectRsvpCache.prototype.onCacheMiss = function (key) {
  triggerCacheEvent(false, key, undefined);
}

//
// Exports
//

module.exports.AlwaysEmptyRsvpCache = AlwaysEmptyRsvpCache;
module.exports.SimpleObjectRsvpCache = SimpleObjectRsvpCache;

module.exports.installGlobalCacheEventHandler = installGlobalCacheEventHandler;
