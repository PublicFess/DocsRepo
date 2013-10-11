'use strict';

var app = require('../app');

app.all("/*", function(req, res, next){
  if (req.user && req.user.role == "Administrator"){
    req.admin = res.locals.admin = true;
    next();
  } else {
    next();
  }
});

app.get('/', function(req, res, next){
  if (req.user) {
    res.redirect("/docs")
  } else {
    res.render('index')
  }

});

require('./auth');
require('./docs');
require('./file');
require('./folder');
require('./share-docs');
require('./administration');
require('./user');