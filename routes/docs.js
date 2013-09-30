'use strict';

var app = require('../app')
  , User = require('../model/user')
  , Document =require('../model/document')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf')
  , mkdirp = require('mkdirp');

app.all('/docs*', function(req, res, next){
  if (!req.user){
    req.rememberLocation();
    return res.redirect("/login");
  }
  next();
});

app.get('/docs', function(req, res, next){
  var root = conf.storagePath + "/" + req.user.name;
  var tree = req.mkStructure(root);
  res.render('docs/index', {docs: tree})
});

require("./directories");
require("./files");


