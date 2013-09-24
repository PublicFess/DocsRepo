'use strict';

var app = require('../app')
  , User = require('../model/user')
  , Document =require('../model/document');

app.all('/docs*', function(req, res, next){
  if (!req.user)
    req.rememberLocation();
    return res.redirect("/login");
  next();
});

app.get('/docs', function(req, res, next){
  Document.find({owner:req.user._id})
    .exec(function(err, docs){
      if (err) return next(err);
      res.render("docs/index", {docs:docs})
    })
});

app.get('/docs/new', function(req, res, next){

});