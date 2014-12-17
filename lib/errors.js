/**
 * Invalid Request Error
 * Missing parameters or invalid parameters
 */
function InvalidRequestError(message) {
  this.message = message;
}
InvalidRequestError.prototype = new Error;
InvalidRequestError.prototype.name = 'InvalidRequestError';
InvalidRequestError.prototype.error = 'restINVALID_PARAMETER';

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
RippledNetworkError.prototype.error = 'restRIPPLED_NETWORK_ERR';

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
NotFoundError.prototype.error = 'restNOT_FOUND';

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

/**
 * DuplicateTransaction Error
 * Another transaction already exists with the same key
 */
function DuplicateTransactionError(message) {
  this.message = message;
}
DuplicateTransactionError.prototype = new ApiError;
DuplicateTransactionError.prototype.error = 'restDUPLICATE_TRANSACTION';

/**
 * Database Error
 * An error occurred while reading or writing to permanent storage
 */
function DatabaseError(message) {
  this.message = message;
}
DatabaseError.prototype = new Error;
DatabaseError.prototype.name = 'DatabaseError';

module.exports = {
  InvalidRequestError: InvalidRequestError,
  NetworkError: NetworkError,
  TransactionError: TransactionError,
  RippledNetworkError: RippledNetworkError,
  NotFoundError: NotFoundError,
  TimeOutError: TimeOutError,
  ApiError: ApiError,
  DuplicateTransactionError: DuplicateTransactionError,
  DatabaseError: DatabaseError
};