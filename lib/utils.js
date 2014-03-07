var bignum = require('bignumber.js');

function dropsToXrp(drops) {
  return bignum(drops).dividedBy(1000000.0).toString();
}

function xrpToDrops(xrp) {
  return bignum(xrp).times(1000000.0).floor().toString();
}

function parseBalanceChanges (tx, address) {

  if (typeof tx !== 'object') {
    throw(new Error('Invalid parameter: tx. Must be a Ripple transaction object'));
  }

  if (typeof address !== 'string') {
    throw(new Error('Invalid parameter: address. Must supply a Ripple address to parse balance changes for'));
  }

  var addressBalanceChanges = [];

  tx.meta.AffectedNodes.forEach(function(affNode){

    var node = affNode.CreatedNode || affNode.ModifiedNode || affNode.DeletedNode;

    // Look for XRP balance change in AccountRoot node
    if (node.LedgerEntryType === 'AccountRoot') {

      var xrpBalChange = parseAccountRootBalanceChange(node, address);
      if (xrpBalChange) {
        addressBalanceChanges.push(xrpBalChange);
      }

    }

    // Look for trustline balance change in RippleState node
    if (node.LedgerEntryType === 'RippleState') {

      var currBalChange = parseTrustlineBalanceChange(node, address);
      if (currBalChange) {
        addressBalanceChanges.push(currBalChange);
      }

    }

  });

  return addressBalanceChanges;

}

function parseAccountRootBalanceChange (node, address) {

  if (node.NewFields) {

    if (node.NewFields.Account === address) {
      return {
        value: dropsToXrp(node.NewFields.Balance),
        currency: 'XRP',
        issuer: ''
      };
    }

  } else if (node.FinalFields) {

    if (node.FinalFields.Account === address) {

      var finalBal = dropsToXrp(node.FinalFields.Balance),
        prevBal = dropsToXrp(node.PreviousFields.Balance),
        balChange = bignum(finalBal).minus(prevBal).toString();
      
      return {
        value: balChange,
        currency: 'XRP',
        issuer: ''
      };
    }
  }

  return null;
}

function parseTrustlineBalanceChange (node, address) {

  var balChange = {
      value: '',
      currency: '',
      issuer: ''
    }, 
    trustHigh,
    trustLow,
    trustBalFinal,
    trustBalPrev;

  if (node.NewFields) {
    trustHigh = node.NewFields.HighLimit;
    trustLow = node.NewFields.LowLimit;
    trustBalFinal = node.NewFields.Balance;
  } else {
    trustHigh = node.FinalFields.HighLimit;
    trustLow = node.FinalFields.LowLimit;
    trustBalFinal = node.FinalFields.Balance; 
  }

  if (node.PreviousFields && node.PreviousFields.Balance) {
    trustBalPrev = node.PreviousFields.Balance;
  } else {
    trustBalPrev = {value: '0'};
  }

  // Set value
  if (trustLow.issuer === address) {
    balChange.value = bignum(trustBalFinal.value).minus(trustBalPrev.value).toString();
  } else if (trustHigh.issuer === address) {
    balChange.value = bignum(0).minus(bignum(trustBalFinal.value).minus(trustBalPrev.value)).toString();
  } else {
    return null;
  }

  // Set currency
  balChange.currency = trustBalFinal.currency;

  // Set issuer
  if ((bignum(trustHigh.value).equals(0) && bignum(trustLow.value).equals(0)) ||
    (bignum(trustHigh.value).greaterThan(0) && bignum(trustLow.value).greaterThan(0))) {

    if (bignum(trustBalFinal.value).greaterThan(0) || bignum(trustBalPrev.value).greaterThan(0)) {
      balChange.issuer = trustLow.issuer;
    } else {
      balChange.issuer = trustHigh.issuer;
    }

  } else if (bignum(trustHigh.value).greaterThan(0)) {
    balChange.issuer = trustLow.issuer;
  } else if (bignum(trustLow.value).greaterThan(0)) {
    balChange.issuer = trustHigh.issuer;
  }

  return balChange;

}

module.exports.dropsToXrp = dropsToXrp;
module.exports.xrpToDrops = xrpToDrops;
module.exports.parseBalanceChanges = parseBalanceChanges;

