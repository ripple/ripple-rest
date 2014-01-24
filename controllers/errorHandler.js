module.exports = function(res, error) {

  // TODO categorize and format errors

  console.log('error: ' + JSON.stringify(err_obj));

  var err_obj = {
    success: false,
    error: error.message || error.engine_result || error,
    message: error.message || error.engine_result_message || error
  };

  res.send(err_obj);

};