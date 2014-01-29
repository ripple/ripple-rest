module.exports = function(res, error) {

  // TODO categorize and format errors

  var err_obj = {
    success: false,
    error: error.message || error.engine_result || error,
    message: error.message || error.engine_result_message || error
  };


  /* Add info to error messages */

  if (err_obj.error === 'tecPATH_DRY') {
    err_obj.message = err_obj.message + ' Please ensure that the src_address has sufficient funds (in the src_amount currency, if specified) to execute this transaction.';
  }



  console.log('Error: ', err_obj);

  res.send(err_obj);

};