/*jshint expr: true*/
var expect = require('chai').expect,
  ripple = require('ripple-lib'),
  testConfig = require('../testConfig'),
  txLib = require('../../lib/tx');

describe('lib/tx.js', function(){

  var connectedRemote;
  before(function(done){
    // testConfig.remoteOptions.trace = true;
    connectedRemote = new ripple.Remote(testConfig.remoteOptions);
    connectedRemote.connect();
    connectedRemote.once('connect', function(){
      done();
    });
  });

  describe('.getTx()', function(){

    // TODO check for errors if remote is invalid or null

    it('should respond with an error if given an invalid hash', function(done){
      txLib.getTx(connectedRemote, 
        'B5554A9E5A6DBBA02F4', 
        function(err, res){
          expect(err).to.be.ok;
          expect(res).not.to.be.ok;
          done();
        });
    });

    it('should respond with a tx if given a valid hash', function(done){
      txLib.getTx(connectedRemote, 
        'CFB414D4BEA0F9B69B9203F5BE15A68E2ECAFCB63FD562646FF7C750A6A6DEBF', 
        function(err, res){
          expect(err).not.to.be.ok;
          expect(res.hash).to.equal('CFB414D4BEA0F9B69B9203F5BE15A68E2ECAFCB63FD562646FF7C750A6A6DEBF');
          done();
        });
    });
  
  });


  describe('.getNextNotification()', function(){

    it('should respond with an error if the prev_tx_hash is invalid', function(done){
      txLib.getNextNotification(connectedRemote,{
        address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        prev_tx_hash: 'blah'
      }, function(err, res){
        expect(err).to.be.ok;
        expect(res).not.to.be.ok;
        done();
      });
    });

    it('should respond with an error if the address is invalid', function(done){
      txLib.getNextNotification(connectedRemote,{
        address: 'blah',
        prev_tx_hash: 'CFB414D4BEA0F9B69B9203F5BE15A68E2ECAFCB63FD562646FF7C750A6A6DEBF'
      }, function(err, res){
        expect(err).to.be.ok;
        expect(res).not.to.be.ok;
        done();
      });
    });

    it('should respond with the next notification if it is given a valid prev_tx_hash and address', function(done){
      txLib.getNextNotification(connectedRemote, {
        address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        prev_tx_hash: 'CFB414D4BEA0F9B69B9203F5BE15A68E2ECAFCB63FD562646FF7C750A6A6DEBF'
      }, function(err, res){
        expect(err).not.to.be.ok;
        expect(res).to.have.keys([
          'address', 
          'submissionToken', 
          'type', 
          'direction', 
          'state', 
          'rippledResult', 
          'inLedger', 
          'txHash'
          ]);
        done();
      });
    });

  });


  describe('.submitTx()', function(){

    it('should respond with an error if given an invalid src_address', function(){
      txLib.submitTx(connectedRemote, {
        src_address: '',
        secret: '',
        tx_json: {
          type: 'payment',
          from: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          to: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          amount: '1XRP'
        }
      }, function(err, res){
        expect(err).to.be.ok;
        expect(res).not.to.be.ok;
      });
    });

    it('should respond with an error if given an invalid secret', function(){
      txLib.submitTx(connectedRemote, {
        src_address: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
        secret: '',
        tx_json: {
          type: 'payment',
          from: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          to: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          amount: '1XRP'
        }
      }, function(err, res){
        expect(err).to.be.ok;
        expect(res).not.to.be.ok;
      });
    });

    // it('should respond with an error if given an invalid transaction', function(){

    // });

    // TODO add more tests

  });


});

