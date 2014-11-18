module.exports.requestPath = function(address, params) {
  return '/v1/orders/USD+' + address + '/BTC+' + address;
};

module.exports.bookOffersResponse = function(request) {
    return JSON.stringify({
        id: request.id,
        status: 'success',
        type: 'response',
        result: {
          ledger_current_index: 10013965,
          offers: [
            { Account: 'rJ3PD8CYiJJYttdXgbGQYUFMEydngM3CgZ',
              BookDirectory: 'ABB30B04603FD6A3954BCCB0A0E17A45C3D067FC915B8FAA570DD7EA45C86B85',
              BookNode: '0000000000000000',
              Flags: 131072,
              LedgerEntryType: 'Offer',
              OwnerNode: '0000000000000000',
              PreviousTxnID: '1D8A16D80B5804428A4D7C7C4AAD8E7177353599EC3E305388C2DF8693253DA4',
              PreviousTxnLgrSeq: 10013937,
              Sequence: 93080,
              TakerGets: {
                currency: 'BTC',
                issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
                value: '0.01999094468495912'
              },
              TakerPays: {
                currency: 'USD',
                issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
                value: '7.789623308413769' },
                index: '1F5B457E6ADBE0510F2FCBEE8FCA401A08FA98AD30B864B8F0BD432EAD199CFE',
                owner_funds: '0.106022371778024',
                quality: '389.6575890320261'
          },
          {
            Account: 'rwBYyfufTzk77zUSKEu4MvixfarC35av1J',
            BookDirectory: 'ABB30B04603FD6A3954BCCB0A0E17A45C3D067FC915B8FAA570DD87C6E03A5CE',
            BookNode: '0000000000000000',
            Flags: 0,
            LedgerEntryType: 'Offer',
            OwnerNode: '0000000000000008',
            PreviousTxnID: 'D6FCF85E1BB4F6343F157EB35A60957425B21216BE7A5A3E9D7CD966F1FC47D3',
            PreviousTxnLgrSeq: 10013798,
            Sequence: 155824,
            TakerGets: {
              currency: 'BTC',
              issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
              value: '1.1904'
            },
            TakerPays: {
              currency: 'USD',
              issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
              value: '463.9231201765844' },
              index: 'E5B1494C293F190CBCDBB756DA97681DC82C91C25DFF7272989BB9E4BFF9A9EE',
              owner_funds: '45.55264069531509',
              quality: '389.7203630515662' }

          ],
          validated: false
        }

    });
};

module.exports.RESTOrdersResponse = JSON.stringify({
  success: true,
  orders: {
    ledger_current_index: 10013965,
    offers: [
      { Account: 'rJ3PD8CYiJJYttdXgbGQYUFMEydngM3CgZ',
        BookDirectory: 'ABB30B04603FD6A3954BCCB0A0E17A45C3D067FC915B8FAA570DD7EA45C86B85',
        BookNode: '0000000000000000',
        Flags: 131072,
        LedgerEntryType: 'Offer',
        OwnerNode: '0000000000000000',
        PreviousTxnID: '1D8A16D80B5804428A4D7C7C4AAD8E7177353599EC3E305388C2DF8693253DA4',
        PreviousTxnLgrSeq: 10013937,
        Sequence: 93080,
        TakerGets: {
          currency: 'BTC',
          issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
          value: '0.01999094468495912'
        },
        TakerPays: {
          currency: 'USD',
          issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
          value: '7.789623308413769' },
          index: '1F5B457E6ADBE0510F2FCBEE8FCA401A08FA98AD30B864B8F0BD432EAD199CFE',
          owner_funds: '0.106022371778024',
          quality: '389.6575890320261'
    },
    {
      Account: 'rwBYyfufTzk77zUSKEu4MvixfarC35av1J',
      BookDirectory: 'ABB30B04603FD6A3954BCCB0A0E17A45C3D067FC915B8FAA570DD87C6E03A5CE',
      BookNode: '0000000000000000',
      Flags: 0,
      LedgerEntryType: 'Offer',
      OwnerNode: '0000000000000008',
      PreviousTxnID: 'D6FCF85E1BB4F6343F157EB35A60957425B21216BE7A5A3E9D7CD966F1FC47D3',
      PreviousTxnLgrSeq: 10013798,
      Sequence: 155824,
      TakerGets: {
        currency: 'BTC',
        issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
        value: '1.1904'
      },
      TakerPays: {
        currency: 'USD',
        issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
        value: '463.9231201765844' },
        index: 'E5B1494C293F190CBCDBB756DA97681DC82C91C25DFF7272989BB9E4BFF9A9EE',
        owner_funds: '45.55264069531509',
        quality: '389.7203630515662' }

    ],
    validated: false
  }

});

