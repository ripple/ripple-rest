module.exports.paymentRest = {
  "source_account": "r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE",
  "destination_account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
  "destination_amount": {
    "value": "0.001",
    "currency": "USD",
    "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
  }
};

module.exports.paymentRestXRP = {
  "source_account": "r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE",
  "destination_account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
  "destination_amount": {
    "value": "1",
    "currency": "XRP",
    "issuer": ""
  }
};

module.exports.paymentRestComplex = {
  "source_account": "r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ",
  "source_tag": "",
  "source_amount": {
    "value": "10",
    "currency": "USD",
    "issuer": "r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ"
  },
  "source_slippage": "0",
  "destination_account": "rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V",
  "destination_tag": "",
  "destination_amount": {
    "value": "10",
    "currency": "USD",
    "issuer": "r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ"
  },
  "invoice_id": "",
  "paths": "[]",
  "partial_payment": false,
  "no_direct_ripple": false
};

module.exports.paymentTx = {
  tx_json: {
    Flags: 0,
    TransactionType: 'Payment',
    Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
    Amount: {
      value: '0.001',
      currency: 'USD',
      issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
    },
    Destination: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
  },
  clientID: undefined,
  submittedIDs: [

  ],
  submissionAttempts: undefined,
  submitIndex: undefined,
  initialSubmitIndex: undefined,
  lastLedgerSequence: undefined,
  state: 'unsubmitted',
  server: undefined,
  finalized: false
};

module.exports.paymentTxXRP = {
  tx_json: {
    Flags: 0,
    TransactionType: 'Payment',
    Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
    Amount: '1000000',
    Destination: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
  },
  clientID: undefined,
  submittedIDs: [

  ],
  submissionAttempts: undefined,
  submitIndex: undefined,
  initialSubmitIndex: undefined,
  lastLedgerSequence: undefined,
  state: 'unsubmitted',
  server: undefined,
  finalized: false
};

module.exports.paymentTxComplex = {
  tx_json: {
    Flags: 0,
    TransactionType: 'Payment',
    Account: 'r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ',
    Amount: {
      value: '10',
      currency: 'USD',
      issuer: 'r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ'
    },
    Destination: 'rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V'
  },
  clientID: undefined,
  submittedIDs: [

  ],
  submissionAttempts: undefined,
  submitIndex: undefined,
  initialSubmitIndex: undefined,
  lastLedgerSequence: undefined,
  state: 'unsubmitted',
  server: undefined,
  finalized: false
};