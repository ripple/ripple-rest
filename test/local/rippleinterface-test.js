/*jshint expr: true*/

var expect = require('chai').expect,
  RippleInterface = require('../../lib/rippleinterface');


describe('RippleInterface', function(){

  // TODO replace hard-coded options with given config file

  var rinterface = new RippleInterface({servers: [{host: 's_west.ripple.com', port: 443, secure: true}]});

  it('should have a ripple-lib Remote', function(){
    expect(rinterface).to.have.property('remote');
  });

  it('and the remote should be connected', function(done){
    
    this.timeout(10000);

    rinterface.remote.request_server_info(function(err, res){
      expect(err).to.be.null;
      expect(['syncing', 'full']).to.contain(res.info.server_state);

      done();
    });
  });



  describe('.getRippleTx()', function(){
    
    it('should throw an error if given no arguments', function(){
      expect(rinterface.getRippleTx).to.throw(Error);
    });

    it('should throw an error if given an invalid account', function(){
      expect(function(){
        rinterface.getRippleTx('', '', function(err, res){});
      }).to.throw(Error);
    });

    it('should return an error if given an invalid hash', function(done){
      rinterface.getRippleTx('rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r', '00000012345', function(err, res){
        expect(err).to.exist;
        expect(res).to.not.exist;

        done();
      });
    });

    it('should respond with a transaction if given a valid hash', function(done){
      rinterface.getRippleTx('rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r', '39E4563A175AA9A8071D2F15ACD337B1D39F272195E5E20532DB40A81EB9A5FF', function(err, res){
        expect(err).to.be.not.ok;
        expect(res.hash).to.equal('39E4563A175AA9A8071D2F15ACD337B1D39F272195E5E20532DB40A81EB9A5FF');

        done();
      });
    });
  });



  describe('.submitRippleTx() [use \'grunt realmoneytest\' to test this function fully]', function(){

    it('should throw an error if given improper arguments', function(){
      expect(rinterface.submitRippleTx).to.throw(Error);
    });

    it('should respond with an error if given an invalid transaction type', function(){
      try {
        rinterface.submitRippleTx({type: 'blah'}, '', function(){});
      } catch (e) {
        expect(e).to.be.ok;
      }
    });

    it('should respond with an error if given an invalid transaction', function(){
      try {
        rinterface.submitRippleTx({type: 'Payment'}, '', function(){});
      } catch (e) {
        expect(e).to.be.ok;
      }
    });
  });


});

