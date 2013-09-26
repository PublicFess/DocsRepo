'use strict';

var app = require('../app')
  , User = require('../model/user')
  , Document =require('../model/document')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf');

app.all('/docs*', function(req, res, next){
  if (!req.user){
    req.rememberLocation();
    return res.redirect("/login");
  }
  next();
});

app.get('/docs', function(req, res, next){
  var root = conf.storagePath + "/" + req.user.name;
  var tree = {};
  req.buildTree(root, tree);
  console.log(tree);
  res.render('docs/index', {docs: tree})
});

app.get('/docs/new', function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/new')
});

app.post('/docs', function(req, res, next){
  var url = conf.storagePath + "/" + req.user.name + "/" + req.body.title + ".rho";
  fs.writeFile(
    url,
    conf.helloText,
    {encoding: "UTF-8"},
    function(err){
      if (err) return next(err);
      var doc = new Document({
        owner: req.user.id,
        title: req.body.title,
        state: req.body.state,
        url: url
      }).save(function(err){
          if (err) return next(err);
          res.json({
            redirect: "/"
          })
        })
    }
  )
});