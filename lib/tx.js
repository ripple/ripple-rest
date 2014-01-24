var ripple = require('ripple-lib'),
  OutgoingTx = require('../models/outgoingTx');


module.exports.getTx = function(remote, tx_hash, callback) {

  ensureRemoteConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    remote.requestTx(tx_hash, function(err, tx){
      if (err) {
        callback(err);
        return;
      }

      // Get container ledger to find close_time
      remote.requestLedger(tx.inLedger, function(err, ledger){
        if (err) {
          callback(err);
          return;
        }

        tx.close_time_unix = ripple.utils.toTimestamp(ledger.close_time);

        callback(null, tx);

      });

      
    });

  });

};



/*
 *  opts
 *    src_address: '...',
 *    secret: '...',
 *    tx_json: {...}
 */
module.exports.submitTx = function(remote, opts, callback) {

  var src_address = opts.src_address, 
    secret = opts.secret,
    tx = opts.tx_json || opts.tx || opts,
    initial_hash;

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

      // Special case for handling XRP given as an object
      // ripple-lib doesn't like it so pass it as a string
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
    }

    // Setup event handlers

    tx.once('error', callback);

    // Once tx has been submitted to rippled, send the initial hash
    // back to the user and save the entry into the db
    tx.once('proposed', function(proposed) {

      initial_hash = proposed.tx_json.hash;

      tx.removeListener('error', callback);

      // save to db
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

      });      

    // Once the tx has been confirmed in the ledger, update the db entry
    // to associate the initial_hash with the final tx_hash
    tx.once('success', function(confirmed_tx) {

      // console.log('success: ' + JSON.stringify(confirmed_tx));

      // Update db entry with tx_hash and tx_result
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

    });

    tx.submit();

  });
    
};


/* HELPER FUNCTIONS */

function ensureRemoteConnected(remote, callback) {

  if (!remote || typeof remote !== 'object') {
    callback(new Error('invalidRemote'));
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
