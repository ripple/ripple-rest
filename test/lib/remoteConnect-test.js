/*jshint expr: true*/
var expect = require('chai').expect,
  sinon = require('sinon'),
  remoteConnectLib = require('../../lib/remoteConnect'),
  ripple = require('ripple-lib');

describe('lib/remoteConnect', function(){

  describe('.ensureConnected()', function(){

    it('should respond with an error if it is given no remote', function(done){

      remoteConnectLib.ensureConnected(function(err, res){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: remote. This function needs a ripple-lib Remote');
        expect(res).not.to.exist;
        done();
      });

    });

    it('should respond with an error if it is given something other than a remote', function(done){

      remoteConnectLib.ensureConnected({}, function(err, res){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: remote. This function needs a ripple-lib Remote');
        expect(res).not.to.exist;
        done();
      });

    });

    it('should respond with an error if it cannot connect to the network within 10 seconds', function(done){

      var clock = sinon.useFakeTimers(0, "setTimeout");

      var remote = new ripple.Remote({
      });

      remote.connect = function(){
        clock.tick(10000);
      };

      remoteConnectLib.ensureConnected(remote, function(err, res){
        expect(err).to.exist;
        expect(err.message).to.equal('Cannot connect to the Ripple network. Please check your internet connection and server settings and try again.');
        expect(res).not.to.exist;
        done();
      });

      clock.restore();

    });

    it('should respond with the value true if the remote is connected', function(done){

      var remote = {
        constructor: {
          name: 'Remote'
        },
        _getServer: function(){
          return {
            _lastLedgerClose: Date.now()
          };
        }
      };

      remoteConnectLib.ensureConnected(remote, function(err, res){
        expect(err).not.to.exist;
        expect(res).to.be.true;
        done();
      });

    });

  });

});