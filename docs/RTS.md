# `ripple-rest` Robust Transaction Submission

In order to achieve fully robust transaction submission, the new version of `ripple-rest` will support (or require) submitting transactions with a `transaction_id` field. This ID will be persisted locally, help users confirm validated transactions, and ensure that transaction submission is idempotent (i.e. the same transaction can be submitted multiple times to `ripple-rest` but it will only be submitted once to the Ripple Network).

Because this design is more robust than the previous implementation, `ripple-rest` will no longer check the state of the connection to `rippled` when transactions are submitted. Irrespective of the state of the `rippled` connection, transactions will be queued by `ripple-rest`. There will be a new API endpoint (`/api/v1/server/connected`) that users can call to determine if `ripple-rest` is still connected to `rippled` and react accordingly. `ripple-lib` will handle transaction submission when the connection to `rippled` is reestablished.


### The Robust Transaction Submission and Definitive Confirmation Process:

1. When `ripple-rest` starts up it will instantiate a `ripple-lib` `Remote` object with options including:
  
  ```js
  var remote = new ripple.Remote({
    /* ... */
    storage: {
      saveTransaction: function(transaction_data, callback) { /* ... */ },
      loadPendingTransactions: function(callback) { /* ... */ }
    }
  });
  ```

2. The `Remote` object will call `loadPendingTransactions` to determine if it was in the process of submitting any transactions when the server went down last time. If there are no transactions in the database with their `state` set to `pending`, the process will continue. If there are pending transactions, `ripple-lib` will use the `account_tx` command to determine whether any or all of them were validated, failed, or expired because the `LastLedgerSequence` passed. If some transactions are still pending, `ripple-lib` will attempt to resubmit them. However, if `ripple-lib` would need to change the fee or sequence number and resign the transaction before submission, it will fail with an `engine_result` set to `tejNoSecret` because account secrets will not be persisted with transaction details

3. Users will submit payments in the following form:

  ```js
  {
    "secret": "s...",
    "transaction_id": "12345", // this could be a field in the Payment
    "payment": { /* ... */ }
  }
  ```

4. `ripple-rest` converts the `Payment` into a `ripple-lib` `Transaction`. If the submitted transaction is invalid in any way an error will be sent back to the user in the form:

  ```js
  {
    "success": false,
    "error": "Some Error Happened",
    "message": "This is why the error happened, please do the following and try again"
  }
  ```
  Otherwise the user will see the response:
  ```js
  {
    "success": true,
    "transaction_id": "12345"
  }
  ```


5. `ripple-lib` checks the database to ensure that the `src_address` has not already submitted a transaction with the same `transaction_id`. If this is a previously unsubmitted transaction, `ripple-lib` signs the `Transaction` and saves its details to the persistent database using the `saveTransaction` function

6. `saveTransaction` is called with the following information:

  ```js
  {
    "transaction_id": "12345",
    "tx_json": { /* ... */},
    "transaction_hashes": ["...", "...", ...],
    "submission_attempts": 1,
    "state": "pending",
    "engine_result": "",
    "engine_result_message": ""
  }
  ```
  and it writes to a table with the following fields:
  + `src_address` - the address of the sender
  + `transaction_id` - the user-specified ID of this transaction
  + `transaction_json` - the full JSON representation of the transaction, which can be used by `ripple-lib` to recreate the transaction if the `ripple-rest` server dies before the transaction is validated. Once the transaction has been validated this field will be saved as `null`
  + `transaction_hashes` - an array of transaction hashes representing different versions of this transaction that `ripple-lib` has submitted (the transaction hash may change if `ripple-lib` adjusts the fee or transaction sequence number)
  + `submission_attempts` - tracks the number of times `ripple-lib` has attempted to submit the transaction and used to limit the number of times it will be tried
  + `submitted_at_ledger` - the ledger index number that the transaction was originally submitted at
  + `state` - `pending`, `validated`, `failed_in_ledger`, or `failed_off_network`
  + `engine_result` - `tesSUCCESS`, `tec...`, `tef...`, `tel...`, `tej...`
  + `engine_result_message` - additional explanation of `rippled` errors that can be passed back to the user
  + `reported` - boolean that defaults to false and is set to true when `ripple-rest` reports this transaction to the user as a `Notification`

7. `ripple-lib` submits the `Transaction` to `rippled`. `ripple-lib`'s `TransactionManager` will manage the transaction sequence numbers and fees, as well as resigning and resubmitting the transaction if necessary. `ripple-lib` will attempt to resubmit a given transaction 10 times and if all of those attempts fail it will record that failure in the database with `state` set to `failed_off_network`

8. `ripple-lib` will call the `saveTransaction` function every time a new transaction is queued, when a transaction is resubmitted to `rippled` (with a different fee, sequence number, or hash), and when the state of a transaction is updated. When `ripple-lib` updates the database with a final `state`, `engine_result`, and `engine_result_message`, it will save the entry without the `transaction_json` because those transactions have been written into the Ripple Ledger

9. When a user queries the `ripple-rest` `next_notification` endpoint with a `prev_tx_hash`, `ripple-rest` will first check the database for transactions submitted by that user that have their `state` set to `failed_off_network` and `reported` set to `false`. If there are unreported off-network failures, `ripple-rest` will respond with the first one of those and update its `reported` column to `true`. If there are no unreported off-network failures, `ripple-rest` will use the `account_tx` command to find the validated transaction that followed the one matching the user-supplied `prev_tx_hash`. To help the user match validated transactions to the transactions they submitted previously, `ripple-rest` will match validated outgoing transactions with entries in the database and will attach the original `transaction_id` to the `Notification` it returns

