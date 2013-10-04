'use strict';

var app = require('../app')
  , User = require('../model/user')
  , Element = require('../model/element')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf')
  , _ = require('underscore')
  , mkdirp = require('mkdirp');

app.all('/docs*', function(req, res, next){
  if (!req.user){
    req.rememberLocation();
    return res.redirect("/login");
  }
  Element.findOne({owner:req.user._id, root: true})
    .exec(function(err, root){
      if (err) return next(err);
      if (!root) return res.send(404);
      req.root = res.locals.rootDir = root;
      next();
    });
});

app.get('/docs', function(req, res, next){
  var root = conf.storagePath + "/" + req.root._id;
  var ids = [];
  var tree = req.mkStructure(root, ids);
  req.rememberLocation();
  Element.find({_id: {$in: ids}})
    .exec(function(err, elems){
      if (err) next(err);
      var arrElems = {};
      _.each(elems, function(value, key){
        arrElems[value.id] = value
      });
      res.render('docs/index', {docs: tree, elements:arrElems})
    });
});