module.exports = function(res, error) {

  // TODO categorize and format errors

  console.log('error: ' + JSON.stringify(err_obj));

  var err_obj = {
    success: false,
    error: (typeof error === 'string' ? error : error.error || error.message),
    message: (typeof error === 'string' ? '' : error.message)
  };

  res.send(err_obj);

};