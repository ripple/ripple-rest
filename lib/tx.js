var ripple = require('ripple-lib');
/**
 *  opts
 *    remote
 *    tx_hash
 */
module.exports.getTx = function(opts, callback) {

  var remote = opts.remote,
    tx_hash = opts.hash || opts.tx_hash;

  ensureRemoteConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    remote.requestTx(tx_hash, function(err, tx){
      if (err) {
        callback(new Error('Transaction does not exist. tx_hash: ' + tx_hash + ' is either invalid or does not refer to a validated transaction'));
        return;
      }

      // Get container ledger to find close_time
      remote.requestLedger(tx.inLedger, function(err, res){
        if (err) {
          callback(err);
          return;
        }

        tx.close_time_unix = ripple.utils.toTimestamp(res.ledger.close_time);

        callback(null, tx);

      });

      
    });

  });

};



/*
 *  opts
 *    remote
 *    OutgoingTx
 *    src_address: '...',
 *    secret: '...',
 *    tx_json: {...}
 */
module.exports.submitTx = function(opts, callback) {

  var remote = opts.remote,
    OutgoingTx = opts.OutgoingTx,
    tx = opts.tx_json || opts.tx || opts,
    src_address = opts.src_address || tx.Account, 
    secret = opts.secret,
    initial_hash;

  if (!OutgoingTx) {
    console.log('Warning: no OutgoingTx queue given so there will be no way to associate the response from submitTx with a notification later');
  }

  ensureRemoteConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    // Set secret
    try {
      remote.set_secret(src_address, secret);
    } catch (e) {
      callback(new Error('Invalid parameter: secret. Must provide valid Ripple account secret to sign transaction'));
      return;
    }

    // Determine if tx is already a ripple-lib Transaction or just json
    if (tx.constructor.name === 'Transaction') {

      tx.remote = remote;

    } else if (tx.constructor.name === 'Object') {

      // Special case for handling XRP given as an object,
      // ripple-lib doesn't like it so pass it as a string instead
      Object.keys(tx).forEach(function(key){
        if (typeof tx[key] === 'object' && tx[key].currency === 'XRP' && !tx[key].issuer) {
          tx[key] = '' + tx[key].value + 'XRP';
        }
      });

      // Create transaction
      try {
        tx = remote.transaction(opts.tx);
      } catch (e) {
        callback(e);
        return;
      }
    } else {
      callback(new Error('Invalid parameter: tx. Must provide a ripple tx in JSON format or a ripple-lib Transaction object'));
    }

    // Setup event handlers

    tx.once('error', callback);

    // Once tx has been submitted to rippled, send the initial hash
    // back to the user and save the entry into the db
    tx.once('proposed', function(proposed) {

      initial_hash = proposed.tx_json.hash;

      tx.removeListener('error', callback);

      // save to db
      // TODO fix this scope with OutgoingTx
      if (OutgoingTx) {
        OutgoingTx
          .create({
            initial_hash: initial_hash,
            submitted_at_ledger: remote._ledger_current_index - 1,
            src_address: src_address,
            tx_type: tx.type || tx.tx_json.TransactionType,
            tx_state: 'submitted' 
          })
          .error(function(err){
            console.log('error updated initial OutgoingTx record: ' + err);
            callback(err);
          })
          .success(function(entry){
            // Send initial hash back to user
            callback(null, initial_hash);
          });
      }

    });      

    // Once the tx has been confirmed in the ledger, update the db entry
    // to associate the initial_hash with the final tx_hash
    tx.once('success', function(confirmed_tx) {

      // console.log('success: ' + JSON.stringify(confirmed_tx));

      // Update db entry with tx_hash and tx_result
      if (OutgoingTx) {
        OutgoingTx
          .update({
            // UPDATE
            tx_hash: confirmed_tx.transaction.hash, 
            tx_result: confirmed_tx.meta.TransactionResult
          }, {
            // WHERE
            initial_hash: initial_hash
          })
          .error(function(err){
            console.log('error updated OutgoingTx record: ' + err);
          })
          .success(function(){
            // console.log('update db entry for initial_hash: ' + initial_hash + ' with tx_hash: ' + confirmed_tx.transaction.hash);
          });
      }

    });

    tx.submit();

  });
    
};


/* HELPER FUNCTIONS */

function ensureRemoteConnected(remote, callback) {

  if (!remote || typeof remote !== 'object') {
    callback(new Error('Invalid parameter: remote. Must provide a ripple-lib Remote object'));
    return;
  }

  if (remote._connected === true) {
    callback(null, true);
  } else {
    remote.connect();
    remote.once('ledger_closed', function(){
      callback(null, true);
    });
  }

}
