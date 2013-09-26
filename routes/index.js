'use strict';

var app = require('../app');

app.get('/', function(req, res, next){
  console.log();
  res.render('index')
});

require('./auth');
require('./docs');