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

module.exports.RESTInvalidCounterparty = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter is not a valid Ripple address: counterparty'
});

module.exports.RESTInvalidTransactionHash = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Transaction not found',
  message: 'Missing hash'
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

module.exports.RESTNoLedgerClose = JSON.stringify({
  success: false,
  error_type: 'connection',
  error: 'Cannot connect to rippled',
  message: 'No "ledger_closed" events were heard within 20 seconds, most likely indicating that the connection to rippled has been interrupted or the rippled is unresponsive. Please check your internet connection and server settings and try again.'
});
