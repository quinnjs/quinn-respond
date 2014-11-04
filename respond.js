'use strict';

var QuinnResponse = require('./response');
var isBody = QuinnResponse.isBody;

function respond(options) {
  options = options || {};

  if (QuinnResponse.isResponse(options)) {
    return options;
  }

  if (isBody(options)) {
    options = { body: options };
  }

  var statusCode = options.statusCode;
  var headers = options.headers;
  var body = options.body;
  var data = options.data || {};

  return new QuinnResponse(statusCode, headers, body, data);
}

function text(options) {
  return respond(options).text();
}
respond.text = text;

function html(options) {
  return respond(options).html();
}
respond.html = html;

function json(data, visitor, indent) {
  return respond().json(data, visitor, indent);
}
respond.json = json;

respond.Response = QuinnResponse;
respond['default'] = respond;

module.exports = respond;
