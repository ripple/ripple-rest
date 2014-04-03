var ripple = require('ripple-lib');
var async  = require('async');

var remote = new ripple.Remote({
  servers: [{
    host: 's-west.ripple.com',
    port: 443,
    secure: true
  }]
});
remote.connect();

remote.on('connect', function(){

  console.log('connected');

  var start = Date.now();

  keepUpToDate({
    currency: 'USD',
    issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'
  }, {
    currency: 'XRP'
  });

});

function keepUpToDate(base_currency, counter_currency, start_ledger) {

  if (!start_ledger) {
    start_ledger = remote._ledger_current_index - 1; // TODO replace this with remote function
  }

  var end_ledger = remote._ledger_current_index - 1; // TODO replace this with remote function

  if (start_ledger > end_ledger) {
    setTimeout(function(){
      keepUpToDate(base_currency, counter_currency, start_ledger);
    }, 100);
    return;
  }

  getModifiedOffers(base_currency, counter_currency, start_ledger, end_ledger, function(err, offers){
    if (err) {
      console.log(JSON.stringify(err));
      return;
    }

    console.log(JSON.stringify(offers));

    setImmediate(function(){
      keepUpToDate(base_currency, counter_currency, offers.end_ledger + 1);
    });
  });

}

/**
 *  Get all created, modified, and deleted offers 
 */
function getModifiedOffers(base_currency, counter_currency, start_ledger, end_ledger, callback) {

  var gateway;
  if (base_currency.currency !== 'XRP') {
    gateway = base_currency.issuer;
  } else {
    gateway = counter_currency.issuer;
  }

  getGatewayTransactions(gateway, start_ledger, end_ledger, function(err, account_tx_res){
    if (err) {
      callback(err);
      return;
    }

    var start_ledger = account_tx_res.ledger_index_min,
      end_ledger = account_tx_res.ledger_index_max;

    var offers = parseRelevantOffers(account_tx_res.transactions, base_currency, counter_currency);

    callback(null, {
      start_ledger: start_ledger,
      end_ledger: end_ledger,
      offers: offers
    });
  });

}

/**
 *  Return all Offer nodes that match the given currency pair
 */
function parseRelevantOffers(binary_transactions, base_currency, counter_currency) {
  var relevant_offer_nodes = [];

  for (var t = 0; t < binary_transactions.length; t++) {

    /* Temporary solution until ripple-lib passes binary format through */
    // var deserialized_meta = new ripple.SerializedObject(binary_transactions[t].meta).to_json();
    deserialized_meta = binary_transactions[t].meta;

    for (var n = 0; n < deserialized_meta.AffectedNodes.length; n++) {
      var affected_node = deserialized_meta.AffectedNodes[n],
        node = affected_node.CreatedNode || affected_node.ModifiedNode || affected_node.DeletedNode;
      
      if (node.LedgerEntryType !== 'Offer') {
        continue;
      }

      var fields = node.NewFields || node.FinalFields;
      if (offerMatchesCurrencyPair(fields.TakerPays, fields.TakerGets, base_currency, counter_currency)) {
        node.ledger = binary_transactions[t].ledger_index || binary_transactions[t].tx.ledger_index; // TODO remove the .tx...
        relevant_offer_nodes.push(affected_node);
      }

    }
  }

  return relevant_offer_nodes;
}

/**
 *  Check if the TakerPays and TakerGets amount match the base_currency and counter_currency
 */
function offerMatchesCurrencyPair(taker_pays, taker_gets, base_currency, counter_currency) {

  return ((currenciesMatch(taker_pays, base_currency) && currenciesMatch(taker_gets, counter_currency)) ||
    (currenciesMatch(taker_pays, counter_currency) && currenciesMatch(taker_gets, base_currency)));

}

/**
 *  Check if the currency from rippled matches the searched_for_currency,
 *  taking into account that rippled denotes XRP amounts as strings instead of objects
 */
function currenciesMatch(rippled_currency, searched_for_currency) {
  if (typeof rippled_currency === 'string') {

    return (searched_for_currency.currency === 'XRP');

  } else if (typeof rippled_currency === 'object') {

    return (rippled_currency.currency === searched_for_currency.currency &&
      rippled_currency.issuer === searched_for_currency.issuer);

  } else {
    throw(new Error('Invalid currency: ' + rippled_currency));
  }
}

/**
 *  Get all of the transactions pertaining to the gateway's account
 */
function getGatewayTransactions(gateway, start_ledger, end_ledger, callback) {

  if (start_ledger >= remote._ledger_current_index) {
    callback(null, []);
    return;
  }

  // TODO make this paginate results
  remote.requestAccountTx({
    account: gateway,
    ledger_index_min: start_ledger,
    ledger_index_max: end_ledger,
    binary: true
  }, function(err, res){
    if (err) {
      callback(err);
      return;
    }

    callback(null, res);
  });

}