var config        = require('./config-loader');
var respond       = require('./response-handler.js');
var errors        = require('./errors.js');
var logger        = require('./logger.js').logger;

var InvalidRequestError   = errors.InvalidRequestError;
var NetworkError          = errors.NetworkError;
var RippledNetworkError   = errors.RippledNetworkError;
var NotFoundError         = errors.NotFoundError;
var TimeOutError          = errors.TimeOutError;
var ApiError              = errors.ApiError;
var DatabaseError         = errors.DatabaseError;

module.exports = handleError;

function handleError(error, req, res, next) {
  // If in debug mode, print errors
  if (config.get('debug')) {
    if (error && error.remote) {
      logger.error(error.remote);
    } else if (error && error.stack) {
      logger.error(error.stack);
    } else {
      logger.error(error);
    }
  }

  var err_obj = {
    success: false,
    error: (error.remote ? error.remote.error : null) || error.error || error.message || error.engine_result || error,
    message: (error.remote ? error.remote.error_message : null) || error.error_message || error.message || error.engine_result_message || error
  };

  if (err_obj.error === 'txnNotFound' || err_obj.error === 'actNotFound') {
    return respond.transactionNotFoundError(res, void(0), err_obj);
  }

  /* Handle ripple-lib errors */
  if (err_obj.error === 'remoteError') {
    if (err_obj.message === 'Account not found.') {
      err_obj.error = 'Invalid address or secret.';
      err_obj.message = 'Please ensure the address and secret correspond to a valid account that has a positive XRP balance.';

    } else {
      err_obj.error = 'Internal Error';
      err_obj.message = 'ripple-lib reported an error. If the problem persists, please try restarting the server. Error: ' + JSON.stringify(err_obj.message);
    }
  }

  if (err_obj.error === 'Cannot generate keys from invalid seed!' || err_obj.error === 'temBAD_AUTH_MASTER') {
    err_obj.error = 'Invalid address or secret.';
    err_obj.message = 'Please ensure the address and secret correspond to a valid account that has a positive XRP balance.';
  }

  if (err_obj.error === 'tooBusy') {
    err_obj.error = 'Rippled Busy';
    err_obj.message = 'The server is experiencing heavy load and is unable to process the request right now. Please try again.';
  }

  /* Add info to rippled error messages */
  if (err_obj.error === 'tecPATH_DRY') {
    err_obj.message = err_obj.message + ' Please ensure that the source_address has sufficient funds (in the source_amount currency, if specified) to execute this transaction.';
  }

  if (err_obj.error === 'telINSUF_FEE_P') {
    err_obj.message = err_obj.message + ' Please ensure that the source_address has sufficient XRP to pay the fee. If it does, please report this error, this service should handle setting the proper fee.';
  }

  if (err_obj.error === 'tecPATH_PARTIAL') {
    err_obj.message = err_obj.message + ' Please try getting payment options first to ensure that there is a way to execute this payment. If you submitted a payment from the list of options, the path may have changed already, please try getting payment options again and submitting one of those or setting the "source_slippage" higher.';
  }

  if (err_obj.error === err_obj.message) {
    var err_array = err_obj.error.split('. ');
    err_obj.error = err_array[0];
    err_obj.message = err_array.slice(1).join('. ');
  }

  if (!err_obj.message) {
    delete err_obj.message;
  }

  switch(error.name) {
    case InvalidRequestError.name:
      respond.invalidRequest(res, void(0), err_obj);
      break;
    case NetworkError.name:
      respond.connectionError(res, void(0), err_obj);
      break;
    case RippledNetworkError.name:
      respond.connectionError(res, void(0), err_obj);
      break;
    case NotFoundError.name:
      respond.notFoundError(res, void(0), err_obj);
      break;
    case TimeOutError.name:
      respond.timeOutError(res, void(0), err_obj);
      break;
    case ApiError.name:
      respond.apiError(res, void(0), err_obj);
      break;
    case DatabaseError.name:
      respond.apiError(res, void(0), err_obj);
      break;
    default:
      respond.transactionError(res, void(0), err_obj);
      break;
  }

};
