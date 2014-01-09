/*jshint expr: true*/

var expect = require('chai').expect,
  RippleInterface = require('../../lib/rippleinterface'),
  fs = require('fs'),
  accounts;


describe('This testing suite will use 2 real Ripple accounts to test transaction submission and confirmation', function(){

  it('there should be an accounts.json file with 2 real Ripple accounts located in the root directory to run', function(){

    expect(fs.existsSync(__dirname + '/../../accounts.json')).to.be.true;

    try {
      var accountsText = fs.readFileSync(__dirname + '/../../accounts.json', {encoding: 'utf8'});
      accounts = JSON.parse(accountsText);
      expect(accounts).to.have.property('length');
      expect(accounts.length).to.be.at.least(2);
    } catch (e) {
      expect(e).not.to.exist;
    }

  });

  it('each account entry should have an "address" and a "secret" field', function(){

    expect(accounts[0]).to.have.property('address');
    expect(accounts[1]).to.have.property('address');

    expect(accounts[0]).to.have.property('secret');
    expect(accounts[1]).to.have.property('secret');


  });


  // TODO replace hard-coded options with given config file

  var rinterface = new RippleInterface({servers: [{host: 's_west.ripple.com', port: 443, secure: true}]});

  describe('RippleInterface', function(){


    describe('.submitRippleTx', function(){

      // TODO add other transaction type tests

      it('should complete a simple XRP payment', function(){

        rinterface.submitRippleTx({
          TransactionType: 'Payment',
          Account: accounts[0].address,
          Destination: accounts[1].address,
          Amount: '100', // XRP Drops
        }, accounts[0].secret, function(res){

          expect(res).to.be.ok;
          expect(res).to.have.property('result');
          expect(res.result).to.equal('tesSUCCESS');

        });
      });

    });

  });

});