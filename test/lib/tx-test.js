/*jshint expr: true*/
var expect    = require('chai').expect;
var clone     = require('clone');
var validator = require('validator');
var equal     = require('deep-equal');
var txLib     = require('../../lib/tx');

describe('lib/tx', function(){

  describe('.getTx()', function(){

    var tx = require('./examples/8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B.json');
    var remote = {
        constructor: {
          name: 'Remote'
        },
        _getServer: function(){
          return {
            _lastLedgerClose: Date.now()
          };
        },
        requestTx: function(hash, callback) {
          if (hash === '8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B') {
            callback(null, tx);
          } else {
            callback(new Error('ripple-lib error'));
          }
        }
      };

    it('should respond with an error if given no hash', function(done){
      txLib.getTx({}, function(err, res){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: hash. Must provide a transaction hash to look for');
        expect(res).not.to.exist;
        done();
      });
    });

    it('should respond with an error if given an invalid hash', function(done){
      txLib.getTx({
        remote: remote,
        hash: 'badhash'
      }, function(err, res){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: hash. Must provide a transaction hash to look for');
        expect(res).not.to.exist;
        done();
      });
    });

    it('should respond with an error if it cannot locate a transaction for a given hash', function(done){
      txLib.getTx({
        remote: remote,
        hash: '00001A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B'
      }, function(err, res){
        expect(err).to.exist;
        expect(err.message).to.equal('Cannot locate transaction. This may be the result of an incomplete rippled historical database or that transaction may not exist. Error: ripple-lib error');
        expect(res).not.to.exist;
        done();
      });
    });

    it('should get a full ripple tx if given a valid hash', function(done){

      txLib.getTx({
        remote: remote, 
        hash: '8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B'
      }, function(err, res){
        expect(err).not.to.exist;
        expect(res).to.deep.equal(tx);
        done();
      });
    });

  });


});

