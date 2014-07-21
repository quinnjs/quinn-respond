'use strict';

var assert = require('assertive');
var concat = require('concat-stream');
var caseless = require('caseless');
var Promise = require('bluebird');

var respond = require('../');

function withRespond(props) {
  before(function(done) {
    var base = Promise.resolve(
      typeof props === 'function' ? props() : props
    ).bind(this);

    base.then(function(resolvedProps) {
      this.spec = respond(resolvedProps);
      this.spec.on('error', done);

      this.spec.pipe(collector(function(response) {
        this.response = response;
        done();
      }.bind(this)));
    });
  });
}

function withFailingRespond(props) {
  before(function(done) {
    var base = Promise.resolve(
      typeof props === 'function' ? props() : props
    ).bind(this);

    base.then(function(resolvedProps) {
      this.spec = respond(resolvedProps);
      this.spec.on('error', function(err) {
        this.error = err;
        done();
      }.bind(this));

      this.spec.pipe(collector(function(response) {
        done(new Error('Unexpected response'));
      }.bind(this)));
    }).catch(done);
  });
}

function collector(onSpec) {
  var writeable = concat(function(body) {
    writeable.body = body.toString('utf8');
    onSpec(writeable);
  });
  writeable.headers = caseless.httpify(writeable, {});
  return writeable;
}

function expectBody(body) {
  it('returns the proper body', function() {
    assert.equal(body.toString('utf8'), this.response.body);
  });
}

function expectStatus(code) {
  it('returns the status code ' + code, function() {
    assert.equal(code, this.response.statusCode);
  });
}

function expectHeader(name, value) {
  it('returns header ' + name + ' = ' + value, function() {
    assert.equal(value, this.response.headers.get(name));
  });
}

module.exports = {
  withRespond: withRespond,
  expectBody: expectBody,
  expectStatus: expectStatus,
  expectHeader: expectHeader,
  withFailingRespond: withFailingRespond
}
