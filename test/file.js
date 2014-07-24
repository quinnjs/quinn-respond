'use strict';

var fs = require('fs');

var assert = require('assertive');
var Promise = require('bluebird');

var respond = require('../');

var $ = require('./_helper');
var toUpperCase = require('./_toUpperCase');

describe('A file', function() {
  describe('valid file', function() {
    $.withRespond(function() {
      return fs.createReadStream(__dirname + '/test.txt')
        .pipe(respond())
        .status(400);
    });

    $.expectBody('okay');
    $.expectStatus(400);
  });

  describe('not found', function() {
    $.withFailingRespond(function() {
      return fs.createReadStream(__dirname + '/not-existing.txt')
        .pipe(respond())
        .status(400);
    });

    it('forwards the error', function() {
      assert.notEqual(undefined, this.error);
      assert.equal('ENOENT', this.error.code);
    });
  });

  describe('promised file', function() {
    $.withRespond(function() {
      return Promise.resolve(
        fs.createReadStream(__dirname + '/test.txt')
          .pipe(respond())
          .status(400)
      );
    });

    $.expectBody('okay');
    $.expectStatus(400);
  });

  describe('promised file, not found', function() {
    $.withFailingRespond(function() {
      return Promise.resolve(
        fs.createReadStream(__dirname + '/not-existing.txt')
          .pipe(respond())
          .status(400)
      ).delay(50);
    });

    it('forwards the error', function() {
      assert.notEqual(undefined, this.error);
      assert.equal('ENOENT', this.error.code);
    });
  });

  describe('with intermediate transform', function() {
    describe('promised file', function() {
      $.withRespond(function() {
        return Promise.resolve(
          fs.createReadStream(__dirname + '/test.txt')
            .pipe(respond())
            .pipe(toUpperCase())
            .status(400)
        );
      });

      $.expectBody('OKAY');
      $.expectStatus(400);
    });

    describe('promised file, not found', function() {
      $.withFailingRespond(function() {
        return Promise.resolve(
          fs.createReadStream(__dirname + '/not-existing.txt')
            .pipe(respond())
            .pipe(toUpperCase())
            .status(400)
        ).delay(50);
      });

      it('forwards the error', function() {
        assert.notEqual(undefined, this.error);
        assert.equal('ENOENT', this.error.code);
      });
    });

    describe('promised file, failing transform', function() {
      $.withFailingRespond(function() {
        return Promise.resolve(
          fs.createReadStream(__dirname + '/test.txt')
            .pipe(respond())
            .pipe(toUpperCase({ fail: true }))
            .status(400)
        ).delay(50);
      });

      it('forwards the error', function() {
        assert.notEqual(undefined, this.error);
        assert.equal('Forced failure', this.error.message);
      });
    });
  });
});
