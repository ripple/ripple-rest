var ripple        = require('ripple-lib');
var rpparser      = require('./rpparser');
var remoteConnect = require('./remoteConnect');
/**
 *  opts
 *    remote
 *    address
 *    hash
 *    ledger_index
 */
module.exports.getTx = function(opts, callback) {
  var remote = opts.remote,
    address = opts.address || opts.account,
    hash = opts.hash || opts.hash;

  if (!hash || !rpparser.isTxHash(hash)) {
    callback(new Error('Invalid parameter: hash. Must provide a transaction hash to look for'));
    return;
  }

  remoteConnect.ensureConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    remote.requestTx(hash, function(err, tx){
      if (err) {
        callback(new Error('Cannot locate transaction. This may be the result of an incomplete rippled historical database or that transaction may not exist. ' + err));
        return;
      }

      callback(null, tx);
    });

  });
};


/*
 *  opts
 *    remote
 *    OutgoingTx
 *    source_address: '...',
 *    secret: '...',
 *    json: {...}
 */
module.exports.submitTx = function(opts, callback) {

  var remote = opts.remote,
    OutgoingTx = opts.OutgoingTx,
    tx = opts.json || opts.tx || opts,
    source_address = opts.source_address || tx.Account,
    source_transaction_id = tx.source_transaction_id,
    secret = opts.secret;

  if (!OutgoingTx) {
    console.log('Warning: no OutgoingTx queue given so there will be no way to associate the response from submitTx with a notification later');
  }

  remoteConnect.ensureConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    // Set secret, throw error if it is invalid
    try {
      remote.set_secret(source_address, secret);
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
        tx = remote.transaction(tx);
      } catch (e) {
        callback(e);
        return;
      }
    } else {
      callback(new Error('Invalid parameter: tx. Must provide a ripple tx in JSON format or a ripple-lib Transaction object'));
    }

    // Setup event handlers

    // Setup error handlers for caught and uncaught exceptions
    tx.once('error', callback);
    process.on('uncaughtException', callback);

    tx.once('proposed', function(proposed) {

      tx.removeListener('error', callback);
      process.removeListener('uncaughtException', callback);

      callback(null, source_transaction_id);

    });      

    // Attach an iff function to the transaction that checks if the transaction
    // should be submitted or not, based on the entries in the database
    tx.iff(function(tx_data, callback){

      if (!OutgoingTx) {
        callback(null, true);
        return;
      }

      OutgoingTx.find({
        where: {
          source_address: tx_data.tx_json.Account,
          source_transaction_id: tx_data.source_transaction_id,
          type: 'payment',
          reported: false
        }
      }).complete(function(err, res){
        if (err) {
          console.log('Error finding transaction in db: ' + err);
          callback(null, true); // Continue submitting transaction
          return;
        }

        // Cancel submission if there is a matching entry in the db
        // with some state other than failed or failed_offline
        if (res && typeof res.values.state === 'string' && res.values.state.toLowerCase().indexOf('failed') !== -1) {
          callback(null, false);
        } else {
          callback(null, true);
        }
      });

    });

    tx.submit();

  });
    
};
