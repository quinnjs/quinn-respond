'use strict';

var Transform = require('readable-stream').Transform;

function toUpperCase(opts) {
  var fail = opts && opts.fail;
  var t = new Transform();

  t._transform = function(chunk, encoding, callback) {
    setTimeout(function() {
      if (fail) {
        return callback(new Error('Forced failure'));
      }
      t.push(chunk.toString('utf8').toUpperCase());
      callback();
    }, 25);
  };

  return t;
}

module.exports = toUpperCase;
