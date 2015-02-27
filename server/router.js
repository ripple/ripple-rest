const _         = require('lodash');
const ripple    = require('ripple-lib');
const express   = require('express');
const api       = require('../api');
const errors    = require('../api').errors;
const respond   = require('./response-handler');
const version   = require('./version');
const routes    = require('./routes');
const generateIndexPage = require('./indexpage');

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
    next(new errors.RippledNetworkError(void(0)));
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
