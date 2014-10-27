/*global describe, it */
'use strict';

var assert = require('assertive');

var respond = require('../');

var createTestServer = require('./_testServer');

describe('Content type helpers', function() {
  var server = createTestServer();

  describe('text', function() {
    it('sets content type, chained', function(done) {
      server.makeRequest(function() {
        return respond().text('ok')
          .status(201);
      }).then(function(res) {
        assert.equal('ok', res.body);
        assert.equal(201, res.statusCode);
        assert.equal('text/plain; charset=utf-8',
          res.headers['content-type']);
        assert.equal('2', res.headers['content-length']);
      }).nodeify(done);
    });

    it('sets content type, direct', function(done) {
      server.makeRequest(function() {
        return respond.text('ok')
          .status(201);
      }).then(function(res) {
        assert.equal('ok', res.body);
        assert.equal(201, res.statusCode);
        assert.equal('text/plain; charset=utf-8',
          res.headers['content-type']);
        assert.equal('2', res.headers['content-length']);
      }).nodeify(done);
    });
  });

  describe('html', function() {
    it('sets content type, chained', function(done) {
      server.makeRequest(function() {
        // http://stackoverflow.com/questions/9864662/how-to-get-the-string-length-in-bytes-in-nodejs
        return respond().html('äáöü')
          .status(201);
      }).then(function(res) {
        assert.equal('äáöü', res.body);
        assert.equal(201, res.statusCode);
        assert.equal('text/html; charset=utf-8',
          res.headers['content-type']);
        assert.equal('8', res.headers['content-length']);
      }).nodeify(done);
    });

    it('sets content type, direct', function(done) {
      server.makeRequest(function() {
        // http://stackoverflow.com/questions/9864662/how-to-get-the-string-length-in-bytes-in-nodejs
        return respond.html('äáöü')
          .status(201);
      }).then(function(res) {
        assert.equal('äáöü', res.body);
        assert.equal(201, res.statusCode);
        assert.equal('text/html; charset=utf-8',
          res.headers['content-type']);
        assert.equal('8', res.headers['content-length']);
      }).nodeify(done);
    });
  });

  describe('json', function() {
    it('with default options, chained', function(done) {
      server.makeRequest(function() {
        return respond().json({ x: 2 });
      }).then(function(res) {
        assert.equal('{"x":2}', res.body);
        assert.equal('application/json; charset=utf-8',
          res.headers['content-type']);
        assert.equal('7', res.headers['content-length']);
      }).nodeify(done);
    });

    it('with default options, direct', function(done) {
      server.makeRequest(function() {
        return respond.json({ x: 2 });
      }).then(function(res) {
        assert.equal('{"x":2}', res.body);
        assert.equal('application/json; charset=utf-8',
          res.headers['content-type']);
        assert.equal('7', res.headers['content-length']);
      }).nodeify(done);
    });

    it('pretty printed', function(done) {
      server.makeRequest(function() {
        return respond().json({ x: 2 }, null, 2);
      }).then(function(res) {
        assert.equal('{\n  "x": 2\n}', res.body);
        assert.equal('application/json; charset=utf-8',
          res.headers['content-type']);
        assert.equal('12', res.headers['content-length']);
      }).nodeify(done);
    });
  });
});
