'use strict';

var User = require('../model/user')
  , Element = require('../model/element')
  , app = require('../app')
  , utils = require('../utils')
  , conf = require('../conf')
  , mkdirp = require('mkdirp');


app.get('/signup', function(req, res, next){
  if (req.user) return res.redirect("/docs");
  res.render('auth/signup')
});

app.post('/signup', function(req, res, next){
  req.body.user.password = utils.setPassword(req.body.user.password);
  var user = new User(req.body.user);

  user.save(function(err, user){
    if (err) return next(err);
    var elem = new Element({
      title: user.name,
      owner: user._id,
      root: true
    });
    elem.path = elem._id;
    elem.save(function(err, elem){
        if (err) return next(err);
        var dir = conf.storagePath + "/" + elem._id;
        mkdirp(dir, function(err){
          if (err) return next(err);
          req.login(user);
          req.
          res.json({
            notices: res.notices.info("You have successfully registered.").get(),
            redirect: req.lastLocation()
          })
        });
      });
  });
});

app.get('/login', function(req, res, next) {
  if (req.user) return res.redirect("/docs");
  res.render('auth/login');
});

app.post('/login', function(req, res, next) {
  User.findOne({ email: req.body.user.email }).exec(function(err, user) {
    if (err)
      return next(err);
    if (!user || !user.checkPassword(req.body.user.password))
      return res.json({
        notices: res.notices.error('Invalid username or password.').get()
      });
    else {
      req.login(user);
      req.lastLocation();
      res.json({
        redirect: req.lastLocation()
      });
    }
  });
});

app.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

