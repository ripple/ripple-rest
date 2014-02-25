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
    secret = opts.secret,
    initial_hash;

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

    // Once tx has been submitted to rippled, send the initial hash
    // back to the user and save the entry into the db
    tx.once('proposed', function(proposed) {

      initial_hash = proposed.json.hash;

      tx.removeListener('error', callback);
      process.removeListener('uncaughtException', callback);


      // Save transaction to database
      if (OutgoingTx) {
        OutgoingTx
          .create({
            initial_hash: initial_hash,
            submitted_at_ledger: remote._ledger_current_index - 1,
            source_address: source_address,
            type: tx.type || tx.json.TransactionType,
            state: 'submitted' 
          })
          .error(function(err){
            callback(new Error('Error saving to database. Please ensure that the database is configured and connected properly. You may need to run db-migrate, see the documentation for setup instructions. Error: ' + err));
          })
          .success(function(entry){
            // Send initial hash back to user
            callback(null, initial_hash);
          });
      } else {
        console.log('Transaction proposed with initial_hash: ' + initial_hash);
      }

      // Setup listener to watch for failures
      tx.once('error', function(error){
        OutgoingTx
          .update({
            hash: '',
            state: 'failed',
            result: error.engine_result
          }, {
            source_address: source_address,
            initial_hash: initial_hash
          })
          .complete(function(err, updated){
            if (err) {
              console.log('Cannot updated db entry with failed tx result: ' + error + '. ' + err);
            }
          });
      });

    });      

    // Once the tx has been confirmed in the ledger, update the db entry
    // to associate the initial_hash with the final hash
    tx.once('success', function(confirmed_tx) {

      // Update db entry with hash and result
      if (OutgoingTx) {
        OutgoingTx
          .update({
            // UPDATE
            state: 'confirmed',
            hash: confirmed_tx.transaction.hash, 
            result: confirmed_tx.meta.TransactionResult
          }, {
            // WHERE
            initial_hash: initial_hash
          })
          .error(function(err){
            console.log('error updated OutgoingTx record: ' + err);
          })
          .success(function(){
            // console.log('update db entry for initial_hash: ' + initial_hash + ' with hash: ' + confirmed_tx.transaction.hash);
          });
      } else {
        console.log('Transaction confirmed: ', confirmed_tx);
      }

    });

    tx.submit();

  });
    
};
