'use strict';

var app = require('../app')
  , User = require('../model/user')
  , Element = require('../model/element')
  , path = require('path')
  , fs = require('fs')
  , conf = require('../conf')
  , _ = require('underscore')
  , mkdirp = require('mkdirp')
  , rho = require('rho');

var checkOwner = function(user, file){
  if (file.owner.equals(user._id)){
    return true;
  } else{
    return false;
  }
};

var checkEditor = function(user, file){
  switch (file.state){
    case ("invite"):
      for (var i = 0; i < file.editors.length; i++){
        if (file.editors[i] == user.email){
          return true
        }
      }
      break;

    case ("public"):
      return true;
      break;
  }
  return false;
};

app.post('/render', function(req, res, next) {
  var text = req.param('text');
  rho.render(text, function(err, html) {
    if (err) return next(err);
    res.send(html);
  });
});

app.all('/file/:id*', function(req, res, next){
  if (!req.user){
    req.rememberLocation();
    return res.redirect("/login");
  }
  Element.findById(req.param("id"))
    .exec(function(err, elem){
      if (err) return next(err);
      req.owner = res.locals.owner = checkOwner(req.user, elem);
      req.editor = res.locals.editor = checkEditor(req.user, elem);
      req.elem = res.locals.elem = elem;
      next();
    });
});

app.get('/file/:id/new', function(req, res, next){
  if (req.owner){
    if (!req.xhr) return res.send(404, "This page is not exist");
    res.render('file/new', {id: req.param("id")})
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.post('/file/:id/new', function(req, res, next){
  if (req.owner){
    var elem = new Element({
      owner: req.user.id,
      title: req.body.title + ".rho",
      state: req.body.state
    });
    elem.path = req.elem.path + "/" + elem._id;
    elem.save(function(err, elem){
      if (err) return next(err);
      var fullPath = conf.storagePath + "/" + elem.path;
      mkdirp(path.dirname(fullPath), function(err){
        if (err) return next(err);
        fs.writeFile(
          fullPath,
          conf.helloText,
          {encoding: "UTF-8"},
          function(err){
            if (err) return next(err);
            console.log(req.cookies.loc);
            res.json({
              redirect: req.lastLocation()
            })
          })
      });
    });
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.get('/file/:id', function(req, res, next){
  if (req.owner || req.editor){
    var fullPath = conf.storagePath + "/" + req.elem.path;
    fs.stat(fullPath, function(err, stat) {
      if (err) {
        if (err.code == 'ENOENT') {
          res.statusCode = 404;
          req.url += ".edit";
          return next();
        } else return next(err);
      }
      if (stat.isDirectory())
        return next(new Error("File " + relPath + " resolves to a directory"));
      fs.readFile(fullPath, { encoding: 'utf-8' }, function(err, text) {
        if (err) return next(err);
        rho.render(text, function(err, html) {
          if (err) return next(err);
          res.render('file/view', {
            html: html,
            id: req.elem._id
          });
        });
      });
    })
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.get('/file/:id/rename', function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  if (req.owner || req.admin){
    res.render('file/rename', {id: req.param("id"), title:req.elem.title});
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.post('/file/:id/rename', function(req, res, next){
  if (req.owner || req.admin){
    var newTitle = req.param("title") + ".rho";
    req.elem.title = newTitle;
    req.elem.save(function(err){
      if (err) return next(err);
      res.json({
        redirect: req.lastLocation()
      })
    })
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.get('/file/:id/delete', function(req, res, next){
  if (!req.xhr) return res.send(404, "This page is not exist");
  if (req.owner || req.admin){
    res.render('file/delete', {id: req.param("id"), title:req.elem.title});
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.post('/file/:id/delete', function(req, res, next){
  if (req.owner || req.admin){
    var url = req.param("id");
    fs.unlink(conf.storagePath + "/" + req.elem.path, function(err){
      if (err) return next(err);
      req.elem.remove(function(err){
        if (err) return next(err);
        res.json({
          redirect: req.lastLocation()
        })
      })
    })
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.get('/file/:id/edit', function(req, res, next){
  if (req.owner || req.editor){
    var fullPath = conf.storagePath + "/" + req.elem.path;
    fs.stat(fullPath, function(err, stat) {
      if (err) {
        if (err.code == 'ENOENT') {
          res.statusCode = 404;
          req.url += ".edit";
          return next();
        } else return next(err);
      }
      if (stat.isDirectory())
        return next(new Error("File " + fullPath + " resolves to a directory"));
      fs.readFile(fullPath, { encoding: 'utf-8' }, function(err, text) {
        if (err) return next(err);
        rho.render(text, function(err, html) {
          if (err) return next(err);
          res.render('file/edit', {
            text: text,
            html: html,
            id: req.elem._id
          });
        });
      });
    })
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.post('/file/:id/edit', function(req, res, next){
  var text = req.param('text').trim();
  var fullPath = conf.storagePath + "/" + req.elem.path;
  if (req.owner || req.editor){
    if (text) {
      var dir = path.dirname(fullPath);
      mkdirp(dir, function(err) {
        if (err) return next(err);
        fs.writeFile(fullPath,
          text,
          { encoding: 'utf-8' },
          function(err) {
            if (err) return next(err);
            res.json({
              notices: res.notices.info('Saved.').get()
            });
          });
      });
    } else fs.unlink(fullPath, function(err) {
      if (err) return next(err);
      req.elem.remove();
      res.json({
        notices: res.notices.info('Page deleted.').get(),
        redirect: req.lastLocation()
      });
    });
  }
});

app.get('/file/:id/settings', function(req, res, next){
  if (req.owner){
    res.render('file/settings', {elem:req.elem, id:req.elem._id})
  } else {
    res.send(404, "You don't have access to this file")
  }
});

app.post('/file/:id/settings/state', function(req, res, next){
  req.elem.state = req.param("state");
  req.elem.save(function(err, elem){
    if (err) return next(err);
    req.elem = res.locals.elem = elem;
    res.json({
      notices: res.notices.info("File's state was successfully changed").get()
    })
  })
});

app.post('/file/:id/settings/editors', function(req, res, next){
  User.findOne({email:req.param("email")})
    .exec(function(err, user){
      if (err) return next(err);
      if (user){
        req.elem.editors.push(req.param("email"));
        req.elem.save(function(err, elem){
          if (err) return next(err);
          req.elem = res.locals.elem = elem;
          res.json({
            notices: res.notices.info("Editor was successfully added").get()
          })
        })
      } else {
        res.json({
          notices: res.notices.error("This email doesn't register").get()
        })
      }
    })
});

app.delete('/file/:id/settings/editors', function(req, res, next){
  User.findOne({email:req.param("email")})
    .exec(function(err, user){
      if (err) return next(err);
      if (user){


        req.elem.editors.splice(_.indexOf(req.elem.editors, req.param("email")), 1);
        req.elem.save(function(err, elem){
          if (err) return next(err);
          req.elem = res.locals.elem = elem;
          res.json({
            notices: res.notices.info("Editor was successfully remove").get()
          })
        })
      } else {
        res.json({
          notices: res.notices.error("This email doesn't register").get()
        })
      }
    })
});
