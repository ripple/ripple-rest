var express = require('express');
var rippleRest = require(__dirname+'/index');
var app = express();

app.use('/', rippleRest.router);

module.exports = app;

