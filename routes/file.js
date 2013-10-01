'use strict';

var app = require('../app')
  , User = require('../model/user')
  , Element = require('../model/element')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf')
  , _ = require('underscore')
  , mkdirp = require('mkdirp');

app.all('/file*', function(req, res, next){
  if (!req.user){
    req.rememberLocation();
    return res.redirect("/login");
  }
});