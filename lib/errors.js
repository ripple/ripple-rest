/**
 * Invalid Request Error
 * Missing parameters or invalid parameters
 */
function InvalidRequestError(message) {
  this.message = message;
}
InvalidRequestError.prototype = new Error;
InvalidRequestError.prototype.name = 'InvalidRequestError';

/**
 * Network Error
 * Timeout, disconnects and too busy
 */
function NetworkError(message) {
  this.message = message;
}
NetworkError.prototype = new Error;
NetworkError.prototype.name = 'NetworkError';

/**
 * Rippled NetworkError
 * Failed transactions, no paths found, not enough balance, etc.
 */
function RippledNetworkError(message) {
  this.message = message !== void(0) ? message : 'No connection to rippled';
}
RippledNetworkError.prototype = new NetworkError;

/**
 * Transaction Error
 * Failed transactions, no paths found, not enough balance, etc.
 */
function TransactionError(message) {
  this.message = message;
}
TransactionError.prototype = new Error;
TransactionError.prototype.name = 'TransactionError';


module.exports = {
  InvalidRequestError: InvalidRequestError,
  NetworkError: NetworkError,
  TransactionError: TransactionError,
  RippledNetworkError: RippledNetworkError
}