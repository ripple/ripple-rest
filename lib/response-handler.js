/**
 * Response handler
 * Format http(s) responses and appropriate error codes
 *
 * Every response will have JSON body containing at least the `success` property
 * Responses will be accompanied by appropriate error codes
 *
 * In case of error, an error type and optional message will be supplied
 *
 *
 * HTTP Status Codes
 *
 * 200 OK - Everything worked as expected.
 * 202 Accepted - Request has been accepted for processing.
 * 400 Bad Request - Often missing a required parameter.
 * 402 Request Failed - Parameters were valid but request failed.
 * 404 Not Found - The requested item doesn't exist.
 * 500 Internal Server Error - Unexpected condition occurred
 * 502 Bad Gateway - Invalid/unexpected response from rippled
 * 503 Service Unavailable - Rippled busy
 * 504 Gateway Timeout - Rippled response timed out
 *
 *
 * Error Types
 *
 * invalid_request_error - Invalid request errors arise when the request has invalid parameters.
 * connection_error - Rippled is busy or could not be connected, timed out, etc.
 * api_error - response from rippled or internal processing error
 *
 */

var _ = require('lodash');

module.exports = {
  success: success,
  invalidRequest: invalidRequest,
  internalError: internalError,
  connectionError: connectionError,
  rippledConnectionError: rippledConnectionError
};

/**
 * Send a success response
 *
 * @param response - response object
 * @param body - (optional) body to the response, in addition to the success property
 */
function success(response, body) {

  var content =
  {
    success: true
  };

  if (body !== void(0)) {
    content = _.extend(content, body);
  }

  send(response, content, 200);
}

/**
 * Send an invalid request response
 *
 * @param response - response object
 * @param message - (optional) message to accompany and describe the invalid response
 * @param body - (optional) additional body to the response
 */
function invalidRequest(response, message, body) {

  var content =
  {
    success: false,
    error_type: 'invalid_request_error'
  };

  if (message !== void(0)) {
    content.message = message;
  }

  if (body !== void(0)) {
    content = _.extend(content, body);
  }

  send(response, content, 200);
}

/**
 * Send an internal error response
 *
 * @param response - response object
 * @param message - (optional) additional error message, e.g. description for provided error
 * @param body - (optional) additional body to the response
 */
function internalError(response, message, body) {

  var content =
  {
    success: false,
    error_type: 'api_error'
  };

  if (message !== void(0)) {
    content.message = message;
  }

  if (body !== void(0)) {
    content = _.extend(content, body);
  }

  send(response, content, 500);
}

/**
 * Send an connection error response
 *
 * @param response - response object
 * @param message - (optional) additional error message
 * @param body - (optional) additional body to the response
 */
function connectionError(response, message, body) {

  var content =
  {
    success: false,
    error_type: 'connection_error'
  };

  if (message !== void(0)) {
    content.message = message;
  }

  if (body !== void(0)) {
    content = _.extend(content, body);
  }

  send(response, content, 200);
}


function rippledConnectionError(response) {
  connectionError(response, '')
}

/**
 * Send a JSON response
 *
 * @param response - response object
 * @param body
 * @param statusCode
 */
function send(response, body, statusCode) {
  response.json(statusCode, body);
}