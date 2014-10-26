/*global describe, it */
'use strict';

var assert = require('assertive');

var respond = require('../');
var Response = respond.Response;

var createTestServer = require('./_testServer');
var toUpperCase = require('./_toUpperCase');

describe('respond', function() {
  var server = createTestServer();

  it('returns its argument if it is a response', function() {
    var res = new Response(200, {}, '');
    assert.equal(res, respond(res));
  });

  describe('body', function() {
    it('can be passed in as an option', function(done) {
      server.makeRequest(function() {
        return { body: 'jolly' };
      }).then(function(res) {
        assert.equal(200, res.statusCode);
        assert.equal('jolly', res.body);
      }).nodeify(done);
    });

    it('can be passed in as a buffer', function(done) {
      server.makeRequest(function() {
        return new Buffer('c2xvc2hlZA==', 'base64');
      }).then(function(res) {
        assert.equal(200, res.statusCode);
        assert.equal('sloshed', res.body);
      }).nodeify(done);
    });

    it('can be passed from a stream', function(done) {
      server.makeRequest(function() {
        return require('fs')
          .createReadStream(__dirname + '/static/test.txt')
          .pipe(toUpperCase());
      }).then(function(res) {
        assert.equal(200, res.statusCode);
        assert.equal('OKAY\n', res.body);
      }).nodeify(done);
    });

    it('combined with them chains', function(done) {
      server.makeRequest(function() {
        return respond('gosh...')
          .status(409)
          .header('content-type', 'text/british');
      }).then(function(res) {
        assert.equal(409, res.statusCode);
        assert.equal('gosh...', res.body);
        assert.equal('text/british', res.headers['content-type']);
      }).nodeify(done);
    });
  });

  describe('statusCode', function() {
    it('defaults to 200', function() {
      assert.equal(200, respond().statusCode);
    });

    it('supports the statusCode option', function() {
      var res = respond({ statusCode: 400 });
      assert.equal(400, res.statusCode);
    });

    it('supports chaining b/c the cool kids do it', function() {
      var res = respond().status(503);
      assert.equal(503, res.statusCode);
    });
  });

  describe('headers', function() {
    it('defaults to empty object', function() {
      assert.deepEqual({}, respond()._headers.dict);
    });

    it('supports initial headers as an option', function() {
      assert.deepEqual({
        'X-Fancy': 'pants'
      }, respond({ headers: {
        'X-Fancy': 'pants'
      } })._headers.dict);
    });

    it('supports setting headers via header', function() {
      assert.deepEqual(
        { 'X-Fancy': 'pants' },
        respond()
          .header('X-Fancy', 'pants')
          ._headers.dict
      );
    });

    it('can get headers regardless of casing', function() {
      assert.equal(
        'pants',
        respond()
          .header('X-Fancy', 'pants')
          .getHeader('x-fancy')
      );
    });
  });

  describe('integrating `send`', function() {
    var send = require('send');
    var publicRoot = __dirname + '/static';

    it('sends files', function(done) {
      server.makeRequest(function(req) {
        return send(req, '/test.txt', { root: publicRoot });
      }).then(function(res) {
        assert.equal(200, res.statusCode);
        assert.equal('okay\n', res.body);
        assert.include('text/plain', res.headers['content-type']);
        assert.include('5', res.headers['content-length']);
      }).nodeify(done);
    });

    it('404 files', function(done) {
      server.makeRequest(function(req) {
        return send(req, '/missing.txt', { root: publicRoot });
      }).then(function(res) {
        assert.equal(404, res.statusCode);
      }).nodeify(done);
    });

    it('redirects directories', function(done) {
      server.makeRequest(function(req) {
        return send(req, '/dir', { root: publicRoot });
      }).then(function(res) {
        assert.equal(301, res.statusCode);
      }).nodeify(done);
    });

    it('serves index.html', function(done) {
      server.makeRequest(function(req) {
        return send(req, '/dir/', { root: publicRoot });
      }).then(function(res) {
        assert.equal(200, res.statusCode);
        assert.include('text/html', res.headers['content-type']);
        assert.equal('not actual html\n', res.body);
      }).nodeify(done);
    });
  });
});
