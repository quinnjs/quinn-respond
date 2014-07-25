'use strict';

import QuinnResponse from './response';

function respond(options) {
  options = options || {};

  if (options instanceof QuinnResponse || options.quinnResVersion === 2)
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
export default respond;

export function text(body) {
  return respond({
    body: body,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}
respond.text = text;

export function html(body) {
  return respond({
    body: body,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
respond.html = html;

export function json(data) {
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
}
respond.json = json;
