var pathfindLib = require('../lib/pathfind'),
  errorHandler = require('./errorHandler');

module.exports = function(opts) {

  var remote = opts.remote;

  return {

    getPathFind: function(req, res) {

      var src_address = req.param('address'),
        dst_address = req.param('dst_address'),
        dst_amount_param = req.param('dst_amount')
        dst_amount;

      if (typeof dst_amount_param === 'string') {

        var dst_amount_array = dst_amount_param.split(' ');

        if (dst_amount_array.length === 2 || dst_amount_array.length === 3) {
          dst_amount = {
            value: dst_amount_array[0],
            currency: dst_amount_array[1],
            issuer: (dst_amount_array.length === 3 ?
              dst_amount_array[2] :
              '')
          };          
        } else {
          errorHandler(res, new Error('Invalid parameter: dst_amount. Must be astring in the form \'1+USD+r...\''));
          return;
        }

      } else {
        errorHandler(res, new Error('Invalid parameter: dst_amount. Must be a string in the form \'1+USD+r...\''));
        return;
      }

      pathfindLib.getPathFind(remote, {
        src_address: src_address,
        dst_address: dst_address,
        dst_amount: dst_amount
      }, function(err, payments){
        if (err) {
          errorHandler(res, err);
          return;
        }

        res.send({
          success: true,
          payments: payments
        });

      });

    }

  };

};
