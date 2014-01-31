module.exports = function(res, error) {

  // TODO categorize and format errors

  var err_obj = {
    success: false,
    error: error.error || error.message || error.engine_result || error,
    message: error.message || error.engine_result_message || error
  };

  /* Handle ripple-lib errors */
  if (err_obj.error === 'remoteError') {
    err_obj.error = 'Internal Error';
    err_obj.message = 'The ripple-lib Remote used by this service reported an error. If the problem persists, please try restarting the server';
  }


  /* Add info to rippled error messages */

  if (err_obj.error === 'tecPATH_DRY') {
    err_obj.message = err_obj.message + ' Please ensure that the src_address has sufficient funds (in the src_amount currency, if specified) to execute this transaction.';
  }

  if (err_obj.error === 'telINSUF_FEE_P') {
    err_obj.message = err_obj.message + ' Please ensure that the src_address has sufficient XRP to pay the fee. If it does, please report this error, this service should handle setting the proper fee.';
  }



  console.log('Error: ', err_obj);
  if (error.stack) {
    console.log(error.stack);
  }

  res.send(err_obj);

};