var _      = require('lodash');
var ripple = require('ripple-lib');
var expect = require('chai').expect;
var info   = require('../api/info');

function createInterface() {
  var server = new process.EventEmitter;

  server._connected = true;
  server._lastLedgerClose = Date.now() - 1;
  server._opts = { url: 'wss://example.com' };

  server.computeFee = function() {
    return '12';
  };

  var remote = new ripple.Remote({
    servers: [ ]
  });

  remote._servers.push(server);

  remote._getServer = function() {
    return server;
  };

  return { remote: remote }
};

describe('info', function() {
  var $;

  beforeEach(function() {
    $ = createInterface();
  });

  it('isConnected', function(done) {
    var req = { };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj).to.deep.equal({ success: true, connected: true });
        done();
      }
    };

    info.isConnected($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('serverStatus', function(done) {
    var serverInfo = {
      info: {
        build_version: '0.24.0-rc1',
        complete_ledgers: '32570-6595042',
        hostid: 'ARTS',
        last_close: { converge_time_s: 2.007, proposers: 4 },
        load_factor: 1,
        peers: 53,
        pubkey_node: 'n94wWvFUmaKGYrKUGgpv1DyYgDeXRGdACkNQaSe7zJiy5Znio7UC',
        server_state: 'full',
        validated_ledger: {
          age: 5,
          base_fee_xrp: 0.00001,
          hash: '4482DEE5362332F54A4036ED57EE1767C9F33CF7CE5A6670355C16CECE381D46',
          reserve_base_xrp: 20,
          reserve_inc_xrp: 5,
          seq: 6595042
        },
        validation_quorum: 3
      }
    };

    $.remote.request = function(request) {
      request.emit('success', serverInfo);
    };

    var req = { };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.rippled_server_status).to.be.an('object');
        expect(obj.rippled_server_status).to.deep.equal(serverInfo.info);
        expect(obj.rippled_server_url).to.equal('wss://example.com');
        expect(obj.api_documentation_url).to.equal('https://github.com/ripple/ripple-rest');
        done();
      }
    };

    info.serverStatus($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });
});
