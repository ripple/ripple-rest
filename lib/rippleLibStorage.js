module.exports = function(opts) {
  var db = opts.db,
    RippleLibQueuedTx = opts.RippleLibQueuedTx;

    return {
      loadAccounts: function(callback) {
        db.query(
          "SELECT DISTINCT account_id FROM ripple_lib_queued_transactions"
          ).complete(function(err, accounts){
            if (err) {
              callback(new Error('Error loading accounts: ' + err));
              return;
            }

            callback(null, accounts);
          });
      },

      loadAccount: function(account_id, callback) {
        RippleLibQueuedTx.find({ 
          where: { account_id: account_id } 
        }).complete(function(err, data){
          if (err) {
            callback(new Error('Error loading account: ' + account_id + ' from ripple-lib database. Error: ' + err));
            return;
          }
          
          var parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            callback(new Error('Error parsing data from ripple-lib database. Bad JSON. Error: ' + err));
            return;
          }

          if (parsed && parsed.transactions) {
            callback(null, parsed.transactions);
          } else {
            callback(null, null);
          }
        });
      },

      saveAccount: function(account_id, data) {
        var data_str = JSON.stringify(data);

        RippleLibQueuedTx.find({ 
          where: { account_id: account_id }
        }).complete(function(err, account){
          if (err) {
            throw (new Error('Error connecting to RippleLibQueuedTx: ' + err));
          }

          if (account && account.values && account.values.account_id === account_id) {
            account.updateAttributes({
              transactions: data_str
            }).error(function(err){
              throw(new Error('Error updating account ' + account_id + ' in ripple_lib_queued_transactions db table: ' + err));
            });
          } else {
            RippleLibQueuedTx.create({
              account_id: account_id,
              transactions: data_str
            }).error(function(err){
              throw(new Error('Error updating account entry for account: ' + account_id + ' in ripple_lib_queued_transactions db table: ' + err));
            });
          }
        });

      }
    };

};
