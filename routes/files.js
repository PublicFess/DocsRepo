"use strict";

var app = require('../app')
  , User = require('../model/user')
  , Element = require('../model/element')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf')
  , mkdirp = require('mkdirp');

app.get('/docs/new-file/*', function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/files/new', {id: req.params[0]})
});

app.post('/docs/new-file/*', function(req, res, next){

  var elem = new Element({
    owner: req.user.id,
    title: req.body.title + ".rho",
    state: req.body.state
  });
  elem.path = req.params[0] + "/" + elem._id;
  elem.save(function(err, elem){
      if (err) return next(err);
      var url = req.params[0] + "/" + elem._id;
      var fullPath = conf.storagePath + "/" + url;
      mkdirp(path.dirname(fullPath), function(err){
        if (err) return next(err);
        fs.writeFile(
          fullPath,
          conf.helloText,
          {encoding: "UTF-8"},
          function(err){
            if (err) return next(err);
            res.json({
              redirect: "/docs"
            })
          })
      });
    });
});

app.get('/docs/rename-file/*', function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/files/rename', {id: req.params[0]});
});

app.post('/docs/rename-file/*', function(req, res, next){
  var newTitle = req.param("title") + ".rho";
  Element.findOneAndUpdate({_id: req.params[0]}, {title: newTitle}, function(err){
    if (err) return next(err);
    res.json({
      redirect: "/docs"
    })
  });
});

app.get('/docs/delete-file/*', function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/files/delete', {id: req.params[0]});
});

app.post('/docs/delete-file/*', function(req, res, next){
  var url = req.params[0];
  Element.findOne({_id: req.params[0]})
    .exec(function(err, elem){
      if (err) return next(err);
      fs.unlink(conf.storagePath + "/" + elem.path, function(err){
        if (err) return next(err);
        elem.remove(function(err){
          if (err) return next(err);
          res.json({
            redirect: "/docs"
          })
        })
      })
    })
});