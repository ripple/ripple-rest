/*jshint expr: true*/
var expect = require('chai').expect,
  clone = require('clone'),
  pathfindLib = require('../../lib/pathfind');

describe('lib/pathfind', function(){

  describe('.pathsetToPayments()', function(){

    it('should convert a ripple path set to an array of payment objects', function(){

      var pathset = {
        'alternatives': [{
            'paths_computed': [
                [{
                    'currency': 'BTC',
                    'issuer': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                    'type': 48,
                    'type_hex': '0000000000000030'
                }, {
                    'account': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                    'type': 1,
                    'type_hex': '0000000000000001'
                }]
            ],
            'source_amount': '40101'
        }, {
            'paths_computed': [
                [{
                    'account': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                    'type': 1,
                    'type_hex': '0000000000000001'
                }]
            ],
            'source_amount': {
                'currency': 'BTC',
                'issuer': 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
                'value': '0.000001002'
            }
        }],
        'destination_account': 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        'destination_amount': {
            'currency': 'BTC',
            'issuer': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            'value': '0.000001'
        },
        'id': 1,
        'source_account': 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM'
      };

      expect(pathfindLib.pathsetToPayments(pathset)).to.deep.equal([{
        src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        src_tag: '',
        src_amount: {
          value: '0.040101',
          currency: 'XRP',
          issuer: ''
        },
        src_slippage: '0',
        dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_tag: '',
        dst_amount: {
          value: '0.000001',
          currency: 'BTC',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        },
        dst_slippage: '0',
        invoice_id: '',
        paths: "[[{\"currency\":\"BTC\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        flag_partial_payment: false,
        flag_no_direct_ripple: false
      }, {
        src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        src_tag: '',
        src_amount: {
          value: '0.000001002',
          currency: 'BTC',
          issuer: ''
        },
        src_slippage: '0',
        dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_tag: '',
        dst_amount: {
          value: '0.000001',
          currency: 'BTC',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        },
        dst_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        flag_partial_payment: false,
        flag_no_direct_ripple: false
      }]);

    });

    it('should convert a path set with dst_amount in XRP to an array of payments', function(){

      var pathset = {
        "alternatives": [{
            "paths_computed": [
                [{
                    "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                    "type": 1,
                    "type_hex": "0000000000000001"
                }, {
                    "currency": "XRP",
                    "type": 16,
                    "type_hex": "0000000000000010"
                }]
            ],
            "source_amount": {
                "currency": "BTC",
                "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                "value": "0.000000002485770142298577"
            }
        }, {
            "paths_computed": [
                [{
                    "account": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
                    "type": 1,
                    "type_hex": "0000000000000001"
                }, {
                    "currency": "XRP",
                    "type": 16,
                    "type_hex": "0000000000000010"
                }]
            ],
            "source_amount": {
                "currency": "CNY",
                "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                "value": "0.00001215"
            }
        }, {
            "paths_computed": [
                [{
                    "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                    "type": 1,
                    "type_hex": "0000000000000001"
                }, {
                    "currency": "XRP",
                    "type": 16,
                    "type_hex": "0000000000000010"
                }]
            ],
            "source_amount": {
                "currency": "EUR",
                "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                "value": "0.000001603183968160318"
            }
        }, {
            "paths_computed": [
                [{
                    "account": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                    "type": 1,
                    "type_hex": "0000000000000001"
                }, {
                    "currency": "XRP",
                    "type": 16,
                    "type_hex": "0000000000000010"
                }]
            ],
            "source_amount": {
                "currency": "USD",
                "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                "value": "0.000002049979500204998"
            }
        }],
        "destination_account": "rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB",
        "destination_amount": "100",
        "id": 1,
        "source_account": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM"
      };

      expect(pathfindLib.pathsetToPayments(pathset)).to.deep.equal([{
        src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        src_tag: '',
        src_amount: {
          value: '0.000000002485770142298577',
          currency: 'BTC',
          issuer: ''
        },
        src_slippage: '0',
        dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_tag: '',
        dst_amount: {
          value: '0.0001',
          currency: 'XRP',
          issuer: ''
        },
        dst_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"}]]",
        flag_partial_payment: false,
        flag_no_direct_ripple: false
      }, {
        src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        src_tag: '',
        src_amount: {
          value: '0.00001215',
          currency: 'CNY',
          issuer: ''
        },
        src_slippage: '0',
        dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_tag: '',
        dst_amount: {
          value: '0.0001',
          currency: 'XRP',
          issuer: ''
        },
        dst_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"}]]",
        flag_partial_payment: false,
        flag_no_direct_ripple: false
      }, {
        src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        src_tag: '',
        src_amount: {
          value: '0.000001603183968160318',
          currency: 'EUR',
          issuer: ''
        },
        src_slippage: '0',
        dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_tag: '',
        dst_amount: {
          value: '0.0001',
          currency: 'XRP',
          issuer: ''
        },
        dst_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"}]]",
        flag_partial_payment: false,
        flag_no_direct_ripple: false
      }, {
        src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        src_tag: '',
        src_amount: {
          value: '0.000002049979500204998',
          currency: 'USD',
          issuer: ''
        },
        src_slippage: '0',
        dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_tag: '',
        dst_amount: {
          value: '0.0001',
          currency: 'XRP',
          issuer: ''
        },
        dst_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"}]]",
        flag_partial_payment: false,
        flag_no_direct_ripple: false
      }]);
    });

    it('should properly handle when the destination_amount.issuer is the destination_account', function(){

      var pathset = {
        "alternatives": [{
            "paths_computed": [
                [{
                    "currency": "USD",
                    "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                    "type": 48,
                    "type_hex": "0000000000000030"
                }, {
                    "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                    "type": 1,
                    "type_hex": "0000000000000001"
                }]
            ],
            "source_amount": "52"
        }, {
            "paths_computed": [
                [{
                    "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                    "type": 1,
                    "type_hex": "0000000000000001"
                }, {
                    "currency": "USD",
                    "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                    "type": 48,
                    "type_hex": "0000000000000030"
                }, {
                    "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                    "type": 1,
                    "type_hex": "0000000000000001"
                }]
            ],
            "source_amount": {
                "currency": "BTC",
                "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                "value": "0.000000001287184615384615"
            }
        }, {
            "paths_computed": [
                [{
                    "account": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
                    "type": 1,
                    "type_hex": "0000000000000001"
                }, {
                    "currency": "USD",
                    "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                    "type": 48,
                    "type_hex": "0000000000000030"
                }, {
                    "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                    "type": 1,
                    "type_hex": "0000000000000001"
                }]
            ],
            "source_amount": {
                "currency": "CNY",
                "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                "value": "0.00000625248"
            }
        }],
        "destination_account": "rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB",
        "destination_amount": {
            "currency": "USD",
            "issuer": "rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB",
            "value": "0.000001"
        },
        "id": 1,
        "source_account": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM"
      };

      expect(pathfindLib.pathsetToPayments(pathset)).to.deep.equal([{
        src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        src_tag: '',
        src_amount: {
          value: '0.000052',
          currency: 'XRP',
          issuer: ''
        },
        src_slippage: '0',
        dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_tag: '',
        dst_amount: {
          value: '0.000001',
          currency: 'USD',
          issuer: ''
        },
        dst_slippage: '0',
        invoice_id: '',
        paths: "[[{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        flag_partial_payment: false,
        flag_no_direct_ripple: false
      }, {
        src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        src_tag: '',
        src_amount: {
          value: '0.000000001287184615384615',
          currency: 'BTC',
          issuer: ''
        },
        src_slippage: '0',
        dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_tag: '',
        dst_amount: {
          value: '0.000001',
          currency: 'USD',
          issuer: ''
        },
        dst_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        flag_partial_payment: false,
        flag_no_direct_ripple: false
      }, {
        src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        src_tag: '',
        src_amount: {
          value: '0.00000625248',
          currency: 'CNY',
          issuer: ''
        },
        src_slippage: '0',
        dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_tag: '',
        dst_amount: {
          value: '0.000001',
          currency: 'USD',
          issuer: ''
        },
        dst_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        flag_partial_payment: false,
        flag_no_direct_ripple: false
      }]);

    });


    it('should convert an empty path set to an empty array', function(){

      var pathset = {
        "alternatives": [],
        "destination_account": "rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB",
        "destination_amount": {
            "currency": "BTC",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "value": "1"
        },
        "id": 1,
        "source_account": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM"
      };

      expect(pathfindLib.pathsetToPayments(pathset)).to.deep.equal([]);

    });

  });


  describe('.validateParams()', function(){

    var validParams = {
      src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
      dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
      dst_amount: {
        value: '1',
        currency: 'USD',
        issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
      }
    };

    it('should throw an error if src_address is invalid', function(){

      expect(function(){
        var params = clone(validParams);
        delete params.src_address;
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: src_address. Must be a valid Ripple address');

      expect(function(){
        var params = clone(validParams);
        params.src_address = '';
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: src_address. Must be a valid Ripple address');

      expect(function(){
        var params = clone(validParams);
        params.src_address = 'abc';
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: src_address. Must be a valid Ripple address');

      expect(function(){
        var params = clone(validParams);
        params.src_address = '%%%';
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: src_address. Must be a valid Ripple address');

    });

    it('should throw an error if dst_address is invalid', function(){

      expect(function(){
        var params = clone(validParams);
        delete params.dst_address;
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: dst_address. Must be a valid Ripple address');

      expect(function(){
        var params = clone(validParams);
        params.dst_address = '';
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: dst_address. Must be a valid Ripple address');

      expect(function(){
        var params = clone(validParams);
        params.dst_address = 'abc';
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: dst_address. Must be a valid Ripple address');

      expect(function(){
        var params = clone(validParams);
        params.dst_address = '%%%';
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: dst_address. Must be a valid Ripple address');

    });

    it('should throw an error if dst_amount is invalid', function(){

      expect(function(){
        var params = clone(validParams);
        delete params.dst_amount;
        console.log(params, pathfindLib.validateParams(params));
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');

      expect(function(){
        var params = clone(validParams);
        params.dst_amount = '';
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');

      expect(function(){
        var params = clone(validParams);
        params.dst_amount = '1/USD';
        return pathfindLib.validateParams(params);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');

    });

    
    it('should return true if given valid parameters', function(){

      expect((function(){
        return pathfindLib.validateParams(validParams);
      })()).to.be.true;

    });    

  });

  describe('.parseParams()', function(){

    it('should correctly parse normal params', function(){

      expect((function(){
        return pathfindLib.parseParams({
          src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
          dst_amount: {
            value: '1',
            currency: 'USD',
            issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
          }
        });
      })()).to.deep.equal({
        src_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        dst_account: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_amount: {
            value: '1',
            currency: 'USD',
            issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
          }
      });

    });

    it('should correctly parse params where the dst_amount issuer is left blank', function(){

      expect((function(){
        return pathfindLib.parseParams({
          src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
          dst_amount: {
            value: '1',
            currency: 'USD',
            issuer: ''
          }
        });
      })()).to.deep.equal({
        src_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        dst_account: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_amount: {
            value: '1',
            currency: 'USD',
            issuer: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB'
          }
      });

    });

    it('should correctly parse params where the dst_amount is in XRP', function(){

      expect((function(){
        return pathfindLib.parseParams({
          src_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          dst_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
          dst_amount: {
            value: '1',
            currency: 'XRP',
            issuer: ''
          }
        });
      })()).to.deep.equal({
        src_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        dst_account: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        dst_amount: '1000000'
      });

    });

  });


});