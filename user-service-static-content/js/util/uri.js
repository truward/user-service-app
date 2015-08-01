
module.exports.parseQueryString = function(searchString) {
  var objURL = {};

  searchString.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function($ignored0, $paramKey, $ignored2, $paramValue) {
      objURL[$paramKey] = $paramValue;
    });

  return objURL;
};
