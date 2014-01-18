module.exports = function(res, error) {
  res.send({
    success: false,
    error: error
  });

  console.log('error: ' + error);
};