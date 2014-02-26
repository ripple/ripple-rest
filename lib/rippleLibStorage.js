module.exports = function(opts) {
  var db = opts.db,
    OutgoingTx = opts.OutgoingTx;

    return {
      saveTransaction: function(transaction_data, callback) {
        var tx_json = transaction_data.tx_json,
          source_address = transaction_json.Account,
          source_transaction_id = transaction_data.source_transaction_id,
          submitted_ids = transaction_data.submitted_ids,
          submission_attempts = transaction_data.submission_attempts,
          state = transaction_data.state,
          engine_result = transaction_data.engine_result,
          engine_result_message = transaction_data.engine_result_message;

        OutgoingTx.find({
          where: {
            source_address: source_address,
            source_transaction_id: source_transaction_id
          }
        }).complete(function(err, res){
          if (err) {
            console.log('Error saving transaction: ' + err);
            callback(err);
            return;
          }

          var db_entry = {
            source_address: source_address,
            source_transaction_id: source_transaction_id,
            tx_json: tx_json,
            submitted_ids: submitted_ids,
            submission_attempts: submission_attempts,
            state: state,
            engine_result: engine_result,
            engine_result_message: engine_result_message
          };

          if (res) {
            OutgoingTx.update(db_entry, {
              source_address: source_address,
              source_transaction_id: source_transaction_id
            }).complete(callback);
          } else {
            OutgoingTx.create(db_entry).complete(callback);
          }
        });
      },
      loadPendingTransactions: function(callback) {

        OutgoingTx.findAll({
          where: {
            state: 'pending'
          }
        }).complete(function(err, res){
          if (err) {
            console.log('Error loading pending transactions: ' + err);
            callback(err);
            return;
          }

          var value_array = [];
          if (typeof res === 'object' && res.length > 0) {
            res.forEach(function(db_obj){
              value_array.push(db_obj.values);
            });
          }

          callback(null, value_array);
        });
      }
    };

};
