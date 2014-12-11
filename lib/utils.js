var bignum = require('bignumber.js');
var config = require('./config.js');
var pJson  = require('./../package.json');

module.exports = {
  dropsToXrp: dropsToXrp,
  xrpToDrops: xrpToDrops,
  parseBalanceChanges: parseBalanceChanges,
  getPackageVersion: getPackageVersion,
  getApiVersion: getApiVersion,
  getUrlBase: getUrlBase
};

function dropsToXrp(drops) {
  return bignum(drops).dividedBy(1000000.0).toString();
}

function xrpToDrops(xrp) {
  return bignum(xrp).times(1000000.0).floor().toString();
}

function parseBalanceChanges(tx, address) {
  var addressBalanceChanges = [ ];

  if (typeof tx !== 'object' || typeof address !== 'string') {
    return addressBalanceChanges;
  }

  if (!(tx.meta && tx.meta.AffectedNodes)) {
    return addressBalanceChanges;
  }

  tx.meta.AffectedNodes.forEach(function(affNode) {
    var node = affNode.CreatedNode || affNode.ModifiedNode || affNode.DeletedNode;
    var change;

    switch (node.LedgerEntryType) {
      case 'AccountRoot':
        // Look for XRP balance change in AccountRoot node
        change = parseAccountRootBalanceChange(node, address);
        break;
      case 'RippleState':
        // Look for trustline balance change in RippleState node
        change = parseTrustlineBalanceChange(node, address);
        break;
    }

    if (change) {
      addressBalanceChanges.push(change);
    }
  });

  return addressBalanceChanges;
};

function parseAccountRootBalanceChange(node, address) {
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
      var finalBal = dropsToXrp(node.FinalFields.Balance);
      var prevBal;
      var balChange;

      if (node.PreviousFields && (typeof node.PreviousFields.Balance === 'string')) {
        prevBal = dropsToXrp(node.PreviousFields.Balance);
      } else {
        prevBal = 0;
      }

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

function parseTrustlineBalanceChange(node, address) {
  var balChange = {
    value: '',
    currency: '',
    issuer: ''
  };

  var trustHigh;
  var trustLow;
  var trustBalFinal;
  var trustBalPrev;

  if (node.NewFields) {
    trustHigh     = node.NewFields.HighLimit;
    trustLow      = node.NewFields.LowLimit;
    trustBalFinal = node.NewFields.Balance;
  } else {
    trustHigh     = node.FinalFields.HighLimit;
    trustLow      = node.FinalFields.LowLimit;
    trustBalFinal = node.FinalFields.Balance;
  }

  if (node.PreviousFields && node.PreviousFields.Balance) {
    trustBalPrev = node.PreviousFields.Balance;
  } else {
    trustBalPrev = { value: '0' };
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

function getPackageVersion() {
  return pJson.version;
}

function getApiVersion() {
  var pattern = /([0-9])(?:\.)/g;
  return pattern.exec(getPackageVersion())[1];
}

function getUrlBase(request) {

  if (config.get('url_base')) {
    return config.get('url_base');
  }
  return request.protocol + '://' + request.hostname + (config && config.get('port') ? ':' + config.get('port') : '');
}
