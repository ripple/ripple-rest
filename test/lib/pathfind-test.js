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
        source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        source_tag: '',
        source_transaction_id: '',
        source_amount: {
          value: '0.040101',
          currency: 'XRP',
          issuer: ''
        },
        source_slippage: '0',
        destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_tag: '',
        destination_amount: {
          value: '0.000001',
          currency: 'BTC',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        },
        destination_slippage: '0',
        invoice_id: '',
        paths: "[[{\"currency\":\"BTC\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        partial_payment: false,
        no_direct_ripple: false
      }, {
        source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        source_tag: '',
        source_transaction_id: '',
        source_amount: {
          value: '0.000001002',
          currency: 'BTC',
          issuer: ''
        },
        source_slippage: '0',
        destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_tag: '',
        destination_amount: {
          value: '0.000001',
          currency: 'BTC',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        },
        destination_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        partial_payment: false,
        no_direct_ripple: false
      }]);

    });

    it('should convert a path set with destination_amount in XRP to an array of payments', function(){

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
        source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        source_tag: '',
        source_transaction_id: '',
        source_amount: {
          value: '0.000000002485770142298577',
          currency: 'BTC',
          issuer: ''
        },
        source_slippage: '0',
        destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_tag: '',
        destination_amount: {
          value: '0.0001',
          currency: 'XRP',
          issuer: ''
        },
        destination_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"}]]",
        partial_payment: false,
        no_direct_ripple: false
      }, {
        source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        source_tag: '',
        source_transaction_id: '',
        source_amount: {
          value: '0.00001215',
          currency: 'CNY',
          issuer: ''
        },
        source_slippage: '0',
        destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_tag: '',
        destination_amount: {
          value: '0.0001',
          currency: 'XRP',
          issuer: ''
        },
        destination_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"}]]",
        partial_payment: false,
        no_direct_ripple: false
      }, {
        source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        source_tag: '',
        source_transaction_id: '',
        source_amount: {
          value: '0.000001603183968160318',
          currency: 'EUR',
          issuer: ''
        },
        source_slippage: '0',
        destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_tag: '',
        destination_amount: {
          value: '0.0001',
          currency: 'XRP',
          issuer: ''
        },
        destination_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"}]]",
        partial_payment: false,
        no_direct_ripple: false
      }, {
        source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        source_tag: '',
        source_transaction_id: '',
        source_amount: {
          value: '0.000002049979500204998',
          currency: 'USD',
          issuer: ''
        },
        source_slippage: '0',
        destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_tag: '',
        destination_amount: {
          value: '0.0001',
          currency: 'XRP',
          issuer: ''
        },
        destination_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"}]]",
        partial_payment: false,
        no_direct_ripple: false
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
        source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        source_tag: '',
        source_transaction_id: '',
        source_amount: {
          value: '0.000052',
          currency: 'XRP',
          issuer: ''
        },
        source_slippage: '0',
        destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_tag: '',
        destination_amount: {
          value: '0.000001',
          currency: 'USD',
          issuer: ''
        },
        destination_slippage: '0',
        invoice_id: '',
        paths: "[[{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        partial_payment: false,
        no_direct_ripple: false
      }, {
        source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        source_tag: '',
        source_transaction_id: '',
        source_amount: {
          value: '0.000000001287184615384615',
          currency: 'BTC',
          issuer: ''
        },
        source_slippage: '0',
        destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_tag: '',
        destination_amount: {
          value: '0.000001',
          currency: 'USD',
          issuer: ''
        },
        destination_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        partial_payment: false,
        no_direct_ripple: false
      }, {
        source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        source_tag: '',
        source_transaction_id: '',
        source_amount: {
          value: '0.00000625248',
          currency: 'CNY',
          issuer: ''
        },
        source_slippage: '0',
        destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_tag: '',
        destination_amount: {
          value: '0.000001',
          currency: 'USD',
          issuer: ''
        },
        destination_slippage: '0',
        invoice_id: '',
        paths: "[[{\"account\":\"rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        partial_payment: false,
        no_direct_ripple: false
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

  describe('.parseParams()', function(){

    var valid_params = {
      source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
      destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
      destination_amount: {
        value: '1',
        currency: 'USD',
        issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
      }
    };

    it('should respond with an error if source_address is invalid', function(){

      var params1 = clone(valid_params);
      delete params1.source_address;
      pathfindLib.parseParams(params1, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: source_address. Must be a valid Ripple address');
        expect(parsed_params).not.to.exist;
      });

      var params2 = clone(valid_params);
      params2.source_address = '';
      pathfindLib.parseParams(params2, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: source_address. Must be a valid Ripple address');
        expect(parsed_params).not.to.exist;
      });

      var params3 = clone(valid_params);
      params3.source_address = 'abc';
      pathfindLib.parseParams(params3, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: source_address. Must be a valid Ripple address');
        expect(parsed_params).not.to.exist;
      });

      var params4 = clone(valid_params);
      params4.source_address = '$&%#';
      pathfindLib.parseParams(params4, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: source_address. Must be a valid Ripple address');
        expect(parsed_params).not.to.exist;
      });
      
    });

    it('should respond with an error if destination_address is invalid', function(){

      var params1 = clone(valid_params);
      delete params1.destination_address;
      pathfindLib.parseParams(params1, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_address. Must be a valid Ripple address');
        expect(parsed_params).not.to.exist;
      });

      var params2 = clone(valid_params);
      params2.destination_address = '';
      pathfindLib.parseParams(params2, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_address. Must be a valid Ripple address');
        expect(parsed_params).not.to.exist;
      });

      var params3 = clone(valid_params);
      params3.destination_address = 'abc';
      pathfindLib.parseParams(params3, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_address. Must be a valid Ripple address');
        expect(parsed_params).not.to.exist;
      });

      var params4 = clone(valid_params);
      params4.destination_address = '$&%#';
      pathfindLib.parseParams(params4, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_address. Must be a valid Ripple address');
        expect(parsed_params).not.to.exist;
      });
      
    });

    it('should respond with an error if destination_amount is invalid', function(){

      var params1 = clone(valid_params);
      delete params1.destination_amount;
      pathfindLib.parseParams(params1, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
        expect(parsed_params).not.to.exist;
      });

      var params2 = clone(valid_params);
      params2.destination_amount = '';
      pathfindLib.parseParams(params2, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
        expect(parsed_params).not.to.exist;
      });

      var params3 = clone(valid_params);
      params3.destination_amount = '1/USD';
      pathfindLib.parseParams(params3, function(err, parsed_params){
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
        expect(parsed_params).not.to.exist;
      });

    });

    it('should correctly parse normal params', function(){

      pathfindLib.parseParams({
          source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
          destination_amount: {
            value: '1',
            currency: 'USD',
            issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
          }
        }, function(err, parsed_params) {
          expect(err).not.to.exist;
          expect(parsed_params).to.deep.equal({
        source_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        destination_account: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_amount: {
            value: '1',
            currency: 'USD',
            issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
          }
        });
      });
    });

    it('should correctly parse params where the destination_amount issuer is left blank', function(){

      pathfindLib.parseParams({
          source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
          destination_amount: {
            value: '1',
            currency: 'USD',
            issuer: ''
          }
        }, function(err, parsed_params){
          expect(err).not.to.exist;
          expect(parsed_params).to.deep.equal({
          source_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          destination_account: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
          destination_amount: {
            value: '1',
            currency: 'USD',
            issuer: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB'
          }
        });
      });
    });

    it('should correctly parse params where the destination_amount is in XRP', function(){

      pathfindLib.parseParams({
        source_address: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        destination_address: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
        destination_amount: {
          value: '1',
          currency: 'XRP',
          issuer: ''
        }
      }, function(err, parsed_params){
        expect(err).not.to.exist;
        expect(parsed_params).to.deep.equal({
          source_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          destination_account: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
          destination_amount: '1000000'
        });

      });

    });

  });

});