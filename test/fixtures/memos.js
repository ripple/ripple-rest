var addresses = require('./../fixtures').addresses;

var fromAccount = addresses.VALID;
var fromSecret = addresses.SECRET;
var toAccount = addresses.COUNTERPARTY;


module.exports.paymentWithMemo = {
  "secret": fromSecret,
  "client_resource_id": "1",
  "payment": {
    "source_account": fromAccount,
    "source_tag": "",
    "source_amount": {
      "value": "0.0001",
      "currency": "XRP",
      "issuer": ""
    },
    "source_slippage": "0.01",
    "destination_account": toAccount,
    "destination_tag": "",
    "destination_amount": {
      "value": "0.0001",
      "currency": "XRP",
      "issuer": ""
    },
    "invoice_id": "",
    "paths": "[]",
    "partial_payment": false,
    "no_direct_ripple": false,
    "memos": [
      {
        "MemoType": "some_key",
        "MemoData": "some_value"
      },
      {
        "MemoData": "some_value"
      }
    ]
  }
};

module.exports.transactionResponse = function() {
  return JSON.stringify(
    {
      "id": 2,
      "status": "success",
      "type": "response",
      "result": {}
    }
  );
}


module.exports.accountInfoResponse = function(request) {
  return JSON.stringify(
    {
      "id": request.id,
      "status": "success",
      "type": "response",
      "result": {
        "account_data": {
          "Account": fromAccount,
          "Balance": "30999545",
          "Flags": 0,
          "LedgerEntryType": "AccountRoot",
          "OwnerCount": 2,
          "PreviousTxnID": "272B581E78B8FA3F532A89C506901F7F6625683BEA280FFB8E3B90E29A837E94",
          "PreviousTxnLgrSeq": 9036179,
          "Sequence": 23,
          "index": "819EBB8946A3FF55FBFFE32F3AD429F866B5E5AADC253796E3E068E51D22F569"
        },
        "ledger_current_index": 9036069,
        "validated": false
      }
    }
    );
};

module.exports.requestSubmitReponse = function(request) {
  return JSON.stringify(
    {
      "id": request.id,
      "status": "success",
      "type": "response",
      "result": {
        "engine_result": "tesSUCCESS",
        "engine_result_code": 0,
        "engine_result_message": "The transaction was applied.",
        "tx_blob": "12000022000000002400000017201B0089E19461400000000000006468400000000000000C7321029A98439AF7459E256D64635598E8B21047807E6B5E6BEE3A3CCF35DEAD2C2C55744630440220688EDB9DC23AEB60A46DDFCC496B4EFCFB1D2432DC9636E2B88F8462FAAE3C4D022005A8EEC4A60AA34B778089EE7BA4622A3D2F18F9B8A05F9EE6709CB2C1FC89968114A69FF8D7778091B9F273549766DD6C063D984B5F83143DD06317D19C6110CAFF150AE528F58843BE2CA1",
        "tx_json": {
          "Account": fromAccount,
          "Amount": "100",
          "Destination": toAccount,
          "Fee": "12",
          "Flags": 0,
          "LastLedgerSequence": 9036180,
          "Sequence": 23,
          "SigningPubKey": "029A98439AF7459E256D64635598E8B21047807E6B5E6BEE3A3CCF35DEAD2C2C55",
          "TransactionType": "Payment",
          "TxnSignature": "30440220688EDB9DC23AEB60A46DDFCC496B4EFCFB1D2432DC9636E2B88F8462FAAE3C4D022005A8EEC4A60AA34B778089EE7BA4622A3D2F18F9B8A05F9EE6709CB2C1FC8996",
          "hash": "797A79F825CC5E5149D16D05960457A2E1C21484B41D8C80312601B39227ACE9"
        }
      }
    }
  );
}


module.exports.RESTPaymentWithMemoResponse = JSON.stringify(
  {
    "success":true,
    "client_resource_id":"1",
    "status_url":"http://127.0.0.1/v1/accounts/"+fromAccount+"/payments/1"
  }
);

module.exports.RESTResponseMissingMemoData = JSON.stringify(
  {
    "success":false,
    "error_type":"invalid_request",
    "error":"Missing parameter: MemoData",
    "message":"A Memo object needs a MemoData field"
  }
);

module.exports.RESTResponseMemoTypeInt = JSON.stringify(
  {
    "success":false,
    "error_type":"invalid_request",
    "error":"Invalid parameter: MemoType",
    "message":"MemoType must be a string"
  }
);

module.exports.RESTResponseMemoDataInt = JSON.stringify(
  {
    "success":false,
    "error_type":"invalid_request",
    "error":"Invalid parameter: MemoData",
    "message":"MemoData must be a string"
  }
);

module.exports.RESTResponseEmptyMemosArray = JSON.stringify(
  {
    "success":false,
    "error_type":"invalid_request",
    "error":"Invalid parameter: memos",
    "message":"Must contain at least one Memo object, otherwise omit the memos property"
  }
);

module.exports.RESTResponseNonArrayMemo = JSON.stringify(
  {
    "success":false,
    "error_type":"invalid_request",
    "error":"Invalid parameter: memos",
    "message":"Must be an array with memo objects"
  }
);