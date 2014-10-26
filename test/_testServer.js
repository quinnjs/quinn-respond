/*global before, after */
'use strict';

var http = require('http');

var concat = require('concat-stream');
var Bluebird = require('bluebird');

var respond = require('../');

function createTestServer() {

  var server, currentHandler;
  var result = {};

  function handleRequest(req, res) {
    Bluebird.try(currentHandler, [ req, {} ])
      .then(respond)
      .then(function(stream) {
        stream.pipe(res);
      })
      .catch(function(error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf8');
        res.end(error.stack);
      });
  }

  before(function(done) {
    server = http.createServer(handleRequest);
    server.listen(0, function() {
      result.baseUrl = 'http://127.0.0.1:' + this.address().port;
      done();
    });
  });

  after(function(done) {
    if (server && server._handle) {
      return server.close(done);
    }
    done();
  });

  result.makeRequest = function(handler) {
    currentHandler = handler;
    return new Bluebird(function(resolve, reject) {
      var req = http.get(result.baseUrl, function(res) {
        res.on('error', reject);
        res.setEncoding('utf8');
        res.pipe(concat(function(body) {
          res.body = body;
          resolve(res);
        }));
      });
      req.on('error', reject);
    });
  };

  return result;
}

module.exports = createTestServer;
