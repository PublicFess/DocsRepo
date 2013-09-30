'use strict';

var app = require('../app')
  , Directory = require("../model/directory")
  , Document = require('../model/document')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf')
  , _ = require('underscore')
  , async = require("async");

app.get("/docs/new-dir/*", function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/directories/new', {url: req.params[0]})
});

app.post("/docs/new-dir/*", function(req, res, next){
  var url = req.params[0] + "/" + req.body.title;
  var fullPath = conf.storagePath + "/" + url;
  mkdirp(fullPath, function(err){
    if (err) return next(err);
    var dir = new Directory({
      owner: req.user.id,
      title: req.body.title,
      state: req.body.state,
      url: url
    }).save(function(err){
        if (err) return next(err);
        res.json({
          redirect: "/docs"
        })
      })
  });
});

app.get("/docs/delete-dir/*", function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/directories/delete', {url: req.params[0]})
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
  res.render('docs/directories/rename', {url: req.params[0]})
});

app.post("/docs/rename-dir/*", function(req, res, next){
  var fullPath = conf.storagePath + "/" + req.params[0];
  var newPath = path.dirname(req.params[0]) + "/" + req.param("title");

  var _path = file.substring(conf.storagePath.length+1, file.length+1);
  Directory.findOne({url:_path})
    .exec(function(err, dir){
      if (err) return next(err);
      fs.renameSync(file, conf.storagePath + "/" + newTitle);
      dir.title = path.basename(newTitle);
      dir.url = newTitle;
      dir.save(function(err){
        if (err) return next(err);
      })
    });

  req.renameDir(fullPath, newPath);

  res.json({
    redirect: "/docs"
  });
});