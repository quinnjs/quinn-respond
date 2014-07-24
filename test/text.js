'use strict';

var $ = require('./_helper');

var respond = require('../');

describe('Simple text response', function() {
  describe('direct', function() {
    $.withRespond({ body: 'ok' });

    $.expectBody('ok');
    $.expectStatus(200);
  });

  describe('vanity', function() {
    $.withRespond(respond.text('ok'));

    $.expectBody('ok');
    $.expectHeader('Content-Type', 'text/plain; charset=utf-8');
    $.expectStatus(200);
  });

  describe('fancy', function() {
    $.withRespond(respond('ok'));

    $.expectBody('ok');
    $.expectHeader('Content-Length', 2);
    $.expectStatus(200);
  });
});
