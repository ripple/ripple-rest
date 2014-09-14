var assert = require('assert');
var async = require('async');
var supertest = require('supertest');
var WSS = require('ws').Server;
var ripple = require('ripple-lib');
var fixtures = require('./fixtures').startup;
var app = require('../lib/express_app');
var dbinterface = require('../lib/db-interface');

module.exports.setup = setup;

function setup(done) {
  var self = this;

  self.app = supertest(app);

  self.wss = new WSS({ port: 5995 });

  self.wss.once('connection', function(conn) {
    conn.on('message', function(message) {
      //console.log('<<', message);
      message = JSON.parse(message);
      self.wss.emit('request_' + message.command, message, conn);
    });
  });

  self.wss.once('request_subscribe', function(message, conn) {
    assert.strictEqual(message.command, 'subscribe');
    assert.deepEqual(message.streams, [ 'ledger', 'server' ]);
    conn.send(fixtures.subscribeResponse(message));
  });

  app.get('remote').once('connect', function() {
    app.get('remote').getServer().once('ledger_closed', function() {
      dbinterface.db.sync().complete(done);
    });
    app.get('remote').getServer().emit('message', fixtures.ledgerClose());
  });

  //app.get('remote').trace = true;
  app.get('remote')._servers = [ ];
  app.get('remote').addServer('ws://localhost:5995');
  app.get('remote').connect();
};

module.exports.teardown = teardown;

function teardown(done) {
  var self = this;

  app.get('remote').once('disconnect', function() {
    self.wss.close();
    setImmediate(done);
  });

  app.get('remote').disconnect();
};

module.exports.checkHeaders = checkHeaders;

function checkHeaders(res) {
  assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8');
  assert.strictEqual(res.headers['access-control-allow-origin'], '*');
  assert.strictEqual(res.headers['access-control-allow-headers'], 'X-Requested-With, Content-Type');
};
