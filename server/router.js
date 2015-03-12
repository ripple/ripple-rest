'use strict';
var _ = require('lodash');
var express = require('express');
var api = require('../api');
var errors = require('../api').errors;
var routes = require('./routes');
var generateIndexPage = require('./indexpage');

var router = new express.Router();
router.get('/', generateIndexPage);

/**
 * For all the routes, we need a connected rippled
 * insert the validateRemoteConnected middleware here
 */

/* make sure the api is connected to a rippled */
router.all('*', function(req, res, next) {
  if (api.isConnected()) {
    next();
  } else {
    next(new errors.RippledNetworkError(undefined));
  }
});

function connectRoutes(routeMap) {
  var methods = {
    'GET': router.get,
    'POST': router.post,
    'DELETE': router.delete,
    'PUT': router.put
  };
  _.forIn(methods, function(connector, method) {
    _.forIn(routeMap[method] || {}, function(middleware, url) {
      connector.call(router, url, middleware);
    });
  });
}

connectRoutes(routes);

module.exports = router;
