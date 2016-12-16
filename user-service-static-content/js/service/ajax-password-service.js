var ajax = require('rsvp-ajax');

//
// Service
//

function AjaxPasswordService() {
}

AjaxPasswordService.prototype.encode = function (password) {
  return ajax.requestObject({
    method: "POST",
    url: "/api/password/v1/encode",
    requestBody: password,
    contentType: "text/plain",
    accept: "text/plain"
  });
}

module.exports.PasswordService = AjaxPasswordService;
