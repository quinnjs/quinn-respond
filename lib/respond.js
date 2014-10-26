'use strict';

var caseless = require('caseless');
var PassThrough = require('readable-stream').PassThrough;

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function isStream(value) {
  return isObject(value) && typeof value.pipe === 'function';
}

function isStreamValue(value) {
  return typeof value === 'string' || Buffer.isBuffer(value);
}

function isBody(value) {
  return isStream(value) || isStreamValue(value);
}

function bodyToStream(body) {
  if (isStreamValue(body)) {
    var stream = new PassThrough();
    stream.end(body);
    return stream;
  } else if (body === undefined) {
    return new PassThrough();
  }
  return body;
}

function QuinnResponse(statusCode, headers, body) {
  this.statusCode = statusCode || 200;
  var c = caseless.httpify(this, headers || {});
  this._headers = c;
  this.body(body);
}

QuinnResponse.prototype.header =
function header(key, value, clobber) {
  this._headers.set(key, value, clobber);
  return this;
};

QuinnResponse.prototype.status =
function status(code) {
  this.statusCode = code;
  return this;
};

QuinnResponse.prototype.body =
function body(body) {
  if (body === undefined) {
    return this;
  }

  if (typeof body === 'string') {
    body = new Buffer(body, 'utf8');
  }

  if (Buffer.isBuffer(body)) {
    this.setHeader('Content-Length', body.length);
  }

  body = bodyToStream(body);

  if (this._body === undefined) {
    this._body = body;
  } else {
    body.pipe(this._body);
  }

  return this;
};

QuinnResponse.prototype.text = function(body) {
  return this.body(body)
    .header('Content-Type', 'text/plain; charset=utf-8');
};

QuinnResponse.prototype.html = function(body) {
  return this.body(body)
    .header('Content-Type', 'text/html; charset=utf-8');
};

QuinnResponse.prototype.json = function(data, visitor, indent) {
  return this.body(JSON.stringify(data, visitor, indent))
    .header('Content-Type', 'application/json; charset=utf-8');
};

QuinnResponse.prototype._forwardMeta =
function _forwardMeta(dest) {
  dest.statusCode = this.statusCode;

  var headers = this._headers.dict;
  var keys = Object.keys(headers);
  var name, idx;

  for (idx = 0; idx < keys.length; ++idx) {
    name = keys[idx];
    dest.setHeader(name, headers[name]);
  }
};

QuinnResponse.prototype.pipe =
function pipe(target) {
  if (typeof target.setHeader === 'function')
    this._forwardMeta(target);

  return this._body.pipe(target);
};

QuinnResponse.prototype._qv = 3;
QuinnResponse.prototype.constructor = QuinnResponse;

QuinnResponse.isResponse = function(obj) {
  return isObject(obj) && typeof obj.constructor === 'function' &&
    obj.constructor.name === 'QuinnResponse' &&
    obj._qv === 3;
};

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

  return new QuinnResponse(statusCode, headers, body);
}

function text(options) {
  return respond(options)
    .header('Content-Type', 'text/plain; charset=utf-8');
}
respond.text = text;

function html(options) {
  return respond(options)
    .header('Content-Type', 'text/html; charset=utf-8');
}
respond.html = html;

function json(data, visitor, indent) {
  return respond().json(data, visitor, indent);
}
respond.json = json;

respond.Response = QuinnResponse;
respond['default'] = respond;

module.exports = respond;
