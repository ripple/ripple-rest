/*jshint expr: true*/

var expect = require('chai').expect,
  RippleInterface = require('../lib/rippleinterface');

describe('RippleInterface', function(){

  var rinterface = new RippleInterface([{host: 's_west.ripple.com', port: 443, secure: true}]);

  it('should have a connected ripple-lib Remote', function(){
    expect(rinterface).to.have.property(remote);
    expect(rinterface.remote._connected).to.be.true;
  });


  describe('.getRippleTx()', function(){
    
    it('should throw an error if no arguments are supplied', function(){
      expect(rinterface.getRippleTx()).to.throw(Error);
    });

    it('should respond with a transaction if given a valid hash', function(){
      expect(rinterface.getRippleTx('39E4563A175AA9A8071D2F15ACD337B1D39F272195E5E20532DB40A81EB9A5FF', function(err, res){
        if (err) {
          done(err);
        } else {
          done();
        }
      }));
    });

  });




  describe('.submitRippleTx()', function(){

  });

});