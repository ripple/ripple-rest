// /*jshint expr: true*/

// var expect = require('chai').expect;
// var payment = require('../../lib/simplepayment');

// describe('SimplePayment', function(){

//   describe('.isValid()', function(){

//     it('should return true for full, valid options', function(){

//       expect(payment({
//         srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
//         dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',

//         srcValue: '3',
//         srcCurrency: 'USD',
//         srcIssuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
//         srcSlippage: '0.50',
//         srcTxID: '115',
//         srcTag: '2409238',

//         dstValue: '100',
//         dstCurrency: 'XRP',
//         dstIssuer: '',
//         dstSlippage: '0',
//         dstTxID: '238',
//         dstTag: '120923965'
//       }).isValid()).to.be.true;

//     });

//     it('should return true for minimal valid options', function(){

//       expect(payment({
//         srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
//         dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',

//         dstValue: '100',
//         dstCurrency: 'XRP'
//       }).isValid()).to.be.true;

//     });

//     it('should return false if srcAddress or dstAddress is not specified', function(){

//       expect(payment({
//         dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',

//         dstValue: '100',
//         dstCurrency: 'XRP'
//       }).isValid()).to.be.false;

//       expect(payment({
//         srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',

//         dstValue: '100',
//         dstCurrency: 'XRP'
//       }).isValid()).to.throw(Error);

//     });

//     it('should return false if neither source nor destination amount is specified', function(){

//       expect(payment({
//         srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
//         dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi'
//       }).isValid()).to.be.false;

//     });



//   });

//   describe('.fromRippleTx()', function(){

//   });

//   describe('.toRippleTx()', function(){

//   });

// });