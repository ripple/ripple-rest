var async = require('async');

function getTx (remote, hash, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  var steps = [

    function(async_callback) {
      remote.requestTx(hash, async_callback);
    },

    function(tx, async_callback) {
      remote.requestLedger(tx.ledger_index, function(err, res){
        if (err) {
          async_callback(err);
          return;
        }

        tx.date = res.ledger.close_time;
        async_callback(null, tx);
      });
    }

  ];

  async.waterfall(steps, callback);
  
}

module.exports.getTx = getTx;