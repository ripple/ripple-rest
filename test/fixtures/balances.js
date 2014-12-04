var addresses = require('./addresses');

module.exports.requestPath = function(address, params) {
  return '/v1/accounts/' + address + '/balances' + ( params || '' );
};

module.exports.accountInfoResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account_data: {
        Account: addresses.VALID,
        Balance: '922913243',
        Domain: '6578616D706C652E636F6D',
        EmailHash: '23463B99B62A72F26ED677CC556C44E8',
        Flags: 655360,
        LedgerEntryType: 'AccountRoot',
        OwnerCount: 1,
        PreviousTxnID: '19899273706A9E040FDB5885EE991A1DC2BAD878A0D6E7DBCFB714E63BF737F7',
        PreviousTxnLgrSeq: 6614625,
        Sequence: 2938,
        TransferRate: 1002000000,
        WalletLocator: '00000000000000000000000000000000000000000000000000000000DEADBEEF',
        index: '396400950EA27EB5710C0D5BE1D2B4689139F168AC5D07C13B8140EC3F82AE71',
        urlgravatar: 'http://www.gravatar.com/avatar/23463b99b62a72f26ed677cc556c44e8'
      },
      ledger_current_index: 6614628
    }
  });
};

module.exports.accountNotFoundResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'error',
    type: 'response',
    account: addresses.VALID,
    error: 'actNotFound',
    error_code: 15,
    error_message: 'Account not found.',
    ledger_current_index: 8861245,
    request: {
      account: addresses.VALID,
      command: 'account_info',
      id: request.id
    },
    validated: false
  });
};

module.exports.accountLinesResponse = function(request, options) {
  var options = options || {};

  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account: addresses.VALID,
      marker: options.marker,
      limit: request.limit,
      lines: [
        {
        account: 'r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z',
        balance: '0',
        currency: 'ASP',
        limit: '0',
        limit_peer: '10',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z',
        balance: '0',
        currency: 'XAU',
        limit: '0',
        limit_peer: '0',
        no_ripple: true,
        no_ripple_peer: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
        balance: '2.497605752725159',
        currency: 'USD',
        limit: '5',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rHpXfibHgSb64n8kK9QWDpdbfqSpYbM9a4',
        balance: '481.992867407479',
        currency: 'MXN',
        limit: '1000',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun',
        balance: '0.793598266778297',
        currency: 'EUR',
        limit: '1',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK',
        balance: '0',
        currency: 'CNY',
        limit: '3',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rGwUWgN5BEg3QGNY3RX2HfYowjUTZdid3E',
        balance: '1.294889190631542',
        currency: 'DYM',
        limit: '3',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        balance: '0.3488146605801446',
        currency: 'CHF',
        limit: '0',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        balance: '2.114103174931847',
        currency: 'BTC',
        limit: '3',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        balance: '0',
        currency: 'USD',
        limit: '5000',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rpgKWEmNqSDAGFhy5WDnsyPqfQxbWxKeVd',
        balance: '-0.00111',
        currency: 'BTC',
        limit: '0',
        limit_peer: '10',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rBJ3YjwXi2MGbg7GVLuTXUWQ8DjL7tDXh4',
        balance: '-0.1010780000080207',
        currency: 'BTC',
        limit: '0',
        limit_peer: '10',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun',
        balance: '1',
        currency: 'USD',
        limit: '1',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA',
        balance: '8.07619790068559',
        currency: 'CNY',
        limit: '100',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        balance: '7.292695098901099',
        currency: 'JPY',
        limit: '0',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z',
        balance: '0',
        currency: 'AUX',
        limit: '0',
        limit_peer: '0',
        no_ripple: true,
        no_ripple_peer: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'r9vbV3EHvXWjSkeQ6CAcYVPGeq7TuiXY2X',
        balance: '0',
        currency: 'USD',
        limit: '1',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        balance: '12.41688780720394',
        currency: 'EUR',
        limit: '100',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rfF3PNkwkq1DygW2wum2HK3RGfgkJjdPVD',
        balance: '35',
        currency: 'USD',
        limit: '500',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rwUVoVMSURqNyvocPCcvLu3ygJzZyw8qwp',
        balance: '-5',
        currency: 'JOE',
        limit: '0',
        limit_peer: '50',
        no_ripple_peer: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2',
        balance: '0',
        currency: 'USD',
        limit: '0',
        limit_peer: '100',
        no_ripple_peer: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2',
        balance: '0',
        currency: 'JOE',
        limit: '0',
        limit_peer: '100',
        no_ripple_peer: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rs9M85karFkCRjvc6KMWn8Coigm9cbcgcx',
        balance: '0',
        currency: '015841551A748AD2C1F76FF6ECB0CCCD00000000',
        limit: '10.01037626125837',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rEhDDUUNxpXgEHVJtC2cjXAgyx5VCFxdMF',
        balance: '0',
        currency: 'USD',
        limit: '0',
        limit_peer: '1',
        quality_in: 0,
        quality_out: 0
      }
      ]
    }
  });
};

