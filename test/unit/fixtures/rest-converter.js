/* eslint-disable new-cap */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
'use strict';

var _ = require('lodash');
var addresses = require('./../../fixtures').addresses;

module.exports.paymentRest = {
  'source_account': addresses.VALID,
  'destination_account': addresses.COUNTERPARTY,
  'destination_amount': {
    'value': '0.001',
    'currency': 'USD',
    'issuer': addresses.COUNTERPARTY
  }
};

module.exports.paymentRestXRP = {
  'source_account': addresses.VALID,
  'destination_account': addresses.COUNTERPARTY,
  'destination_amount': {
    'value': '1',
    'currency': 'XRP',
    'issuer': ''
  }
};

module.exports.paymentRestXRPtoXRP = {
  'source_account': addresses.VALID,
  'source_amount': {
    'value': '1',
    'currency': 'XRP',
    'issuer': ''
  },
  'destination_account': addresses.COUNTERPARTY,
  'destination_amount': {
    'value': '1',
    'currency': 'XRP',
    'issuer': ''
  },
  'paths': '[]'
};

module.exports.paymentRestComplex = {
  'source_account': addresses.VALID,
  'source_tag': '',
  'source_amount': {
    'value': '10',
    'currency': 'USD',
    'issuer': addresses.VALID
  },
  'source_slippage': '0',
  'destination_account': addresses.COUNTERPARTY,
  'destination_tag': '',
  'destination_amount': {
    'value': '10',
    'currency': 'USD',
    'issuer': addresses.VALID
  },
  'invoice_id': '',
  'partial_payment': false,
  'no_direct_ripple': false
};

module.exports.paymentTx = {
  tx_json: {
    Flags: 0,
    TransactionType: 'Payment',
    Account: addresses.VALID,
    Amount: {
      value: '0.001',
      currency: 'USD',
      issuer: addresses.COUNTERPARTY
    },
    Destination: addresses.COUNTERPARTY
  },
  clientID: undefined,
  submittedIDs: [ ],
  submissionAttempts: 0,
  submitIndex: undefined,
  initialSubmitIndex: undefined,
  lastLedgerSequence: undefined,
  state: 'unsubmitted',
  finalized: false
};

module.exports.paymentTxXRP = {
  tx_json: {
    Flags: 0,
    TransactionType: 'Payment',
    Account: addresses.VALID,
    Amount: '1000000',
    Destination: addresses.COUNTERPARTY
  },
  clientID: undefined,
  submittedIDs: [ ],
  submissionAttempts: 0,
  submitIndex: undefined,
  initialSubmitIndex: undefined,
  lastLedgerSequence: undefined,
  state: 'unsubmitted',
  finalized: false
};

module.exports.paymentTxComplex = {
  tx_json: {
    Flags: 0,
    TransactionType: 'Payment',
    Account: addresses.VALID,
    Amount: {
      value: '10',
      currency: 'USD',
      issuer: addresses.VALID
    },
    SendMax: {
      value: '10',
      currency: 'USD',
      issuer: addresses.VALID
    },
    Destination: addresses.COUNTERPARTY
  },
  clientID: undefined,
  submittedIDs: [ ],
  submissionAttempts: 0,
  submitIndex: undefined,
  initialSubmitIndex: undefined,
  lastLedgerSequence: undefined,
  state: 'unsubmitted',
  finalized: false
};

module.exports.exportsPaymentRestIssuers = function(options) {

  options = options || {};
  _.defaults(options, {
    sourceAccount: addresses.VALID,
    destinationAccount: addresses.COUNTERPARTY,
    sourceIssuer: '',
    destinationIssuer: '',
    sourceValue: '10',
    destinationCurrency: 'USD',
    sourceCurrency: 'USD',
    paths: '[]'
  });

  return {
    source_account: options.sourceAccount,
    source_tag: '',
    source_amount: {
      value: options.sourceValue,
      currency: options.sourceCurrency,
      issuer: options.sourceIssuer
    },
    source_slippage: options.sourceSlippage,
    destination_account: options.destinationAccount,
    destination_tag: '',
    destination_amount: {
      value: '10',
      currency: options.destinationCurrency,
      issuer: options.destinationIssuer
    },
    invoice_id: '',
    paths: options.paths,
    partial_payment: false,
    no_direct_ripple: false
  };

};
