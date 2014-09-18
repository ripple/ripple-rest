## 1.3.0

+ New endpoint to generate an address/secret pair, `/account/new`

+ New configuration, you will have to change your config file

+ Transitioned to Express4

+ Refactored response and error handling, improves consistency of response messages

+ Expose `router` and `remote` as `RippleRestPlugin` to use as a plugin for other modules

+ Centralize connection checking, improves consistency of connected responses

+ New test-suite

+ Update ripple-lib which fixes several stability problems and crashes

+ Fix: Check tx.meta exists before accessing

+ Fix: Allow browser-based client to make POST to ripple-rest server

+ Fix: Occasional crash on getting payments for account

+ Code refactor and cleanup


## 1.2.5

+ Fix: Check that tx.meta exists before accessing

+ Fix: Case where ripple-rest would crash when rippled could not be connected to


## 1.2.4

+ Change rconsole logging from stderr to stdout

+ Add timestamps to HTTP(S) request logging

+ Fix database reset on startup