module.exports.accountLinesCounterpartyResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account: addresses.VALID,
      lines: [
      {
        account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        balance: '0.3488146605801446',
        currency: 'CHF',
        limit: '0',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        balance: '2.114103174931847',
        currency: 'BTC',
        limit: '3',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        balance: '0',
        currency: 'USD',
        limit: '5000',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        balance: '7.292695098901099',
        currency: 'JPY',
        limit: '0',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        balance: '12.41688780720394',
        currency: 'EUR',
        limit: '100',
        limit_peer: '0',
        no_ripple: true,
        quality_in: 0,
        quality_out: 0
      }
      ]
    }
  });
};

module.exports.accountLinesNoCounterpartyResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account: addresses.VALID,
      lines: [ ]
    }
  });
};

module.exports.RESTAccountBalancesResponse = function(options) {
  options = options || {};

  return JSON.stringify({
    success: true,
    marker: options.marker,
    limit: options.limit,
    balances: [
      { value: '922.913243', currency: 'XRP', counterparty: '' },
      { value: '0', currency: 'ASP', counterparty: 'r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z' },
      { value: '0', currency: 'XAU', counterparty: 'r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z' },
      { value: '2.497605752725159', currency: 'USD', counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q' },
      { value: '481.992867407479', currency: 'MXN', counterparty: 'rHpXfibHgSb64n8kK9QWDpdbfqSpYbM9a4' },
      { value: '0.793598266778297', currency: 'EUR', counterparty: 'rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun' },
      { value: '0', currency: 'CNY', counterparty: 'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK' },
      { value: '1.294889190631542', currency: 'DYM', counterparty: 'rGwUWgN5BEg3QGNY3RX2HfYowjUTZdid3E' },
      { value: '0.3488146605801446', currency: 'CHF', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
      { value: '2.114103174931847', currency: 'BTC', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
      { value: '0', currency: 'USD', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
      { value: '-0.00111', currency: 'BTC', counterparty: 'rpgKWEmNqSDAGFhy5WDnsyPqfQxbWxKeVd' },
      { value: '-0.1010780000080207', currency: 'BTC', counterparty: 'rBJ3YjwXi2MGbg7GVLuTXUWQ8DjL7tDXh4' },
      { value: '1', currency: 'USD', counterparty: 'rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun' },
      { value: '8.07619790068559', currency: 'CNY', counterparty: 'razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA' },
      { value: '7.292695098901099', currency: 'JPY', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
      { value: '0', currency: 'AUX', counterparty: 'r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z' },
      { value: '0', currency: 'USD', counterparty: 'r9vbV3EHvXWjSkeQ6CAcYVPGeq7TuiXY2X' },
      { value: '12.41688780720394', currency: 'EUR', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
      { value: '35', currency: 'USD', counterparty: 'rfF3PNkwkq1DygW2wum2HK3RGfgkJjdPVD' },
      { value: '-5', currency: 'JOE', counterparty: 'rwUVoVMSURqNyvocPCcvLu3ygJzZyw8qwp' },
      { value: '0', currency: 'USD', counterparty: 'rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2' },
      { value: '0', currency: 'JOE', counterparty: 'rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2' },
      { value: '0', currency: '015841551A748AD2C1F76FF6ECB0CCCD00000000', counterparty: 'rs9M85karFkCRjvc6KMWn8Coigm9cbcgcx' },
      { value: '0', currency: 'USD', counterparty: 'rEhDDUUNxpXgEHVJtC2cjXAgyx5VCFxdMF' }
    ]
  });
};

module.exports.RESTAccountBalancesUSDResponse = JSON.stringify({
  success: true,
  balances: [
    { value: '2.497605752725159', currency: 'USD', counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q' },
    { value: '0', currency: 'USD', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
    { value: '1', currency: 'USD', counterparty: 'rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun' },
    { value: '0', currency: 'USD', counterparty: 'r9vbV3EHvXWjSkeQ6CAcYVPGeq7TuiXY2X' },
    { value: '35', currency: 'USD', counterparty: 'rfF3PNkwkq1DygW2wum2HK3RGfgkJjdPVD' },
    { value: '0', currency: 'USD', counterparty: 'rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2' },
    { value: '0', currency: 'USD', counterparty: 'rEhDDUUNxpXgEHVJtC2cjXAgyx5VCFxdMF' }
  ]
});

module.exports.RESTAccountBalancesXRPResponse = JSON.stringify({
  success: true,
  balances: [
    { value: '922.913243', currency: 'XRP', counterparty: '' }
  ]
});

module.exports.RESTAccountBalancesCounterpartyResponse = JSON.stringify({
  success: true,
  balances: [
    { value: '0.3488146605801446', currency: 'CHF', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
    { value: '2.114103174931847', currency: 'BTC', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
    { value: '0', currency: 'USD', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
    { value: '7.292695098901099', currency: 'JPY', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
    { value: '12.41688780720394', currency: 'EUR', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' }
  ]
});

module.exports.RESTAccountBalancesNoCounterpartyResponse = JSON.stringify({
  success: true,
  balances: [ ]
});

module.exports.RESTAccountBalancesCounterpartyCurrencyResponse = JSON.stringify({
  success: true,
  balances: [
    { value: '12.41688780720394', currency: 'EUR', counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' }
  ]
});
