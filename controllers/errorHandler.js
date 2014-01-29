module.exports = function(res, error) {

  // TODO categorize and format errors

  var err_obj = {
    success: false,
    error: error.message || error.engine_result || error,
    message: error.message || error.engine_result_message || error
  };

  console.log('Error: ', err_obj);

  res.send(err_obj);

};