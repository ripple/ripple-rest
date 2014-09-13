module.exports.RESTInvalidAccount = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter is not a valid Ripple address: account'
});

module.exports.RESTInvalidDestinationAccount = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter is not a valid Ripple address: destination_account'
});

module.exports.RESTInvalidTransactionHash = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Transaction not found',
  message: 'Missing hash'
});
