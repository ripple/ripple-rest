const URL     = require('url');
const ripple  = require('ripple-lib');
const express = require('express');
const bodyParser = require('body-parser');
var config = require(__dirname+'/config-loader');
var app = express();
var remote = require(__dirname+'/remote.js');
var dbinterface = require(__dirname+'/db-interface');
var router = require(__dirname+'/router.js');

app.remote = remote;

function rippleAddressParam(param) {
  return function(req, res, next, address) {
    if (ripple.UInt160.is_valid(address)) {
      next();
    } else {
      res.send(400, {
        success: false,
        message: 'Specified address is invalid: ' + param
      });
    }
  };
};

app.param('account', rippleAddressParam('account'));
app.param('destination_account', rippleAddressParam('destination account'));

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  next();
});

app.use(bodyParser.json());
app.use(function(request, response, next) {
  response.setHeader('Content-Type', 'application/json');
  next();
});

app.use('/v1', router);
app.use(require(__dirname+'/error-handler'));
app.set('json spaces', 2);

module.exports = app;

