'use strict';

var path = require('path');

exports.auth = false;
exports.env = process.env.NODE_ENV || 'development';
exports.port = process.env.PORT || 18009;
exports.domain = process.env.DOMAIN || 'localhost:18009';
exports.schema = process.env.SSL ? 'https' : 'http';
exports.publicPath = __dirname + '/public';
exports.mongoURL = "mongodb://localhost/docs";
exports.origin = "http://" + exports.domain;

exports.cdnDomain = exports.domain;
exports.cookieDomain = exports.domain;

exports.helloText = "# Hello World!"

exports.storagePath = path.join(
  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
  ".docs-repo");

Object.defineProperty(module.exports, "origin", {
  enumerable: true,
  get: function() {
    return module.exports.schema + "://" + module.exports.domain;
  }
});

Object.defineProperty(module.exports, "cdnOrigin", {
  enumerable: true,
  get: function() {
    return module.exports.schema + "://" + module.exports.cdnDomain;
  }
});

