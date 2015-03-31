'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('./logger.js').logger;
var morgan = require('./logger.js').morgan;
var config = require('./config');
var router = require('./router.js');
var version = require('./version.js');
var compress = require('compression');
var generateIndexPage = require('./indexpage');

var app = express();

app.set('json spaces', 2);
app.disable('x-powered-by');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(compress());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  next();
});

morgan(app);

if (config.get('debug')) {
  app.use(function (req, res, next) {
    logger.info(req.method, req.url, req.body);
    next();
  });
}

app.use('/v' + version.getApiVersion(), router);
app.get('/', generateIndexPage);
app.use(require('./error-handler'));


module.exports = app;
