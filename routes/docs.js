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
  console.log(JSON.stringify(tree, null, " "));
  res.render('docs/index', {docs: tree})
});

app.get('/docs/new-file/*', function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/files/new', {url: req.params[0]})
});

app.post('/docs/new-file/*', function(req, res, next){
  var url = req.params[0] + "/" + req.body.title + ".rho";
  var fullPath = conf.storagePath + "/" + url;
  mkdirp(path.dirname(fullPath), function(err){
    if (err) return next(err);
    fs.writeFile(
      fullPath,
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
              redirect: "/docs"
            })
          })
      }
    )
  });
});

app.get('/docs/rename-file/*', function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/files/rename', {url: req.params[0]});
});

app.post('/docs/rename-file/*', function(req, res, next){
  var newTitle = req.param("title") + ".rho";
  var oldFile = conf.storagePath + "/" + req.params[0];
  var newFile = oldFile.substring(0, oldFile.length-path.basename(oldFile).length) + newTitle;
  Document.findOne({url:req.params[0]})
    .exec(function(err, doc){
      if (err) return next(err);
      fs.rename(oldFile, newFile, function(err){
        if (err) return next(err);
        doc.url = newFile.substring(conf.storagePath.length+1, newFile.length+1);
        doc.save(function(err){
          if (err) return next(err);
          res.json({
            redirect:"/docs"
          })
        });
      })
    });
});

app.get('/docs/delete-file/*', function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  res.render('docs/files/delete', {url: req.params[0]});
});

app.post('/docs/delete-file/*', function(req, res, next){
  var url = req.params[0];
  console.log(url);
  Document.findOne({url: url})
    .exec(function(err, doc){
      if (err) return next(err);
      fs.unlink(conf.storagePath + "/" + doc.url, function(err){
        if (err) return next(err);
        doc.remove(function(err){
          if (err) return next(err);
          res.json({
            redirect: "/docs"
          })
        })
      })
    })
});