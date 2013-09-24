'use strict';

var crypto = require('crypto')
  , fs = require('fs')
  , path = require('path')
  , rho = require('rho')
  , conf = require("./conf");

exports.sha256 = function(str) {
  var p = crypto.createHash('sha256');
  p.update(str);
  return p.digest('hex');
};

exports.md5 = function(str) {
  var p = crypto.createHash('md5');
  p.update(str);
  return p.digest('hex');
};

exports.escapeHtml = function(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

exports.toHtml = function(str, inline) {
  if (inline) return rho.toInlineHtml(str);
  else return rho.toHtml(str);
};

exports.cdn = function(resource) {
  var uri = conf.cdnOrigin + resource;
  var file = path.join(conf.publicPath, resource);
  try {
    return uri + "?" + fs.statSync(file).mtime.getTime();
  } catch (e) {
    return uri;
  }
};

exports.setPassword = function(passwd) {
  var newPassword = exports.sha256(passwd);
  return newPassword;
};


