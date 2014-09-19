var RL = require('ripple-lib')
var accounts = {}
accounts.genesis = {
    address:  'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    secret: 'snoPBrXtMeMyMHUVTgbuqAfg1SUTb'
}
accounts.alice = {
    address : 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
    secret : 'shtfQyMwYqppw6A3hcyhzwLxYaqgE'
}
accounts.bob = {
    address : "rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5",
    secret : "sh1TryzqJSfEyvKke6jtzhfcjbTDj"
}
exports.accounts = accounts
var submit = function(data,ws) {
    console.log("submit request:", data)
    var so = new RL.SerializedObject(data.tx_blob).to_json();
    console.log("submit request deserialized",so)
    if (so.Account == accounts.genesis.address) {
        if (so.Destination == accounts.alice.address) {
            ws.send(JSON.stringify({ id: data.id,
              result: 
               { engine_result: 'tesSUCCESS',
                 engine_result_code: 0,
                 engine_result_message: 'The transaction was applied.',
                 tx_blob: '12000022000000002400000001201B0086590E61400000001992054068400000000000000C73210330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD0207446304402206A14028E66CD2D55D32DF83D3CD507D4ED16818BF88238FA578E54F0CE731B8302202E77B1E3F9856E1B0DB7BD43DA9DD8D4FDCB144C48025D6C0B1BE40C5CB81E3C8114B5F762798A53D543A014CAF8B297CFF8F2F937E88314BF14A5EF6814B074833FDDBA3B2235812EF55ABF',
                 tx_json: 
                  { Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
                    Amount: '429000000',
                    Destination: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
                    Fee: '12',
                    Flags: 0,
                    LastLedgerSequence: 8804622,
                    Sequence: 1,
                    SigningPubKey: '0330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD020',
                    TransactionType: 'Payment',
                    TxnSignature: '304402206A14028E66CD2D55D32DF83D3CD507D4ED16818BF88238FA578E54F0CE731B8302202E77B1E3F9856E1B0DB7BD43DA9DD8D4FDCB144C48025D6C0B1BE40C5CB81E3C',
                    hash: 'AA067B86C98192D21A8B52235AD4DB7DFB0951E29189ABCF59FF124E649694F5' } },
              status: 'success',
              type: 'response' }
            ))
        }
    } else if (so.Account == accounts.alice.address) {
        if (so.Destination == accounts.bob.address) {
            console.log("From Alice to Bob")
            if (so.Amount == '1') {
                ws.send(JSON.stringify({"id":data.id,
                "result":{"engine_result":"tecNO_DST_INSUF_XRP","engine_result_code":125,"engine_result_message":"Destination does not exist. Too little XRP sent to create it.","tx_blob":"12000022000000002400000001201B0000000A61400000000000000168400000000000000C7321022E3308DCB75B17BEF734CE342AC40FF7FDF55E3FEA3593EE8301A70C532BB5BB7446304402206DC3B71D92905AD48CB360D749A59B21C40C61ACD8588CF6265F04FDB97A318202206AE57409DA90B873DA430B78F023BD8F610365823C1C71E344FDC931F44D00AE8114BF14A5EF6814B074833FDDBA3B2235812EF55ABF83146B3515E84CB5F28032F968FCBD58B694B33E1C69","tx_json":{"Account":"rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U","Amount":"1","Destination":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","Fee":"12","Flags":0,"LastLedgerSequence":10,"Sequence":1,"SigningPubKey":"022E3308DCB75B17BEF734CE342AC40FF7FDF55E3FEA3593EE8301A70C532BB5BB","TransactionType":"Payment","TxnSignature":"304402206DC3B71D92905AD48CB360D749A59B21C40C61ACD8588CF6265F04FDB97A318202206AE57409DA90B873DA430B78F023BD8F610365823C1C71E344FDC931F44D00AE","hash":"2F56D7997CF9BC90005EFA5A4DE83384DDAD9146644D26FBBCBC2D6C9FC212F9"}},"status":"success","type":"response"
                }))
            } else if ((so.Amount == '20000000') ||  (so.Amount == '200000000')) {
                // this is the server_info's minimum drop XRP reserve  to create an account
                // which is 10x higher in standalone than in regular
                ws.send(JSON.stringify({"id":data.id,"result":{"engine_result":"tesSUCCESS","engine_result_code":0,"engine_result_message":"The transaction was applied.","tx_blob":"12000022000000002400000002201B0000000A61400000000BEBC20068400000000000000C7321022E3308DCB75B17BEF734CE342AC40FF7FDF55E3FEA3593EE8301A70C532BB5BB74473045022100980B5BB4905990AB40724033611B28E1CAA111BC14E2B5301E306A913ADCB95C02201BCEA8C5BC6DF9A1262358F319BAC8184980A40263014FC4FBB80F6393DC4EFF8114BF14A5EF6814B074833FDDBA3B2235812EF55ABF83146B3515E84CB5F28032F968FCBD58B694B33E1C69","tx_json":{"Account":"rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U","Amount":"200000000","Destination":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","Fee":"12","Flags":0,"LastLedgerSequence":10,"Sequence":2,"SigningPubKey":"022E3308DCB75B17BEF734CE342AC40FF7FDF55E3FEA3593EE8301A70C532BB5BB","TransactionType":"Payment","TxnSignature":"3045022100980B5BB4905990AB40724033611B28E1CAA111BC14E2B5301E306A913ADCB95C02201BCEA8C5BC6DF9A1262358F319BAC8184980A40263014FC4FBB80F6393DC4EFF","hash":"F61422CBCBBEBD131DA92D8A78917BE082DB5874CCB7BA451995BBDC417A5011"}},"status":"success","type":"response"}
                ))
            }
        }
    }
};
exports.submit = submit;

var ping = function(data,ws) {
//    console.log("ping!")
    ws.send(JSON.stringify({"id": data.id,"status": "success","type": "response","result": {}}))
}
exports.ping = ping;
var subscribe = function(data,ws) {
    if (data.streams) {
        ws.send(JSON.stringify({
        "type": "ledgerClosed",
        "fee_base": 10,
        "fee_ref": 10,
        "ledger_hash": "5CE11F88A44F7DA9D2E092719CEC7920BCE6128428F4549B8F51299648A9511C",
        "ledger_index": 8804615,
        "ledger_time": 463710700,
        "reserve_base": 20000000,
        "reserve_inc": 5000000,
        "txn_count": 17,
        "validated_ledgers": "32570-8804615"}))
    } else if (data.accounts) {
        console.log("sending accounts success woohoo")
        ws.send(JSON.stringify({ 
        id: data.id, result: {}, status: 'success', type: 'response' 
        }))
    }
}
exports.subscribe = subscribe;
var server_info = function(data,ws) {
    console.log("Sending out server_info", data)
    ws.send(JSON.stringify({
    "id": data.id,
    "status": "success",
    "type": "response",
    "result": {
    "info": {
      "build_version": "0.26.3-rc2",
      "complete_ledgers": "32570-8803979",
      "hostid": "KEY",
      "io_latency_ms": 1,
      "last_close": {
        "converge_time_s": 2.01,
        "proposers": 0
      },
      "load_factor": 1,
      "peers": 48,
      "pubkey_node": "n9KdXJvZ9YjuDTRLRYuS6isVeKv7C2sehxCnCtg3G6HY2fuvVG2K",
      "server_state": "syncing",
      "validated_ledger": {
        "age": 6,
        "base_fee_xrp": 0.00001,
        "hash": "8AA5B0329BB5A67CD53A5A31700F40D9AA44423DC4ACD598EB3BCBC6D425565D",
        "reserve_base_xrp": 20,
        "reserve_inc_xrp": 5,
        "seq": 8803979
      },
      "validation_quorum": 3
    }}}));
}
exports.server_info = server_info;
var ripple_path_find = function(data,ws) {
    console.log("ripple_path_find request", data)
    if (data.source_account == accounts.alice.address) {
        if (data.destination_account == accounts.bob.address) {
            ws.send(JSON.stringify({
                "id":data.id,"result":{"alternatives":[],"destination_account":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","destination_currencies":["XRP"],"ledger_current_index":3,"validated":false},"status":"success","type":"response"
            }));
        }
    }
    if (data.source_account == accounts.genesis.address) {
        if (data.destination_account == accounts.alice.address) {
            ws.send(JSON.stringify(
                { id: 2,
                result: 
                { alternatives: [],
                destination_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
                destination_currencies: [ 'XRP' ] },
                status: 'success',
                type: 'response' }
            ))
        }
    }
};
exports.ripple_path_find = ripple_path_find

var account_info = function(data,ws) {
    switch (data.account) {
        case accounts.genesis.address :
            ws.send(JSON.stringify(
            { id: data.id,
              result: 
               { account_data: 
                  { Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
                    Balance: '100000000000000000',
                    Flags: 0,
                    LedgerEntryType: 'AccountRoot',
                    OwnerCount: 0,
                    PreviousTxnID: '0000000000000000000000000000000000000000000000000000000000000000',
                    PreviousTxnLgrSeq: 0,
                    Sequence: 1,
                    index: '2B6AC232AA4C4BE41BF49D2459FA4A0347E1B543A4C92FCEE0821C0201E2E9A8' },
                 ledger_current_index: 5,
                 validated: false },
              status: 'success',
              type: 'response' }
            ))
        break;
        case accounts.alice.address :
            ws.send(JSON.stringify({ 
                id: data.id,
                result: 
                { account_data: 
                { Account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
                Balance: '429000000',
                Flags: 0,
                LedgerEntryType: 'AccountRoot',
                OwnerCount: 0,
                PreviousTxnID: '253B0DB944E0B05549BA169846FB55AC0667612BBBDF2EDC8E3F5BC296B13C00',
                PreviousTxnLgrSeq: 4,
                Sequence: 1,
                index: '553724E23F51CF8A45D50F77C884D6BFF0E212094DF8B66D37CA697D03168536' },
                ledger_current_index: 4,
                validated: false },
                status: 'success',
                type: 'response' 
            }))
        break;     
        default :
        break;
    }
};
exports.account_info = account_info
var account_lines = function(data,ws) {
    console.log("account_lines",data)
    switch (data.account) {
        case accounts.alice.address :
            console.log("sending out account_lines for alice")
            ws.send(JSON.stringify({
                "id":data.id,
                "result":{
                "account":"rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U","lines":[]
                },
                "status":"success",
                "type":"response"
            }))
        break;
        default:
        break;
    }
};
exports.account_lines = account_lines;
var sample_ledger = JSON.stringify({
  "type": "ledgerClosed",
  "fee_base": 10,
  "fee_ref": 10,
  "ledger_hash": "5CE11F88A44F7DA9D2E092719CEC7920BCE6128428F4549B8F51299648A9511C",
  "ledger_index": 8804615,
  "ledger_time": 463710700,
  "reserve_base": 20000000,
  "reserve_inc": 5000000,
  "txn_count": 17,
  "validated_ledgers": "32570-8804615"
})
exports.sample_ledger = sample_ledger

var connection = function(ws) {
    console.log("connection")
    setInterval(function() {
        console.log("Sending sample ledger")
        ws.send(sample_ledger)
    }, 8000)
    // subscribe response
    ws.send(JSON.stringify({
      id: 0,
      status: 'success',
      type: 'response',
      result: {
        fee_base: 10,
        fee_ref: 10,
        ledger_hash: '1838539EE12463C36F2C53B079D807C697E3D93A1936B717E565A4A912E11776',
        ledger_index: 7053695,
        ledger_time: 455414390,
        load_base: 256,
        load_factor: 256,
        random: 'E56C9154D9BE94D49C581179356C2E084E16D18D74E8B09093F2D61207625E6A',
        reserve_base: 20000000,
        reserve_inc: 5000000,
        server_status: 'full',
        validated_ledgers: '32570-7053695'
      }
    }));
    var onmessage = function(message) {
        console.log('\n\n\nreceived: %s', message);
        var data = JSON.parse(message)
        if (data.command) {
            console.log("EMITTING ", data.command)
            this.route.emit(data.command, data,ws)
        }
    }
    ws.on('message', onmessage.bind(this));
}
exports.connection = connection;

var nominal_server_status_response = {
  "rippled_server_url": "wss://s_west.ripple.com:443",
  "rippled_server_status": {
    "info": {
      "build_version": "0.21.0-rc2",
      "complete_ledgers": "32570-4805506",
      "hostid": "BUSH",
      "last_close": {
        "converge_time_s": 2.011,
        "proposers": 5
      },
      "load_factor": 1,
      "peers": 51,
      "pubkey_node": "n9KNUUntNaDqvMVMKZLPHhGaWZDnx7soeUiHjeQE8ejR45DmHyfx",
      "server_state": "full",
      "validated_ledger": {
        "age": 2,
        "base_fee_xrp": 0.00001,
        "hash": "2B79CECB06A500A2FB92F4FB610D33A20CF8D7FB39F2C2C7C3A6BD0D75A1884A",
        "reserve_base_xrp": 20,
        "reserve_inc_xrp": 5,
        "seq": 4805506
      },
      "validation_quorum": 3
    }
  },
  "api_documentation_url": "https://github.com/ripple/ripple-rest"
};
exports.nominal_server_status_response = nominal_server_status_response

var nominal_server_state_response = {
  "success": true,
  "connected": true
}
exports.nominal_server_state_response = nominal_server_state_response

exports.nominal_server_status_response_disconnect = {
  "success": false,
  "error": "Cannot connect to rippled",
  "error_type": "connection"
}


exports.nominal_xrp_post_response = {
  "success": true,
  "client_resource_id": "f2f811b7-dc3b-4078-a2c2-e4ca9e453981",
  "status_url": ".../v1/accounts/r1.../payments/f2f811b7-dc3b-4078-a2c2-e4ca9e453981"
}

var tx = function(data,ws) {
    console.log("tx:",data)
    ws.send(JSON.stringify(
    {"id":data.id,"result":{"Account":"rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U","Amount":"200000000","Destination":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","Fee":"12","Flags":0,"LastLedgerSequence":10,"Sequence":2,"SigningPubKey":"022E3308DCB75B17BEF734CE342AC40FF7FDF55E3FEA3593EE8301A70C532BB5BB","TransactionType":"Payment","TxnSignature":"3044022030A2F33C088F07CC86A87B8E82EFC95E1CE1D525A16EF2DC059485EB54D946BB022009482C8F4F14BC4E2E7FF188C95DB47EA84533BF9E1114C28E7997B1B439C46A","hash":"8EA3CF4D854669007058EB45E9860611CC24FEB655895E418A5C8BC5EA901D01"},"status":"success","type":"response"}
    ))
}
exports.tx = tx;
