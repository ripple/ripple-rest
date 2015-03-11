module.exports.restInvalidParameter = function restInvalidParameter(parameter) {
  return JSON.stringify({
    success: false,
    error_type: 'invalid_request',
    error: 'restINVALID_PARAMETER',
    message: 'Invalid or Missing Parameter: ' + parameter
  });
}

module.exports.RESTMissingSecret = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Parameter missing: secret'
});

module.exports.RESTInvalidSecret = JSON.stringify({ 
  success: false,
  error_type: 'transaction',
  error: 'tejSecretInvalid',
  message: 'Invalid secret'
});

module.exports.RESTInvalidAccount = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Parameter is not a valid Ripple address: account'
});

module.exports.RESTInvalidCounterparty = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Parameter is not a valid Ripple address: counterparty'
});

module.exports.RESTInvalidTransactionHashOrClientResourceID = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Transaction not found. A transaction hash was not supplied and there were no entries matching the client_resource_id.'
});

module.exports.RESTInvalidTransactionHash = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Parameter is not a valid transaction hash: identifier'
});

module.exports.RESTInvalidTransactionNotAnOrder = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Invalid parameter: identifier. The transaction corresponding to the given identifier is not an order'
});

module.exports.RESTTransactionNotFound = JSON.stringify({
  success: false,
  error_type: 'transaction',
  error: 'txnNotFound',
  message: 'Transaction not found.'
});

module.exports.RESTInvalidCurrency = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Parameter is not a valid currency: currency'
});

module.exports.RESTInvalidBase = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Invalid parameter: base. Must be a currency string in the form currency+counterparty'
});

module.exports.RESTInvalidCounter = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Invalid parameter: counter. Must be a currency string in the form currency+counterparty'
});

module.exports.RESTInvalidXRPBase = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Invalid parameter: base. XRP cannot have counterparty'
});

module.exports.RESTInvalidXRPCounter = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'restINVALID_PARAMETER',
  message: 'Invalid parameter: counter. XRP cannot have counterparty'
});

module.exports.RESTAccountNotFound = JSON.stringify({
  success: false,
  error_type: 'transaction',
  error: 'actNotFound',
  message: 'Account not found.'
});

module.exports.RESTCannotConnectToRippleD = JSON.stringify({
  success: false,
  error_type: 'connection',
  error: 'restRIPPLED_NETWORK_ERR',
  message: 'Cannot connect to rippled'
});

module.exports.RESTResponseLedgerSequenceTooHigh = JSON.stringify({
  success: false,
  error_type: 'transaction',
  error: 'tejMaxLedger',
  message: 'Transaction LastLedgerSequence exceeded'
});

module.exports.RESTMaxFeeExceeded = JSON.stringify({
  success: false,
  error_type: 'transaction',
  error: 'tejMaxFeeExceeded',
  message: 'Max fee exceeded'
});

/**
 * Construct REST error response
 *
 * @param options
 *   @param {String} type - error type
 *   @param {String} error - error code
 *   @param {String} message - error message
 * @return {String} REST error response message
 */
module.exports.RESTErrorResponse = function(options) {
  return JSON.stringify({
    success: false,
    error_type: options.type,
    error: options.error,
    message: options.message
  });
};
