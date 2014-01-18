module.exports = function(res, error) {
  res.send({
    success: false,
    error: error.message || error
  });

  console.log('error: ' + error);
};