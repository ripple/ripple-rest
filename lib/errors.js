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
  this.message = message !== void(0) ? message : 'Cannot connect to rippled';
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

/**
 * Not Found Error
 * Asset could not be found
 */
function NotFoundError(message) {
  this.message = message;
}
NotFoundError.prototype = new Error;
NotFoundError.prototype.name = 'NotFoundError';

/**
 * Time Out Error
 * Request timed out
 */
function TimeOutError(message) {
  this.message = message;
}
TimeOutError.prototype = new Error;
TimeOutError.prototype.name = 'TimeOutError';

/**
 * API Error
 * API logic failed to do what it intended
 */
function ApiError(message) {
  this.message = message;
}
ApiError.prototype = new Error;
ApiError.prototype.name = 'ApiError';

module.exports = {
  InvalidRequestError: InvalidRequestError,
  NetworkError: NetworkError,
  TransactionError: TransactionError,
  RippledNetworkError: RippledNetworkError,
  NotFoundError: NotFoundError,
  TimeOutError: TimeOutError,
  ApiError: ApiError
};