"use strict";

var app = require('../app')
  , Element = require("../model/element")
  , mkdirp = require('mkdirp')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf')
  , _ = require('underscore')
  , async = require("async");

var checkOwner = function(user, file){
  if (file.owner.equals(user._id)){
    return true;
  } else{
    return false;
  }
};

var checkEditor = function(user, file){
  switch (file.state){
    case ("invite"):
      for (var i = 0; i < file.editors.length; i++){
        if (file.editors[i] == user.email){
          return true
        }
      }
      break;

    case ("public"):
      return true;
      break;
  }
  return false;
};

app.all('/folder/:id/*', function(req, res, next){
  if (!req.user){
    req.rememberLocation();
    return res.redirect("/login");
  }
  Element.findById(req.param("id"))
    .exec(function(err, elem){
      if (err) return next(err);
      req.owner = res.locals.owner = checkOwner(req.user, elem);
      req.editor = res.locals.editor = checkEditor(req.user, elem);
      req.elem = res.locals.elem = elem;
      next();
    });
});

app.get("/folder/:id/new", function(req, res, next){
  if (req.owner) {
    if (!req.xhr) return res.send(404, "This page is not exist");
    res.render('docs/folders/new', {id:req.param("id")})
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.post("/folder/:id/new", function(req, res, next){
  if (req.owner) {
    var elem = new Element({
      owner: req.user.id,
      title: req.body.title,
      state: req.body.state
    });
    elem.path = req.elem.path + "/" + elem._id;
    elem.save(function(err, elem){
      if (err) return next(err);
      var fullPath = conf.storagePath + "/" + elem.path;
      mkdirp(fullPath, function(err){
        if (err) return next(err);
        res.json({
          redirect: req.lastLocation()
        })
      });
    });
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.get("/folder/:id/rename", function(req, res, next){
  if (req.owner || req.admin) {
    if (!req.xhr) return res.send(404, "This page is not exist");
    res.render('docs/folders/rename', {id: req.param('id'), title:req.elem.title})
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.post("/folder/:id/rename", function(req, res, next){
  console.log(req.admin);
  if (req.owner || req.admin) {
    var newTitle = req.param("title");
    Element.findOneAndUpdate({_id: req.param("id")}, {title: newTitle}, function(err){
      if (err) return next(err);
      res.json({
        redirect: req.lastLocation()
      })
    });
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.get("/folder/:id/delete", function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  if (req.owner || req.admin) {
    res.render('docs/folders/delete', {id: req.param("id"), title: req.elem.title})
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.post("/folder/:id/delete", function(req, res, next){
  if (req.owner || req.admin) {
    var fullPath = conf.storagePath + "/" + req.elem.path;
    req.deleteDir(fullPath);
    res.json({
      redirect: req.lastLocation()
    });
  } else {
    res.send(404, "You don't have access to this file")
  }
});