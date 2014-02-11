module.exports = function(opts) {
  var db = opts.db,
    RippleLibQueuedTx = opts.RippleLibQueuedTx;

    return {
      loadAccounts: function(callback) {
        db.query(
          "SELECT DISTINCT account_id FROM ripple_lib_queued_txs"
          ).complete(callback);
      },

      loadAccount: function(account, callback) {
        RippleLibQueuedTx.find({ 
          where: { account_id: account } 
        }).complete(function(err, data){
          if (err) {
            callback(new Error('Error loading account: ' + account + ' from ripple-lib database. Error: ' + err));
            return;
          }
          var parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            callback(new Error('Error parsing data from ripple-lib database. Bad JSON. Error: ' + err));
            return;
          }

          callback(null, parsed.transactions || null);
        });
      },

      saveAccount: function(account, data) {
        var data_str = JSON.stringify(data);

        RippleLibQueuedTx.findOrCreate({
          account_id: account 
        }, {
          transactions: data_str
        }).error(function(err){
          console.log('Error saving to ripple_lib_queued_transactions db table in saveAccount: ' + err);
        }).success(function(account, created){
          if (created) {
            console.log('Created entry for account: ', account.account_id);
          } else {
            account.updateAttributes({
              transactions: data_str
            }).error(function(){
              console.log('Error updating account ' + account.account_id + ' in ripple_lib_queued_transactions db table in saveAccount: ' + err);
            });
          }
        });
      }
    };

};
