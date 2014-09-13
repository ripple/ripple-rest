module.exports.accountInfoResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account_data: {
        Account: 'rLy6UWsjzxsQrTATf1bwDYSaJMoTGvfY2Q',
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

module.exports.RESTAccountSettingsResponse = JSON.stringify({
  success: true,
  settings: {
    account: 'rLy6UWsjzxsQrTATf1bwDYSaJMoTGvfY2Q',
    transfer_rate: 1002000000,
    password_spent: false,
    require_destination_tag: true,
    require_authorization: false,
    disallow_xrp: true,
    disable_master: false,
    transaction_sequence: '2938',
    email_hash: '23463B99B62A72F26ED677CC556C44E8',
    wallet_locator: '00000000000000000000000000000000000000000000000000000000DEADBEEF',
    wallet_size: '',
    message_key: '',
    domain: 'example.com',
    signers: ''
  }
});
