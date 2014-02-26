# `ripple-rest` Guide

`ripple-rest` provides a simple mechanism for robustly submitting payments and definitively confirming the state of outgoing and incoming payments.

Users of this API should implement the following application logic:

1. Add new transactions to a pending transactions database table
2. Check the state of the `rippled` connection
3. Poll for and handle notifications of incoming and outgoing payments
4. Submit pending transactions to `ripple-rest`


### 1. Add new transactions to a pending transactions database table
### 2. Check the state of the `rippled` connection
### 3. Poll for and handle notifications of incoming and outgoing payments
### 4. Submit pending transactions to `ripple-rest`

