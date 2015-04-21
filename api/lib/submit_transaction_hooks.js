/* eslint-disable valid-jsdoc */
'use strict';
var _ = require('lodash');
var ripple = require('ripple-lib');

/**
 *  Used to hold methods defined by caller to customize transaction submit
 */
function SubmitTransactionHooks(hooks) {
  this.hooks = hooks;
}

/**
 *  Used to override default transaction initialization (Optional)
 *
 *  @param {Function} async_callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Transaction} transaction - Transaction object that is used to
 *                                     submit requests to ripple
 */
SubmitTransactionHooks.prototype.initializeTransaction =
  function(async_callback) {
  // Transactions are normally constructed with remote.transaction().
  // However, if the caller wants to override this behavior and provide
  // their own transaction object, they can do so by passing in
  // hooks.initializeTransaction and pass their transaction through
  // the callback
  if (_.isFunction(this.hooks.initializeTransaction)) {
    return this.hooks.initializeTransaction(async_callback);
  }

  async_callback(null, new ripple.Transaction());
};

/**
 *  Used to validate request parameters asyncronously
 *
 *  @param {Function} async_callback
 *
 *  @callback
 *  @param {Error} error
 */
SubmitTransactionHooks.prototype.validateParams = function(async_callback) {
  if (this.hooks.validateParams) {
    this.hooks.validateParams(async_callback);
  } else {
    async_callback();
  }
};

/**
 *  Used to format messages received from ripple-lib which will be
 *  returned to client
 *
 *  @param {Object} message - Response object from ripple
 *  @param {Object} meta - Object that holds metadata about the transaction
 *  @param {String} meta.hash - Hash of the transaction
 *  @param {String} meta.ledger - Ledger sequence that the transaction
 *                                is being considered for
 *  @param {String "validated"|"pending"} meta.validated - String that holds
 *                                            whether transaction is validated
 *  @param {Function} async_callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Object} result - Object that is returned to the client
 */
SubmitTransactionHooks.prototype.formatTransactionResponse = function(
    message, meta, async_callback, waitForValidated) {
  this.hooks.formatTransactionResponse(message, meta, async_callback,
                                       waitForValidated);
};

/**
 *  Used to set appropriate parameters on transaction
 *
 *  @param {Transaction} transaction - Transaction object that is used to
 *                                     submit requests to ripple
 *
 *  @returns undefined
 */
SubmitTransactionHooks.prototype.setTransactionParameters =
    function(transaction) {
  this.hooks.setTransactionParameters(transaction);
};

module.exports = SubmitTransactionHooks;
