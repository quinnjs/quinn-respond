/**
 * We need to disallow munging private properties since _* are part of our
 * interface with ReadableStream
 *
 * @preventMunge
 */
'use strict';

import caseless from 'caseless';
import {PassThrough} from 'readable-stream';

class QuinnResponse extends PassThrough {
  constructor(statusCode, headers) {
    PassThrough.call(this);

    this.statusCode = statusCode;
    var c = caseless.httpify(this, headers || {});
    this.headers = c;
    this.getHeader = function(name) {
      return c.get(name);
    };

    this.on('pipe', this._onIncomingPipe.bind(this));

    this._cachedError = null;
  }

  _onIncomingPipe(src) {
    if (src.path) {
      // path can be used to automatically set content-type,
      // worth preserving.
      this.path = src.path;
    }
    src.on('error', this.error.bind(this));
  }

  error(err) {
    if (this._readableState.pipesCount > 0) {
      this.emit('error', err);
    } else {
      this._cachedError = err;
    }
  }

  _forwardMeta(dest) {
    dest.statusCode = this.statusCode;

    var headers = this.headers.dict;
    var keys = Object.keys(headers);
    var name, idx;

    for (idx = 0; idx < keys.length; ++idx) {
      name = keys[idx];
      dest.setHeader(name, headers[name]);
    }
  }

  wrappedPipe(dest, options) {
    // this -> dest -> wrapped
    var wrapped = new QuinnResponse(this.statusCode, this.headers.dict);
    wrapped._onIncomingPipe(this);
    return PassThrough.prototype.pipe.call(this, dest, options)
      .pipe(wrapped, options);
  }

  pipe(dest, options) {
    if (this._cachedError !== null) {
      setImmediate(this.emit.bind(this, 'error', this._cachedError));
      this._cachedError = null;
    }

    if (dest) {
      if (typeof dest.setHeader === 'function') {
        this._forwardMeta(dest);
      } else if (typeof dest.pipe === 'function') {
        // rewrap so the util methods are properly preserved
        return this.wrappedPipe(dest, options);
      }
    }

    return PassThrough.prototype.pipe.call(this, dest, options);
  }

  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  header() {
    this.setHeader.apply(this, arguments);
    return this;
  }
}

export default QuinnResponse;
