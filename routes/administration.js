'use strict';

var app = require("../app")
  , User = require('../model/user')
  , Element = require('../model/element')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf')
  , _ = require('underscore');

app.all('/admin*',function(req, res, next){
  if (req.admin) {
    next()
  } else {
    res.send(404);
  }
});

app.get('/admin/users', function(req, res, next){
  User.find({})
    .exec(function(err, users){
      if (err) return next(err);
      req.rememberLocation();
      res.render("administration/users", {users:users});
    });
});

app.get('/admin/user/:id/delete', function(req, res, next){
  if (!req.xhr) res.send(404);
  User.findOne({ _id: req.param("id") })
    .exec(function(err, user){
      if (err) return next(err);
      if (user.role != "Administrator"){
        res.render("administration/user/delete", {
          name: user.name,
          id: req.param("id")
        });
      } else {
        res.send(404);
      }
    });
});

app.post('/admin/user/:id/delete', function(req, res, next){
  Element.findOne({owner:req.param("id"), root:true})
    .exec(function(err, elem){
      if (err) return next(err);
      var fullPath = conf.storagePath + "/" + elem.path;
      req.deleteDir(fullPath);
      User.remove({_id:req.param("id")}, function(err){
          if (err) return next(err);
          res.json({
            redirect: req.lastLocation()
          });
        })
    });
});

app.get('/admin/user/:id/configure', function(req, res, next){
  if (!req.xhr) res.send(404);
  User.findOne({_id:req.param("id")})
    .exec(function(err, user){
      if (err) return next(err);
      if (user.role != "Administrator"){
        res.render("administration/user/configure", {user:user});
      } else {
        res.json({
          notices: res.notices.error("You can not change Administrator").get()
        })
      }
    });
});

app.post('/admin/user/:id/configure', function(req, res, next){
  User.findOne({_id:req.param("id")})
    .exec(function(err, user){
      if (err) return next(err);
      user.name = req.param("name");
      user.role = req.param("role");
      user.save(function(err){
        if (err) return next(err);
        res.json({
          redirect: req.lastLocation()
        });
      })
    })
});

app.get('/admin/docs',function(req, res, next){
  var root = conf.storagePath;
  var ids = [];
  var tree = req.mkStructure(root, ids);
  ids.splice(0, 1);
  Element.find({_id: {$in: ids}})
    .exec(function(err, elems){
      if (err) next(err);
      var arrElems = {};
      _.each(elems, function(value, key){
        arrElems[value.id] = value
      });
      req.rememberLocation();
      res.render('administration/docs', {docs: tree, elements:arrElems})
    });
});

