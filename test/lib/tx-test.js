/*jshint expr: true*/
var expect = require('chai').expect,
  txLib = require('../../lib/tx');

describe('lib/tx', function(){

  describe('.getTx()', function(){

    var remote = {
        constructor: {
          name: 'Remote'
        },
        _getServer: function(){
          return {
            _lastLedgerClose: Date.now()
          };
        },
        requestAccountTx: function(opts, callback){

          console.log('requestAccountTx: ', opts);

          if (opts.account === 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r') {

            if (opts.limit === 20 && opts.offset === 0) {
              var account_tx_0 = require('./examples/account_tx_rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r_0-20.json');
              callback(null, account_tx_0);
            } else if (opts.limit === 20 && opts.offset === 20) {
              var account_tx_20 = require('./examples/account_tx_rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r_20-40.json');
              callback(null, account_tx_20);
            } else {
              callback(new Error('Options not supported'));
            }

          } else {
            callback(new Error('Address not implemented'));
          }
        },
        requestLedger: function(ledger_index, callback) {
          if (ledger_index === 4716041) {
            var ledger = require('./examples/ledger_4716041.json');
            callback(null, ledger);
          }
        },
        requestTransactionEntry: function(tx_hash, ledger_index, callback) {
          if (tx_hash === '8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B' && ledger_index === 4716041) {
            var tx = require('./examples/transaction_entry_8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B_4716041.json');
            callback(null, tx);
          }
        }
      };


    it('should respond with an error if given no hash', function(done){
      txLib.getTx({}, function(err, tx){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: tx_hash. Must provide a transaction hash to look for');
        expect(tx).not.to.exist;
        done();
      });
    });

    it('should respond with an error if given an invalid hash', function(done){
      txLib.getTx({
        remote: remote,
        hash: 'badhash',
        account: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r'
      }, function(err, tx){
        expect(err).to.exist;
        expect(err.message).to.equal('No transaction found. This means that either the rippled\'s transaction history is incomplete or the transaction does not exist');
        expect(tx).not.to.exist;
        done();
      });
    });

    it('should respond with an error if not given either an address or ledger index', function(done){
      txLib.getTx({
        remote: remote,
        hash: '8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B'
      }, function(err, tx){
        expect(err).to.exist;
        expect(err.message).to.equal('Must provide either an address or a ledger_index, as well as the tx_hash, to look up a transaction');
        expect(tx).not.to.exist;
        done();
      });
    });

    it('should get a full ripple tx if given a hash and an address', function(done){

      console.log('getting test');
      txLib.getTx({
        remote: remote, 
        hash: '8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B',
        address: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r'
      }, function(err, res){
        expect(err).not.to.exist;
        expect(res).to.deep.equal(require('./examples/tx_(first)_rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r.json'));
        done();
      });
    });

    it('should get a full ripple tx if given a hash and a ledger_index', function(done){
      txLib.getTx({
        remote: remote, 
        hash: '8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B',
        ledger_index: '4716041'
      }, function(err, res){
        expect(err).not.to.exist;
        expect(res).to.deep.equal(require('./examples/tx_(first)_rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r.json'));
        done();
      });
    });

  });


  describe('.submitTx()', function(){

    // it('should accept transactions in JSON format', function(){
    //   txLib.submitTx({

    //   }, function(err, res){

    //   });
    // });

    // it('should accept transactions in ripple-lib Transaction object format', function(){

    // });

    // it('should respond with an error if given an invalid secret', function(){

    // });

    // it('should respond with an error if given an invalid transaction', function(){

    // });

  });

});

