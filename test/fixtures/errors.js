module.exports.RESTInvalidSecret = JSON.stringify({ 
  success: false,
  error_type: 'transaction',
  error: 'Invalid secret' 
});

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

module.exports.RESTInvalidDestinationAmount = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Invalid parameter: destination_amount',
  message: 'Must be an amount string in the form value+currency+issuer'
});

module.exports.RESTInvalidCounterparty = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter is not a valid Ripple address: counterparty'
});

module.exports.RESTInvalidTransactionHash = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Transaction not found',
  message: 'A transaction hash was not supplied and there were no entries matching the client_resource_id.'
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
  error: 'Parameter is not a valid currency: currency'
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
  error: 'Cannot connect to rippled'
});

module.exports.RESTResponseLedgerSequenceTooHigh = JSON.stringify(
  {
    "success": false,
    "error_type": "transaction",
    "error": "tefMAX_LEDGER",
    "message": "Ledger sequence too high."
  }
);

module.exports.RESTLedgerMissingWithMarker = JSON.stringify(
  { 
    success: false,
    error_type: 'transaction',
    error: 'A ledger_index or ledger_hash must be provided when using a marker' 
  }
);

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
  return JSON.stringify(
    {
      "success": false,
      "error_type": options.type,
      "error": options.error,
      "message": options.message
    }
  );
};