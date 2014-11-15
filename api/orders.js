var async       = require('async');
var ripple      = require('ripple-lib');
var remote      = require('./../lib/remote.js');
var respond     = require('./../lib/response-handler.js');
var errors      = require('./../lib/errors.js');

exports.get = getOrders;

function getOrders(request, response, next) {

  var taker_gets = request.params['taker_gets'];
  var taker_pays = request.params['taker_pays'];

  var options = {
    gets: {
      issuer: taker_gets.split('+')[1],
      currency: taker_gets.split('+')[0]
    },
    pays: {
      issuer: taker_pays.split('+')[1],
      currency: taker_pays.split('+')[0]
    }
  };

  var request = remote.requestBookOffers(options);

  request.request(function(err, orders) {
    if (err) {
      next(err);
    } else {
      respond.success(response, { orders: orders });
    }
  });
}
