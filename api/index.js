var Balances   = require('./balances');
var Settings   = require('./settings');
var TrustLines = require('./trustlines');

module.exports = (function() {

  return function init(opts) {
    var self = this;

    return {
      balances: {
        get: Balances.get.bind(self, opts)
      },

      settings: {
        get: Settings.get.bind(self, opts),
        change: Settings.change.bind(self, opts)
      },

      trustlines: {
        get: TrustLines.get.bind(self, opts),
        add: TrustLines.add.bind(self, opts)
      }
    }
  };

})();
