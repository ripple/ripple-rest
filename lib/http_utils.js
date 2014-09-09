var _ = require('lodash');

module.exports = {
  success: success,
  error: error
};

/**
 * Send a success response
 *
 * @param res - (required) response object
 * @param properties - (optional) additional objects to attach to the response body
 * @param statusCode - (optional) statusCode to respond with, default for success is 200
 */
function success(res, properties, statusCode) {

  var response =
  {
    success: true
  };

  respond(res, response, properties, statusCode ? statusCode : 200);
};

/**
 * Send an error response
 * @param res - (required) response object
 * @param error - (required) error code or information
 * @param message - (optional) additional error message, e.g. description for provided error
 * @param properties - (optional) additional objects to attach to the response body
 * @param statusCode - (optional) statusCode to respond with, default for error is 500
 */
function error(res, error, message, properties, statusCode) {

  var response =
  {
    success: false,
    error: error
  };

  if (message) {
    response.message = message;
  }

  respond(res, response, properties, statusCode ? statusCode : 500);
};

/**
 * Send a JSON response
 * @param res - (required) response object
 * @param response - (required) response body to send
 * @param properties - (optional) additional objects to attach to the response body
 * @param statusCode
 */
function respond(res, response, properties, statusCode) {
  if (properties !== void(0)) {
    response = _.extend(response, properties);
  }

  res.json(statusCode, response);
}