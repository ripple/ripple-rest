var RL = require('ripple-lib')
var accounts = {}
var state = {};
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
accounts.carol = {
    address : "r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ",
    secret : "ssW6HG7i5Qzz3ienBDwujEW8fzSDq"
}
accounts.dan = {
    address : "rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V",
    secret : "snByi24KpxSZKE3ECm3NiGxfPuTgf"
}

exports.accounts = accounts
var submit = function(data,ws) {
    var so = new RL.SerializedObject(data.tx_blob).to_json();
    console.log("submit request deserialized",so)
    switch (so.Account) {
        case accounts.genesis.address :
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
        } else if (so.Destination == accounts.carol.address) {
            ws.send(JSON.stringify({"id":data.id,"result":{"engine_result":"tesSUCCESS","engine_result_code":0,"engine_result_message":"The transaction was applied.","tx_blob":"12000022000000002400000001201B0000000A614000000017D7840068400000000000000C73210330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD02074473045022100C227AB82343CEF295895196EC338F82737CDFFC74850F7104F8D4AD05275F0B402207D506E4A3268A53E18E0FD8D9621475C2167BFF07A85DBC383617759206957C78114B5F762798A53D543A014CAF8B297CFF8F2F937E8831452B3CFB038A0B6AA332C370EEA8D8251693B338F","tx_json":{"Account":"rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh","Amount":"400000000","Destination":"r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ","Fee":"12","Flags":0,"LastLedgerSequence":10,"Sequence":1,"SigningPubKey":"0330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD020","TransactionType":"Payment","TxnSignature":"3045022100C227AB82343CEF295895196EC338F82737CDFFC74850F7104F8D4AD05275F0B402207D506E4A3268A53E18E0FD8D9621475C2167BFF07A85DBC383617759206957C7","hash":"B5E010D3C54349C80F18F5CA6CF8088B928886193ADFF6A22E3319FCB1803728"}},"status":"success","type":"response"}))
        } else if (so.Destination == accounts.dan.address) {
            if (so.Amount == '600000000') {
                ws.send(JSON.stringify( {"id":data.id,"result":{"engine_result":"tesSUCCESS","engine_result_code":0,"engine_result_message":"The transaction was applied.","tx_blob":"12000022000000002400000002201B0000000A614000000023C3460068400000000000000C73210330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD02074473045022100FF281B1848764810356368094C697D202E8F3AAB91AF161D8826ECB9D18D279B02204CBBA1D3C4E3BC546643E87DCF122CA2A1B68BFA0176A9A8D0FA8578CBB0C09B8114B5F762798A53D543A014CAF8B297CFF8F2F937E8831418B7EE40D089C5BE012671282295F879804A9AB6","tx_json":{"Account":"rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh","Amount":"600000000","Destination":"rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V","Fee":"12","Flags":0,"LastLedgerSequence":10,"Sequence":2,"SigningPubKey":"0330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD020","TransactionType":"Payment","TxnSignature":"3045022100FF281B1848764810356368094C697D202E8F3AAB91AF161D8826ECB9D18D279B02204CBBA1D3C4E3BC546643E87DCF122CA2A1B68BFA0176A9A8D0FA8578CBB0C09B","hash":"D1CCC940E1DC1E32B4DEDCE5C693C13C70F31BC72463EEA9712A32C277A92E22"}},"status":"success","type":"response"}))
            } else if (so.Amount.currency == 'USD') {
                ws.send(JSON.stringify({"id":data.id,"result":{"engine_result":"tecPATH_DRY","engine_result_code":128,"engine_result_message":"Path could not send partial amount.","tx_blob":"12000022000000002400000003201B0000000A61D51550F7DCA70000000000000000000000000000555344000000000018B7EE40D089C5BE012671282295F879804A9AB668400000000000000C73210330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD02074473045022100F3FF238E0EE7060753A9ABBD38FA44F76BEBC8EE9EB73B06A08D0CDFB0DFC68F022030E10959CE5922092493B1D4A66A9445B3FB9A591768976BFF99A55E90A478268114B5F762798A53D543A014CAF8B297CFF8F2F937E8831418B7EE40D089C5BE012671282295F879804A9AB6","tx_json":{"Account":"rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh","Amount":{"currency":"USD","issuer":"rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V","value":"600"},"Destination":"rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V","Fee":"12","Flags":0,"LastLedgerSequence":10,"Sequence":3,"SigningPubKey":"0330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD020","TransactionType":"Payment","TxnSignature":"3045022100F3FF238E0EE7060753A9ABBD38FA44F76BEBC8EE9EB73B06A08D0CDFB0DFC68F022030E10959CE5922092493B1D4A66A9445B3FB9A591768976BFF99A55E90A47826","hash":"68FFEDCE1A2DFC4D338CA74EE0C0E039CD241C7CC65A88509AD152FFE860EF79"}},"status":"success","type":"response"}))
            }
        }
        case accounts.alice.address :
        if (so.Destination == accounts.bob.address) {
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
        break;
        case accounts.bob.address: 
            if (so.TransactionType == 'TrustSet') {
                ws.send(JSON.stringify({"id":data.id,"result":{"engine_result":"tesSUCCESS","engine_result_code":0,"engine_result_message":"The transaction was applied.","tx_blob":"12001422800000002400000001201B0000000C63D4C38D7EA4C680000000000000000000000000005553440000000000BF14A5EF6814B074833FDDBA3B2235812EF55ABF68400000000000000C732103BC02F6C0F2C50EF5DB02C2C17062B7449B34FBD669A75362E41348C9FAE3DDE17446304402203622FB32D81BCA193EC797115349B8AEDEF70ADDA73E7C70C0EF61657DD3C0FB0220065A75C89BCE67138D3100C2EC814EAA96A09F3589B074DB7B618D77DE09839881146B3515E84CB5F28032F968FCBD58B694B33E1C69","tx_json":{"Account":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","Fee":"12","Flags":2147483648,"LastLedgerSequence":12,"LimitAmount":{"currency":"USD","issuer":"rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U","value":"10"},"Sequence":1,"SigningPubKey":"03BC02F6C0F2C50EF5DB02C2C17062B7449B34FBD669A75362E41348C9FAE3DDE1","TransactionType":"TrustSet","TxnSignature":"304402203622FB32D81BCA193EC797115349B8AEDEF70ADDA73E7C70C0EF61657DD3C0FB0220065A75C89BCE67138D3100C2EC814EAA96A09F3589B074DB7B618D77DE098398","hash":"6D734CEE0B1B2FA27E8446ACC31F6BF09DC7946C4F93619AC878F18D612AA4E2"}},"status":"success","type":"response"}))
            }
        break;
        case accounts.carol.address:
            if (so.Destination == accounts.dan.address) {
                ws.send(JSON.stringify( {"id":data.id,"result":{"engine_result":"tesSUCCESS","engine_result_code":0,"engine_result_message":"The transaction was applied.","tx_blob":"12000022000000002400000001201B0000000A61D4C38D7EA4C68000000000000000000000000000555344000000000052B3CFB038A0B6AA332C370EEA8D8251693B338F68400000000000000C7321034C421636E875492233E02FE281785988065E0E1A45E5EAFBBCE67DC92B17EC51744730450221008297F96D782519C59CD0D63AD44AA59C5C6B26851E204982AB5BA349F8F1BDE202206231BA78E7D3B3FEF122158BC1B4730D52CE1628E25B7F6CEFE4A873C281CCFA811452B3CFB038A0B6AA332C370EEA8D8251693B338F831418B7EE40D089C5BE012671282295F879804A9AB6","tx_json":{"Account":"r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ","Amount":{"currency":"USD","issuer":"r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ","value":"10"},"Destination":"rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V","Fee":"12","Flags":0,"LastLedgerSequence":10,"Sequence":1,"SigningPubKey":"034C421636E875492233E02FE281785988065E0E1A45E5EAFBBCE67DC92B17EC51","TransactionType":"Payment","TxnSignature":"30450221008297F96D782519C59CD0D63AD44AA59C5C6B26851E204982AB5BA349F8F1BDE202206231BA78E7D3B3FEF122158BC1B4730D52CE1628E25B7F6CEFE4A873C281CCFA","hash":"BB5A6A8F8AF5E13BDA911E53ACF9620B7DCE08C01CA0969FD80D5CAFE4486AAB"}},"status":"success","type":"response"}))
            }
        break;        
        case accounts.dan.address:
            if (so.TransactionType == 'TrustSet') {
                if (state.dantrust == undefined) {
                    state.dantrust = 0;
                }
                state.dantrust++
                if (state.dantrust == 1) {
                    ws.send(JSON.stringify({"id":data.id,"result":{"engine_result":"tesSUCCESS","engine_result_code":0,"engine_result_message":"The transaction was applied.","tx_blob":"12001422800000002400000001201B0000000C63D4C38D7EA4C68000000000000000000000000000555344000000000052B3CFB038A0B6AA332C370EEA8D8251693B338F68400000000000000C7321020E575151BC03EEEB5E6BA258CBD88F37DADAC0BF123267810A140036BA831FB07446304402200C605854C9453B26CDC8D04748033AF125AD843ED61ABE140CDF4CE3C7C9DC1E02205ADE214480EA1C836E7531921D51694CCBD7A62037C7E89415494BCDF8BCE0C6811418B7EE40D089C5BE012671282295F879804A9AB6","tx_json":{"Account":"rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V","Fee":"12","Flags":2147483648,"LastLedgerSequence":12,"LimitAmount":{"currency":"USD","issuer":"r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ","value":"10"},"Sequence":1,"SigningPubKey":"020E575151BC03EEEB5E6BA258CBD88F37DADAC0BF123267810A140036BA831FB0","TransactionType":"TrustSet","TxnSignature":"304402200C605854C9453B26CDC8D04748033AF125AD843ED61ABE140CDF4CE3C7C9DC1E02205ADE214480EA1C836E7531921D51694CCBD7A62037C7E89415494BCDF8BCE0C6","hash":"E5BD2DCA496B5AB0AE57BC797E735ED718F7192604C1E6634C2D6581673759A0"}},"status":"success","type":"response"}))
                } else if (state.dantrust == 2) {
                    ws.send(JSON.stringify({"id":data.id,"result":{"engine_result":"tesSUCCESS","engine_result_code":0,"engine_result_message":"The transaction was applied.","tx_blob":"12001422800000002400000002201B0000000C63D4C38D7EA4C68000000000000000000000000000555344000000000052B3CFB038A0B6AA332C370EEA8D8251693B338F68400000000000000C7321020E575151BC03EEEB5E6BA258CBD88F37DADAC0BF123267810A140036BA831FB07446304402200E326C46A86CC775E7D3E460264B68684DC29CCE6D1976B7D2B2C95DC0B5B71D0220590E20A77962A7F79ECA46E35D8C2F10AAC4A3811D8A78813C8F42A13CD24678811418B7EE40D089C5BE012671282295F879804A9AB6","tx_json":{"Account":"rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V","Fee":"12","Flags":2147483648,"LastLedgerSequence":12,"LimitAmount":{"currency":"USD","issuer":"r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ","value":"10"},"Sequence":2,"SigningPubKey":"020E575151BC03EEEB5E6BA258CBD88F37DADAC0BF123267810A140036BA831FB0","TransactionType":"TrustSet","TxnSignature":"304402200E326C46A86CC775E7D3E460264B68684DC29CCE6D1976B7D2B2C95DC0B5B71D0220590E20A77962A7F79ECA46E35D8C2F10AAC4A3811D8A78813C8F42A13CD24678","hash":"693E267667048FE33B6A119312B3E668911D29870727F6F0C5B790D194C1FAB0"}},"status":"success","type":"response"}))
                }
            }
        break;
        default:
        break;
    }
};
exports.submit = submit;

var ping = function(data,ws) {
    ws.send(JSON.stringify({"id": data.id,"status": "success","type": "response","result": {}}))
}
exports.ping = ping;
var subscribe = function(data,ws) {
    console.log("Sending out subscribe response")
    if (state.subscribecount == undefined)
        state.subscribecount = 0;
    state.subscribecount++
    if (state.subscribecount == 1) {
        ws.send(JSON.stringify({ fee_base: 10,
          fee_ref: 10,
          ledger_hash: '7D6B65656ED1AE27950444CFC42C773B7C53E1727E8DEE949C49241360B8B797',
          ledger_index: 2,
          ledger_time: 465038520,
          load_base: 256,
          load_factor: 256,
          random: 'E100A572751193D5D6B60ADACC7E98B16BBD25C77EF0E5FC33A1A4ECCF757A9D',
          reserve_base: 200000000,
          reserve_inc: 50000000,
          server_status: 'full',
          stand_alone: true,
          validated_ledgers: '1-2' }))
    } else if (state.subscribecount == 2) {
        ws.send(JSON.stringify( { fee_base: 10,
          fee_ref: 10,
          ledger_hash: 'EA022EE4D60E47B0618795C22D415FDFBF226809C69A8533DC2C43F06E523149',
          ledger_index: 3,
          ledger_time: 465038550,
          load_base: 256,
          load_factor: 256,
          random: '382887E145885174D033A23338333493DAE6705F96CDBAD3C8863CC06CA23069',
          reserve_base: 200000000,
          reserve_inc: 50000000,
          server_status: 'full',
          stand_alone: true,
          validated_ledgers: '1-3' }))
    } else if (state.subscribecount >= 3) {
        ws.send(JSON.stringify({ fee_base: 10,
          fee_ref: 10,
          ledger_hash: '3EC937C2C747C4590DC04399E9A854FB72753FA8E219AC3599A365FFD0312785',
          ledger_index: 4,
          ledger_time: 465038550,
          load_base: 256,
          load_factor: 256,
          random: '6BF246AE436C0DB16EBFE277FC5B3A12D6E989C8FFDD9547E1617CA268251BA3',
          reserve_base: 200000000,
          reserve_inc: 50000000,
          server_status: 'full',
          stand_alone: true,
          validated_ledgers: '1-4' }))
    }
    if (data.accounts) {
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
    switch (data.source_account) {
        case accounts.alice.address :
            if (data.destination_account == accounts.bob.address) {
                if (data.destination_amount == '1') {
                    ws.send(JSON.stringify({
                        "id":data.id,"result":{"alternatives":[],"destination_account":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","destination_currencies":["XRP"],"ledger_current_index":3,"validated":false},"status":"success","type":"response"
                    }));
                } else if (data.destination_amount == '20000000') {
                    ws.send(JSON.stringify({
                        "id":data.id,"result":{"alternatives":[],"destination_account":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","destination_currencies":["XRP"],"ledger_current_index":3,"validated":false},"status":"success","type":"response"
                    }));
                } else if (typeof data.destination_amount == 'object') {
                    if (data.destination_amount.currency == 'USD') {
                        if (state.usd === undefined) {
                            // first time, return no path
                            state.usd = 1;
                            ws.send(JSON.stringify({"id":data.id,"result":{"alternatives":[],"destination_account":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","destination_currencies":["XRP"],"ledger_current_index":4,"validated":false},"status":"success","type":"response"}))
                        } else {
                            // second time, return path
                            state.usd++;
                            ws.send(JSON.stringify({"id":data.id,"result":{"alternatives":[{"paths_canonical":[],"paths_computed":[],"source_amount":{"currency":"USD","issuer":"rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U","value":"10"}}],"destination_account":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","destination_currencies":["USD","XRP"],"ledger_current_index":4,"validated":false},"status":"success","type":"response"}))
                        }
                    }
                }
            }
        break;
        case accounts.genesis.address : 
            switch (data.destination_account) {
                case accounts.alice.address :
                ws.send(JSON.stringify(
                    { id: 2,
                    result: 
                    { alternatives: [],
                    destination_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
                    destination_currencies: [ 'XRP' ] },
                    status: 'success',
                    type: 'response' }
                ))
                break;
                case accounts.carol.address: 
                ws.send(JSON.stringify({"id":data.id,"result":{"alternatives":[],"destination_account":"r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ","destination_currencies":["XRP"],"ledger_current_index":4,"validated":false},"status":"success","type":"response"}))
                break;
                case accounts.dan.address:
                ws.send(JSON.stringify({"id":data.id,"result":{"alternatives":[],"destination_account":"rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V","destination_currencies":["XRP"],"ledger_current_index":4,"validated":false},"status":"success","type":"response"}))
                break;
                default:
                break;
            }
        break;
        case accounts.bob.address :
            if (data.destination_account == accounts.alice.address) {
                ws.send(JSON.stringify({"id":data.id,"result":{"alternatives":[],"destination_account":"rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U","destination_currencies":["XRP"],"ledger_current_index":4,"validated":false},"status":"success","type":"response"}               
                ))
            }
        break;
        case accounts.carol.address :
            if (data.destination_account == accounts.dan.address) {
                ws.send(JSON.stringify({"id":data.id,"result":{"alternatives":[{"paths_canonical":[],"paths_computed":[],"source_amount":{"currency":"USD","issuer":"r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ","value":"10"}}],"destination_account":"rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V","destination_currencies":["USD","XRP"],"ledger_current_index":4,"validated":false},"status":"success","type":"response"}))
            }
        default:
        break;    
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
        case accounts.bob.address :
            ws.send(JSON.stringify({"id":data.id,
            "result":{"account_data":{"Account":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","Balance":"200000000","Flags":0,"LedgerEntryType":"AccountRoot","OwnerCount":0,"PreviousTxnID":"E05706F92475436BEA5570743331E2D62DBCECA2B9FA6F7FED39C8A85490EF68","PreviousTxnLgrSeq":4,"Sequence":1,"index":"F44A494EEF93D6AD5D257D7A23A075FF29FF142B0FC8DE68DA43F0F176D47A6E"},"ledger_current_index":4,"validated":false},"status":"success","type":"response"
            }))
        break;
        case accounts.carol.address:
            if (state.carolaccountinfo == undefined)
                state.carolaccountinfo = 0;
            state.carolaccountinfo++;
            if (state.carolaccountinfo == 1) {
                ws.send(JSON.stringify({"id":data.id,"result":{"account_data":{"Account":"r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ","Balance":"400000000","Flags":0,"LedgerEntryType":"AccountRoot","OwnerCount":0,"PreviousTxnID":"BA11014094AB9563200249DB5CF3E506F6A4A07EFBC75FDD5C31CDE26C6F4B7E","PreviousTxnLgrSeq":4,"Sequence":1,"index":"F0F3E450A8E548CBC9A6F1E05D4B2CCBFE0F945D46B813C5E59DCB0414EE09A5"},"ledger_current_index":4,"validated":false},"status":"success","type":"response"}))
            } 
        break;
        case accounts.dan.address :
            ws.send(JSON.stringify({"id":data.id,"result":{"account_data":{"Account":"rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V","Balance":"600000000","Flags":0,"LedgerEntryType":"AccountRoot","OwnerCount":0,"PreviousTxnID":"6EF920AE9D528C8D72C5BAFCE527561FADEFB5241BF80266E14F39EB3D34E24C","PreviousTxnLgrSeq":4,"Sequence":1,"index":"34FF1FC6B0F1A856A4417DDA0CC13683BB2AF87B3BCA5CE2F10828E972029140"},"ledger_current_index":4,"validated":false},"status":"success","type":"response"}))
        break;
        default :
        break;
    }
};
exports.account_info = account_info
var account_lines = function(data,ws) {
    switch (data.account) {
        case accounts.alice.address :
            ws.send(JSON.stringify({
                "id":data.id,
                "result":{
                "account":"rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U","lines":[]
                },
                "status":"success",
                "type":"response"
            }))
        break;
        case accounts.bob.address :
            ws.send(JSON.stringify({"id":data.id,
            "result":{"account":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","lines":[]},"status":"success","type":"response"
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

var timerid;
var connection = function(ws) {
    timerid = setInterval(function() {
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
exports.clearInterval = function() {
    clearInterval(timerid)
}

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
    ws.send(JSON.stringify(
    {"id":data.id,"result":{"Account":"rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U","Amount":"200000000","Destination":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","Fee":"12","Flags":0,"LastLedgerSequence":10,"Sequence":2,"SigningPubKey":"022E3308DCB75B17BEF734CE342AC40FF7FDF55E3FEA3593EE8301A70C532BB5BB","TransactionType":"Payment","TxnSignature":"3044022030A2F33C088F07CC86A87B8E82EFC95E1CE1D525A16EF2DC059485EB54D946BB022009482C8F4F14BC4E2E7FF188C95DB47EA84533BF9E1114C28E7997B1B439C46A","hash":"8EA3CF4D854669007058EB45E9860611CC24FEB655895E418A5C8BC5EA901D01"},"status":"success","type":"response"}
    ))
}
exports.tx = tx;
