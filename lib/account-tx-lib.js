var async     = require('async');
var serverlib = require('./server-lib');

function getAccountTransactions(remote, opts, callback) {

  var steps = [

    function(async_callback) {
      serverlib.ensureConnected(remote, async_callback);
    },

    function(connected, async_callback) {
      remote.requestAccountTx({
        account: opts.account,
        ledger_index_min: opts.ledger_index_min || -1,
        ledger_index_max: opts.ledger_index_max || -1,
        binary: opts.binary || false,
        limit: opts.limit || 20,
        descending: opts.descending || false
      }, async_callback);
    },

    function(account_tx_results, async_callback) {
      var transactions = [];

      if (opts.binary) {
        transactions = account_tx_results.transactions;
      } else {

        account_tx_results.transactions.forEach(function(tx_entry){
          if (!tx_entry.validated) {
            return;
          }

          var tx = tx_entry.tx;
          tx.meta = tx_entry.meta;
          transactions.push(tx);
        });

      }

      async_callback(null, transactions);
    }

  ];

  async.waterfall(steps, callback);
}

function countTransactionsPerAccountInLedger(remote, account, ledger_index, callback) {
  getAccountTransactions(remote, {
    account: account,
    ledger_index_min: ledger_index,
    ledger_index_max: ledger_index,
    binary: true
  }, function(err, transactions){
    if (err) {
      callback(err);
      return;
    }

    callback(null, transactions.length);
  });
}

module.exports.getAccountTransactions = getAccountTransactions;
module.exports.countTransactionsPerAccountInLedger = countTransactionsPerAccountInLedger
