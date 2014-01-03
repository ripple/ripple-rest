# Ripple Account Listener

The purpse of this module is to easily monitor
an account for various streaming events from the 
network.

To make this easy a single object is provided
that serves as a protocol buffer between raw network
object that parses out the most relevant information.

For now the listener only provides support for
payment transactions, and uses a module to parse
out the vital details into a standardized simple
payment api object

    AccountListner = require('./lib/account_listener')

    accountListener = new AccountListener({
      accounts: ['r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk'] 
    })

    accountListener.connect()
    accountListener.on('payment', console.log)

The above code will log the following payment object to
standard out

    { validated: true,
      txState: 'tesSUCCESS',
      txHash: 'BD67D18970A8ED2EB7B4C554145E44F9B6285B91F00FFDAE133F623AC3FDBD4A',
      toCurrency: 'BTC',
      toIssuer: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
      fromIssuer: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
      fromCurrency: 'BTC',
      toAmount: '0.001',
      fromAmount: '0.00101',
      toAddress: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
      fromAddress: 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB',
      destinationTag: 5 }

## Running the Tests

    mocha test/

