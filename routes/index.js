'use strict';

var app = require('../app');

app.get('/', function(req, res, next){
  res.render('index')
});

require('./auth');
require('./docs');