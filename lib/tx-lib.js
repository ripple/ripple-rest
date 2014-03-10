var async     = require('async');
var serverlib = require('./server-lib');
var validator = require('./schema-validator');

function getTx (remote, hash, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  if (validator.validate(hash, 'Hash256').length !== 0) {
    callback(new Error('Invalid Parameter: hash. Must be a hex encoded 256-bit hash of a transaction'));
    return;
  }

  var steps = [

    function(async_callback) {
      serverlib.ensureConnected(remote, async_callback);
    },

    function(connected, async_callback) {
      remote.requestTx(hash, async_callback);
    },

    function(tx, async_callback) {
      if (!tx) {
        async_callback();
        return;
      }

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