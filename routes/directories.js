'use strict';

var app = require('../app')
  , Element = require("../model/element")
  , mkdirp = require('mkdirp')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf')
  , _ = require('underscore')
  , async = require("async");

app.get("/docs/new-dir/*", function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/directories/new', {id: req.params[0]})
});

app.post("/docs/new-dir/*", function(req, res, next){
  var elem = new Element({
    owner: req.user.id,
    title: req.body.title,
    state: req.body.state
  });
  elem.path = req.params[0] + "/" + elem._id;
  elem.save(function(err, elem){
    if (err) return next(err);
    var url = req.params[0] + "/" + elem._id;
    var fullPath = conf.storagePath + "/" + url;
    mkdirp(fullPath, function(err){
      if (err) return next(err);
          res.json({
            redirect: "/docs"
          })
    });
  });
});

app.get("/docs/delete-dir/*", function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/directories/delete', {id: req.params[0]})
});

app.post("/docs/delete-dir/*", function(req, res, next){
  var fullPath = conf.storagePath + "/" + req.params[0];
  req.deleteDir(fullPath);
  res.json({
    redirect: "/docs"
  });
});

app.get("/docs/rename-dir/*", function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/directories/rename', {id: req.params[0]})
});

app.post("/docs/rename-dir/*", function(req, res, next){
  var newTitle = req.param("title");
  Element.findOneAndUpdate({_id: req.params[0]}, {title: newTitle}, function(err){
    if (err) return next(err);
    res.json({
      redirect: "/docs"
    })
  });
});