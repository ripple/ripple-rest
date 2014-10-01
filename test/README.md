You can edit in config.json

1. Configuring to connect to a running rippled 

  "rippled_servers": [
    "wss://s1.ripple.com:443"
  ]
   
2. Configuring to launch and connect to a local rippled 

    Run as root 

	rippled -a  
     
    from the /test2 directory so that rippled will read in the /test2/rippled.cfg 

     "rippled_servers": [
        "ws://localhost:5006"
      ]


3. Configuring to run tests without a rippled using the built-in test "rippled mock" server

     "rippled_servers": [
        "ws://localhost:5150"
      ]


_server_info-test.js can use either hosted, local, or mock

_get_payment-test.js can use local or mock
