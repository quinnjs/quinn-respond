'use strict';

var $ = require('./_helper');
var respond = require('../');

describe('Status code', function() {
  describe('direct', function() {
    $.withRespond({ statusCode: 201, body: '' });

    $.expectBody('');
    $.expectStatus(201);
  });

  describe('vanity', function() {
    $.withRespond(respond.text('').status(201));

    $.expectBody('');
    $.expectStatus(201);
  });
});
