var ripple = require('ripple-lib'),
  bignum = require('bignumber.js');

module.exports.isRippleAddress = isRippleAddress;

module.exports.dropsToXrp = dropsToXrp;

module.exports.xrpToDrops = xrpToDrops;


module.exports.parseBalanceChanges = function(tx, address) {

  var addressBalanceChanges = [];

  tx.meta.AffectedNodes.forEach(function(affNode){

    var node = affNode.CreatedNode || affNode.ModifiedNode || affNode.DeletedNode;

    // Look for XRP balance change in AccountRoot node
    if (node.LedgerEntryType === 'AccountRoot') {

      if (node.NewFields) {

        if (node.NewFields.Account === address) {
          addressBalanceChanges.push({
            value: dropsToXrp(node.NewFields.Balance),
            currency: 'XRP',
            issuer: ''
          });
        }

      }

      if (node.FinalFields) {

        if (node.FinalFields.Account === address) {
          var finalBal = dropsToXrp(node.FinalFields.Balance),
            prevBal = dropsToXrp(node.PreviousFields.Balance),
            balChange = bignum(finalBal).minus(prevBal).toString();
          
          addressBalanceChanges.push({
            value: balChange,
            currency: 'XRP',
            issuer: ''
          });
        }

      }

    }

    // Look for trustline balance change in RippleState node
    if (node.LedgerEntryType === 'RippleState') {

      if (node.NewFields) {

        var high = node.NewFields.HighLimit,
          low = node.NewFields.LowLimit, 
          bal = node.NewFields.Balance,
          newBal = {
            value: '',
            currency: '',
            issuer: ''
          };

        // Set Currency
        newBal.currency = bal.currency;

        // Set Value
        if (high.issuer === address) {
          newBal.value = bignum(0).minus(node.NewFields.Balance.value).toString();
        } else if (low.issuer === address) {
          newBal.value = bignum(node.NewFields.Balance.value).toString();
        } else {
          return;
        }

        // Set issuer
        var highTrust = parseFloat(high.value),
          lowTrust = parseFloat(low.value),
          balVal = parseFloat(bal.value);

        if ((highTrust === 0 && highTrust === 0) || (highTrust > 0 && lowTrust > 0)) {
          if (balVal > 0) {
            newBal.issuer = high.issuer;
          } else if (balVal < 0) {
            newBal.issuer = low.issuer;
          } else if (balVal === 0) {
            return;
          }
        } else if (highTrust > 0) {
          newBal.issuer = low.issuer;
        } else if (lowTrust > 0) {
          newBal.issuer = high.issuer;
        }

        addressBalanceChanges.push(newBal);

      }

      if (node.FinalFields && node.PreviousFields && node.PreviousFields.Balance) {

        var high = node.FinalFields.HighLimit,
          low = node.FinalFields.LowLimit, 
          changeBal = {
            value: '',
            currency: '',
            issuer: ''
          };

        // Set Currency
        changeBal.currency = node.FinalFields.Balance.currency;

        // Set Value
        if (high.issuer === address) {
          changeBal.value = bignum(0).minus(bignum(node.FinalFields.Balance.value).minus(node.PreviousFields.Balance.value).toString());
        } else if (low.issuer === address) {
          changeBal.value = bignum(node.FinalFields.Balance.value).minus(node.PreviousFields.Balance.value).toString();
        } else {
          return;
        }

        // Set Issuer
        var highTrust = parseFloat(high.value),
          lowTrust = parseFloat(low.value),
          balVal = parseFloat(node.FinalFields.Balance.value);

        if ((highTrust === 0 && highTrust === 0) || (highTrust > 0 && lowTrust > 0)) {
          if (balVal > 0) {
            changeBal.issuer = high.issuer;
          } else if (balVal < 0) {
            changeBal.issuer = low.issuer;
          } else if (balVal === 0) {
            return;
          }
        } else if (highTrust > 0) {
          changeBal.issuer = low.issuer;
        } else if (lowTrust > 0) {
          changeBal.issuer = high.issuer;
        }

        addressBalanceChanges.push(changeBal);
      }

    }

  });

  return addressBalanceChanges;

}

function isRippleAddress(address) {
  return ripple.UInt160.is_valid(address);
}

function dropsToXrp(drops) {
  return bignum(drops).dividedBy(1000000.0).toString();
}

function xrpToDrops(xrp) {
  return bignum(xrp).times(1000000.0).toString();
}

