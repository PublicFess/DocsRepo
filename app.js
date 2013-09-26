'use strict';

var express = require('express')
  , http = require('http')
  , conf = require('./conf')
  , utils = require('./utils')
  , stylus = require('stylus')
  , nib = require('nib')
  , I18n = require('i18n-2')
  , moment = require('moment')
  , _ = require('underscore')
  , User = require('./model/user')
  , mongoose = require('mongoose')
  , fs = require('fs')
  , path = require('path');

var app = module.exports = exports = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals.basedir = __dirname + '/views';
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
// Parsing JSON, url-encoded and multipart forms
app.use(express.bodyParser());

// _method support
app.use(express.methodOverride());

// Signed cookie parser & session support
app.use(express.cookieParser('privateproject'));
app.use(express.session({
  key: 'sid',
  secret: 'privateproject'
}));

// I18n
I18n.expressBind(app, {
  locales: ['ru'],
  extension: ".json"
});

// Notices
app.use(require('./notices'));

// Authentication
app.use(function(req, res, next) {
  req.login = function(user) {
    req.session.userId = user._id;
    res.cookie("user", user._id, {maxAge:2592000000})
  };
  req.logout = function() {
    delete req.session.userId;
    res.clearCookie("user");
  };
  req.rememberLocation = function() {
    if (req.route.method == 'get' && !req.xhr)
      res.cookie("loc", conf.origin + req.path, {
        domain: conf.cookieDomain
      });
  };
  req.lastLocation = function() {
    return req.cookies.loc || '/';
  };
  // Finally, populate `req.user`

  if (req.cookies.user){
    req.session.userId = req.cookies.user
  }

  if (req.session.userId) {
    User.findOne({ _id: req.session.userId })
      .exec(function(err, user) {
        if (err) return next(err);
        if (user) {
          res.locals.user = req.user = user;
        }
        return next();
      });
  } else next();
});

// Configure view locals
app.use(function(req, res, next) {
  req.url = req.url.replace(/\/$/, "");
  _.extend(res.locals, utils, {
    _: _,
    conf: conf,
    path: req.path,
    xhr: req.xhr,
    siteTitle: req.i18n.__('site.title'),
    moment: function(input) {
      return moment(input).lang(req.i18n.getLocale());
    },
    duration: function(args) {
      return moment.duration.call(moment, arguments).lang(req.i18n.getLocale());
    }
  });
  next();
});

// Build tree structure

app.use(function(req, res, next){
  req.buildTree = function buildTree(dir, root){
    root.title = path.basename(dir);
    var stats = fs.statSync(dir);
    if (stats.isFile()){
      return root;
    } else if (stats.isDirectory()){
      var children = fs.readdirSync(dir);
      if (children != []){
        root.children = [];
        for (var i = 0; i < children.length; i++ ){
          root.children[i] = {};
          children[i] = dir + "/" + children[i];
          console.log(children[i]);
          root.children.push(buildTree(children[i], root.children[i]))
        }
      } else {
        return root;
      }
    }
  };
  next();
});

app.use(app.router);

app.configure("development", function() {

  // Pretty HTML from Jade
  app.locals.pretty = true;

  // Verbose error handler
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));

  // Stylus compiler
  app.use(stylus.middleware({
    src: conf.publicPath,
    compile: function(str, path) {
      return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib());
    }
  }));

  // Public serving with CORS

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', conf.origin);
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.use(express.static(conf.publicPath));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

app.use(app.router);

require('./routes/index');

mongoose.connect(conf.mongoURL, function(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  http.createServer(app).listen(conf.port, function() {
    console.log('Server is listening on ' + conf.port);
  });
});