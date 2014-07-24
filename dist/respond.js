'use strict';

var QuinnResponse = require('./response');

function respond(options) {
  options = options || {};

  if (options instanceof QuinnResponse)
    return options;

  var headers, statusCode, body;
  if (typeof options === 'string' || Buffer.isBuffer(options)) {
    body = options;
  } else {
    headers = options.headers;
    statusCode = options.statusCode;
    body = options.body;
  }

  var res = new QuinnResponse(statusCode || 200, headers || {});

  if (body !== undefined) {
    if (!Buffer.isBuffer(body)) {
      body = new Buffer(String(body), 'utf8');
      res.header('Content-Length', body.length);
    }
    res.write(body);
    res.end();
  }

  return res;
}
module.exports = respond;

function text(body) {
  return respond({
    body: body,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
} module.exports.text = text;
respond.text = text;

function html(body) {
  return respond({
    body: body,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
} module.exports.html = html;
respond.html = html;

function json(data) {
  var body;
  if (data !== undefined) {
    body = JSON.stringify(data);
  }
  return respond({
    body: body,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
} module.exports.json = json;
respond.json = json;
