'use strict';

var app = require('../app')
  , fs = require('fs')
  , rho = require('rho')
  , conf = require('../conf')
  , path = require('path')
  , mkdirp = require('mkdirp');

app.get('/', function(req, res, next) {
  req.url = "/index.html";
  next();
});

app.post('/render', function(req, res, next) {
  var text = req.param('text');
  rho.render(text, function(err, html) {
    if (err) return next(err);
    res.send(html);
  });
});

app.get('/*.html', function(req, res, next) {
  var relPath = '/' + req.params[0];
  var file = path.join(conf.storagePath, relPath + ".rho");
  fs.stat(file, function(err, stat) {
    if (err) {
      if (err.code == 'ENOENT') {
        res.statusCode = 404;
        req.url += ".edit";
        return next();
      } else return next(err);
    }
    if (stat.isDirectory())
      return next(new Error("File " + relPath + " resolves to a directory"));
    // TODO cache me!!!
    fs.readFile(file, { encoding: 'utf-8' }, function(err, text) {
      if (err) return next(err);
      rho.render(text, function(err, html) {
        if (err) return next(err);
        res.render('page/view', {
          text: text,
          html: html,
          relPath: relPath
        });
      });
    });
  });
});

app.all('/*.edit', function(req, res, next) {
  if (!req.allowsEdit) {
    req.rememberLocation();
    res.redirect("/auth/login");
  } else next();
});

app.get('/*.html.edit', function(req, res, next) {
  var relPath = '/' + req.params[0];
  var file = path.join(conf.storagePath, relPath + ".rho");
  fs.stat(file, function(err, stat) {
    if (err) {
      if (err.code == 'ENOENT') {
        return res.render('page/edit', {
          relPath: relPath
        });
      } else return next(err);
    }
    if (stat.isDirectory())
      return next(new Error("File " + relPath + " resolves to a directory"));
    fs.readFile(file, { encoding: 'utf-8' }, function(err, text) {
      if (err) return next(err);
      rho.render(text, function(err, html) {
        if (err) return next(err);
        res.render('page/edit', {
          text: text,
          html: html,
          relPath: relPath
        });
      });
    });
  });
});

app.post('/*.html.edit', function(req, res, next) {
  var relPath = '/' + req.params[0];
  var file = path.join(conf.storagePath, relPath + ".rho");
  var text = req.param('text').trim();
  if (text) {
    var dir = path.dirname(file);
    mkdirp(dir, function(err) {
      if (err) return next(err);
      fs.writeFile(file,
        text,
        { encoding: 'utf-8' },
        function(err) {
          if (err) return next(err);
          res.json({
            notices: res.notices.info('Saved.').get()
          });
        });
    });
  } else fs.unlink(file, function(err) {
    if (!err)
      res.notices.info('Page deleted.');
    res.json({
      notices: res.notices.get()
    });
  });
});