'use strict';

var app = require('../app')
  , User = require('../model/user')
  , Element = require('../model/element')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf')
  , _ = require('underscore')
  , mkdirp = require('mkdirp');

app.all('/shared*', function(req, res, next){
  if (!req.user){
    req.rememberLocation();
    return res.redirect("/login");
  }
  next();
});

app.get('/shared', function(req, res, next){
  Element.find({editors: {$all:req.user._id}})
    .exec(function(err, elems){
      if (err) return next(err);
      res.render('shared/index', {files:elems});
    })
});