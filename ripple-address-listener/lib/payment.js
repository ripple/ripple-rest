var gatewayHotWalletAddress = process.env.RIPPLE_ADDRESS;

function Ledger(hash, index) {
  this.hash = hash;
  this.index = index;
  this.transactions = [];
}

function Payment(msg) {
  var message = JSON.parse(msg);
  this.result = message.engine_result;
  this.validated = message.validated;

  function parseXrpAmount(drops) {
    return parseFloat(drops) / 100000;
  }

  if ((typeof message.transaction.Amount) == 'string') {
    this.toAmount = parseXrpAmount(message.transaction.Amount);
    this.toCurrency = 'XRP';
  } else {
    this.toAmount = message.transaction.Amount.value;
    this.toCurrency = message.transaction.Amount.currency;
    this.toIssuer = message.transaction.Amount.issuer;
  }

  if (!!message.transaction.SendMax) {
    this.fromAmount = message.transaction.SendMax.value;
    this.fromCurrency = message.transaction.SendMax.currency;
    this.fromIssuer = message.transaction.SendMax.issuer;
  } else {
    this.fromAmount = parseXrpAmount(message.transaction.Amount);
    this.fromCurrency = 'XRP';
  }

  this.toAddress = message.transaction.Destination;
  this.fromAddress = message.transaction.Account;

  this.txState = message.meta.TransactionResult;
  this.txHash = message.transaction.hash;
  this.destinationTag = message.transaction.DestinationTag;

  if (this.result != 'tesSUCCESS') {
    throw new Error("Result not tesSUCCESS");
  }

  if (!this.validated) {
    throw new Error("Payment not validated");
  }
}

Payment.prototype.toJSON = function() {
  return {
    validated: this.validated,
    txState: this.txState,
    txHash: this.txHash,
    toCurrency: this.toCurrency,  
    toIssuer: this.toIssuer,
    fromIssuer: this.fromIssuer,
    fromCurrency: this.fromCurrency,
    toAmount: this.toAmount,
    fromAmount: this.fromAmount,
    toAddress: this.toAddress,
    fromAddress: this.fromAddress,
    destinationTag: this.destinationTag
  }
}

Payment.parseFromMessage = function(message) {
  if (!message.validated) { return false }
  if (message.engine_result != 'tesSUCCESS') { return false }
  if (message.transaction.PaymentType != 'Payment') { return false }
  return new Payment(message);
}

module.exports = Payment;
