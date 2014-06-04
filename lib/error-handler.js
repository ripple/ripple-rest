var config = require('../config/config-loader');

module.exports = handleError;

function handleError(error, req, res, next) {
  // If in debug mode, print errors
  if (config.get('debug')) {
    if (error && error.remote) {
      console.log(error.remote);
    } else if (error && error.stack) {
      console.log(error.stack);
    } else {
      console.log(error);
    }
  }

  var err_obj = {
    success: false,
    error: (error.remote ? error.remote.error : null) || error.error || error.message || error.engine_result || error,
    message: (error.remote ? error.remote.error_message : null) || error.error_message || error.message || error.engine_result_message || error
  };

  /* Handle db errors */
  if (/Error: column .* does not exist/.test(err_obj.error)) {
    err_obj.message = 'ripple-rest cannot write to one of the needed tables. This likely means that the database migrations were not run. Please run "./node_modules/.bin/grunt" from ripple-rest\'s root directory. ' + err_obj.error;
    err_obj.error = 'Database Not Configured Properly';
  }

  if (/SQLITE_ERROR/.test(err_obj.error)) {
    err_obj.message = 'ripple-rest has a sqlite error: ' + err_obj.error;
    err_obj.error = 'Database Not Configured Properly';
  }

  /* Handle ripple-lib errors */
  if (err_obj.error === 'remoteError') {
    if (err_obj.message === 'Account not found.') {
      err_obj.error = 'Invalid address or secret.';
      err_obj.message = 'Please ensure the address and secret correspond to a valid account that has a positive XRP balance.';

    } else {
      err_obj.error = 'Internal Error';
      err_obj.message = 'ripple-lib reported an error. If the problem persists, please try restarting the server. Error: ' + JSON.stringify(err_obj.message);
    }
  }

  if (err_obj.error === 'Cannot generate keys from invalid seed!' || err_obj.error === 'temBAD_AUTH_MASTER') {
    err_obj.error = 'Invalid address or secret.';
    err_obj.message = 'Please ensure the address and secret correspond to a valid account that has a positive XRP balance.';
  }


  if (err_obj.error === 'tooBusy') {
    err_obj.error = 'Rippled Busy';
    err_obj.message = 'The server is experiencing heavy load and is unable to process the request right now. Please try again.';
  }

  /* Handle db errors */
  if (/(relation).*(does not exist)/.test(err_obj.error)){
    var old_error = err_obj.error;
    err_obj.error = 'Database Error';
    err_obj.message = 'This error is likely caused by the setup script failing to execute properly. Please check that PostgreSQL is running on your system and run the setup script again. ' + old_error;
  }

  /* Add info to rippled error messages */
  if (err_obj.error === 'tecPATH_DRY') {
    err_obj.message = err_obj.message + ' Please ensure that the source_address has sufficient funds (in the source_amount currency, if specified) to execute this transaction.';
  }

  if (err_obj.error === 'telINSUF_FEE_P') {
    err_obj.message = err_obj.message + ' Please ensure that the source_address has sufficient XRP to pay the fee. If it does, please report this error, this service should handle setting the proper fee.';
  }

  if (err_obj.error === 'tecPATH_PARTIAL') {
    err_obj.message = err_obj.message + ' Please try getting payment options first to ensure that there is a way to execute this payment. If you submitted a payment from the list of options, the path may have changed already, please try getting payment options again and submitting one of those or setting the "source_slippage" higher.';
  }

  if (err_obj.error === err_obj.message) {
    var err_array = err_obj.error.split('. ');
    err_obj.error = err_array[0];
    err_obj.message = err_array.slice(1).join('. ');
  }

  if (!err_obj.message) {
    delete err_obj.message;
  }

  res.json(err_obj);
};

