module.exports = function(res, error) {

  console.log('Error: ', error);
  if (error.stack) {
    console.log(error.stack);
  }

  var err_obj = {
    success: false,
    error: (error.remote ? error.remote.error : null) || error.error || error.message || error.engine_result || error,
    message: (error.remote ? error.remote.error_message : null) || error.error_message || error.message || error.engine_result_message || error
  };


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

  if (err_obj.error === 'Cannot generate keys from invalid seed!') {
    err_obj.error = 'Invalid address or secret.';
    err_obj.message = 'Please ensure the address and secret correspond to a valid account that has a positive XRP balance.'
  }


  /* Add info to rippled error messages */

  if (err_obj.error === 'tecPATH_DRY') {
    err_obj.message = err_obj.message + ' Please ensure that the src_address has sufficient funds (in the src_amount currency, if specified) to execute this transaction.';
  }

  if (err_obj.error === 'telINSUF_FEE_P') {
    err_obj.message = err_obj.message + ' Please ensure that the src_address has sufficient XRP to pay the fee. If it does, please report this error, this service should handle setting the proper fee.';
  }

  if (err_obj.error === 'tecPATH_PARTIAL') {
    err_obj.message = err_obj.message + ' Please try getting payment options first to ensure that there is a way to execute this payment. If you submitted a payment from the list of options, the path may have changed already, please try getting payment options again and submitting one of those or setting the "src_slippage" higher.';
  }

  if (err_obj.error === err_obj.message) {
    var err_array = err_obj.error.split('. ');
    err_obj.error = err_array[0];
    err_obj.message = err_array.slice(1).join('. ');
  }


  res.send(err_obj);

};