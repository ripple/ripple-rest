module.exports.tableName = 'transaction_history';

module.exports.unsubmittedTransaction = {
  tx_json: {
    Flags: 2147483648,
    TransactionType: 'Payment',
    Account: 'rE11mrzyNueCRuNJumyH45g64GxLbn83La',
    Amount: '1000000',
    Destination: 'rB6Q1q9ZBLnhFRk9YJyMPpSFmY1cF2R4h7',
    LastLedgerSequence: 10008763,
    Sequence: 3828,
    Fee: '12000',
  },
  clientID: '6ed55eb0-02ef-49e0-b427-2e9acd11ec56',
  submittedIDs: [ '90530248735B46CCF02AEB63E673524C7DC37D9C0CEF96527DB4DD7CFF1F9F0F' ],
  submissionAttempts: 1,
  submitIndex: 10008760,
  initialSubmitIndex: 10008760,
  lastLedgerSequence: 10008763,
  state: 'unsubmitted',
  finalized: false
};

module.exports.pendingTransaction = {
  tx_json: {
    Flags: 2147483648,
    TransactionType: 'Payment',
    Account: 'rE11mrzyNueCRuNJumyH45g64GxLbn83La',
    Amount: '1000000',
    Destination: 'rB6Q1q9ZBLnhFRk9YJyMPpSFmY1cF2R4h7',
    LastLedgerSequence: 10008763,
    Sequence: 3828,
    Fee: '12000',
  },
  clientID: '6ed55eb0-02ef-49e0-b427-2e9acd11ec56',
  submittedIDs: [ '90530248735B46CCF02AEB63E673524C7DC37D9C0CEF96527DB4DD7CFF1F9F0F' ],
  submissionAttempts: 1,
  submitIndex: 10008760,
  initialSubmitIndex: 10008760,
  lastLedgerSequence: 10008763,
  state: 'pending',
  finalized: false,
  result: {
    engine_result: 'tesSUCCESS',
    engine_result_message: 'The transaction was applied.',
    ledger_hash: void(0),
    ledger_index: void(0),
    transaction_hash: '90530248735B46CCF02AEB63E673524C7DC37D9C0CEF96527DB4DD7CFF1F9F0F'
  }
};

module.exports.validatedTransaction = {
  tx_json: {
    Flags: 2147483648,
    TransactionType: 'Payment',
    Account: 'rE11mrzyNueCRuNJumyH45g64GxLbn83La',
    Amount: '1000000',
    Destination: 'rB6Q1q9ZBLnhFRk9YJyMPpSFmY1cF2R4h7',
    LastLedgerSequence: 10008763,
    Sequence: 3828,
    Fee: '12000',
  },
  clientID: '6ed55eb0-02ef-49e0-b427-2e9acd11ec56',
  submittedIDs: [ '90530248735B46CCF02AEB63E673524C7DC37D9C0CEF96527DB4DD7CFF1F9F0F' ],
  submissionAttempts: 1,
  submitIndex: 10008760,
  initialSubmitIndex: 10008760,
  lastLedgerSequence: 10008763,
  state: 'validated',
  finalized: true,
  result: {
    engine_result: 'tesSUCCESS',
    engine_result_message: 'The transaction was applied.',
    ledger_hash: '2F5DFCEE1FF0DF6EEB7C3ABEA61A5B1717B9647A01C6654514554B527700A8B0',
    ledger_index: 10008761,
    transaction_hash: '90530248735B46CCF02AEB63E673524C7DC37D9C0CEF96527DB4DD7CFF1F9F0F'
  }
};
