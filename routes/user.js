'use strict';

var app = require('../app')
  , User = require('../model/user')
  , Element = require('../model/element')
  , conf = require('../conf')
  , utils = require('../utils')
  , _ = require('underscore');

app.all('/user/:id/*', function(req, res, next){
  if (req.user._id != req.param("id")) {
    return res.send(404)
  } else {
    next();
  }
});

app.get('/user/:id/settings', function(req, res, next){
  res.render('user/settings')
});

app.post('/user/:id/settings', function(req, res, next){
  if (req.user.checkPassword(req.body.user.oldPassword)) {
    Element.findOneAndUpdate({owner: req.user._id, root: true}, {title: req.body.user.name})
      .exec(function(err, elem){
        if (err) return next(err);
        console.log(req.body.user.name);
        req.user.name = req.body.user.name;
        req.user.email = req.body.user.email;

        if (req.body.user.newPassword == req.body.user.confirmPassword && req.body.user.newPassword != "") {
          req.user.password = utils.sha256(req.body.user.newPassword);
        }
        req.user.save(function(err){
          if (err) return next(err);
          res.json({
            notices: res.notices.info("Changes was apply").get()
          })
        });
      });
  } else {
    res.json({
      notices: res.notices.error("Invalid password").get()
    })
  }
});