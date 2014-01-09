/*jshint expr: true*/

var expect = require('chai').expect,
  RippleInterface = require('../../lib/rippleinterface');


describe('RippleInterface', function(){

  // TODO replace hard-coded options with given config file

  var rinterface = new RippleInterface({servers: [{host: 's_west.ripple.com', port: 443, secure: true}]});

  it('should have a connected ripple-lib Remote', function(){
    expect(rinterface).to.have.property('remote');
    rinterface.remote.request_server_info(function(err, res){
      expect(err).to.be.null;
      expect(res).to.have.property('status');
      expect(res.status).to.equal('success');
    });
  });



  describe('.getRippleTx()', function(){
    
    it('should throw an error if given no arguments', function(){
      expect(rinterface.getRippleTx).to.throw(Error);
    });

    it('should respond with an error if given an invalid hash', function(){
      rinterface.getRippleTx('00000012345', function(err, res){
        expect(err).to.be.not.null;
        expect(res).to.be.null;
      });
    });

    it('should respond with a transaction if given a valid hash', function(){
      rinterface.getRippleTx('39E4563A175AA9A8071D2F15ACD337B1D39F272195E5E20532DB40A81EB9A5FF', function(err, res){
        expect(err).to.be.null;
        expect(res).to.be.ok;
        expect(res).to.have.property('ledger_hash');
        expect(res.ledger_hash).to.equal('39E4563A175AA9A8071D2F15ACD337B1D39F272195E5E20532DB40A81EB9A5FF');
      });
    });
  });



  describe('.submitRippleTx()', function(){

    it('should throw an error if given improper arguments', function(){
      expect(rinterface.submitRippleTx).to.throw(Error);
    });

    it('should respond with an error if given an invalid transaction type', function(){
      rinterface.submitRippleTx({TransactionType: 'blah'}, '', function(err, res){
        expect(err).to.be.not.null;
        expect(res).to.be.not.ok;
      });
    });

    it('should respond with an error if given an invalid transaction', function(){
      rinterface.submitRippleTx({TransactionType: 'Payment'}, '', function(err, res){
        expect(err).to.be.not.null;
        expect(res).to.be.not.ok;
      });
    });
  });


});

