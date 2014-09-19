/**
 * Against a given ledger state, write against rippled
 * write requests and copy responses for rippled simulation
 */
var WebSocket = require('ws');
var ee = require('events').EventEmitter;
var router = new ee;
var url = 'ws://127.0.0.1:5006';
var ws = new WebSocket(url);

var util = require('util');
var inspect = function(item) {
    console.log(util.inspect(item, { showHidden: true, depth: null }))
}

ws.on('open', function() {
    ws.send(JSON.stringify(
{"command":"ripple_path_find","id":9,"source_account":"rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U","destination_account":"rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5","destination_amount":"1"}

    ))
});

ws.on('message', function(data, flags) {
    console.log(data)
    var data = JSON.parse(data);
    console.log(data.type)
    if (data.type) 
        router.emit(data.type,data)
});

router.on('response',function(data) {
    console.log("\n** response **\n")
    inspect(data)
});

router.on('serverStatus', function(data) {
    console.log("\n** serverStatus **\n")
    console.log(data);
});

router.on('ledgerClosed',function(data) {
    console.log("\n** ledgerClosed **\n")
    ws.send(JSON.stringify({
        "command": "ledger",
        "ledger_hash": data.ledger_hash
    }))
});
