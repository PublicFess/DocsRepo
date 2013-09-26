'use strict';

var User = require('../model/user')
  , app = require('../app')
  , utils = require('../utils')
  , conf = require('../conf')
  , mkdirp = require('mkdirp');


app.get('/signup', function(req, res, next){
  res.render('auth/signup')
});

app.post('/signup', function(req, res, next){
  req.body.user.password = utils.setPassword(req.body.user.password);
  var user = new User(req.body.user);
  user.save(function(err, user){
    if (err) return next(err);
    var dir = conf.storagePath + "/" + user.name;
    mkdirp(dir, function(err){
      if (err) return next(err);
      req.login(user);
      res.json({
        notices: res.notices.info("You have successfully registered.").get(),
        redirect: "/"
      })
    });
  });
});

app.get('/login', function(req, res, next) {
  res.render('auth/login');
});

app.post('/login', function(req, res, next) {
  User.findOne({ name: req.body.user.name }).exec(function(err, user) {
    if (err)
      return next(err);
    if (!user || !user.checkPassword(req.body.user.password))
      return res.json({
        notices: res.notices.error('Invalid username or password.').get()
      });
    else {
      req.login(user);
      res.json({
        redirect: "/"
      });
    }
  });
});

app.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

