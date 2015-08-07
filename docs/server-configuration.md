# Server Configuration for `ripple-rest` 

This document tracks all changes to the `config.json` format. If a new version is released the details will be updated here.

An example configuration file is provided [here](../config-example.json).

----------

### Version 2.0.3

### Changes

+ Add `proxy` property that provides ripple-lib with a proxy url to route websocket connections to rippled through

```js
{
  'config_version': '2.0.3',
  'debug': false,
  'port': 5990,
  'host': 'localhost',
  'ssl_enabled': false,
  'ssl': {
    'key_path': './certs/server.key',
    'cert_path': './certs/server.crt'
  },
  'db_path': './ripple-rest.db',
  'max_transaction_fee': 1000000,
  'proxy': 'http://username:password@0.0.0.0:3128'
  'rippled_servers': [
    'wss://s1.ripple.com:443'
  ],
  'url_base': 'https://api.ripple.com:443'
}
```

+ `config_version` - will be checked by the configuration loader and it will throw an error if there have been breaking changes to the format
+ `port` - the port that the API server will be available on
+ `host` - the host the API server will be available on
+ `dp_path` - path for sqlite3 to save the database to. Can be populated with `:memory:` to run an in-memory version of the sqlite db
+ `ssl_enabled` - boolean to configure to server to host over SSL
+ `ssl` - if an object with `key_path` and `cert_path` are provided, the API server will be available over HTTPS
+ `max_transaction_fee` - the maximum fee you're willing to pay for a transaction, has to be a `Number`
+ `rippled_servers` - an array of server objects indicating which `rippled` servers the API should connect to. These should be configured to point to your local `rippled` if you are running one, instead of `s_west.ripple.com`
+ `proxy` - the url of a proxy server. Connections to the rippled_servers will be routed through here
+ `debug` - boolean to log debugging information
+ `url_base` - override the url base (protocol://host_name:port) that is used in url construction for rest responses

----------

### Version 2.0.2

### Changes

+ Add `url_base` property to override the url base (protocol://host_name:port) that is used in url construction for rest responses
   - e.g. `'url_base': 'https://api.ripple.com'` will yield a transaction status url of `https://api.ripple.com/v1/accounts/{account}/payments/{hash}`

```js
{
  'config_version': '2.0.2',
  'debug': false,
  'port': 5990,
  'host': 'localhost',
  'ssl_enabled': false,
  'ssl': {
    'key_path': './certs/server.key',
    'cert_path': './certs/server.crt'
  },
  'db_path': './ripple-rest.db',
  'max_transaction_fee': 1000000,
  'rippled_servers': [
    'wss://s1.ripple.com:443'
  ],
  'url_base': 'https://api.ripple.com:443'
}
```

+ `config_version` - will be checked by the configuration loader and it will throw an error if there have been breaking changes to the format
+ `port` - the port that the API server will be available on
+ `host` - the host the API server will be available on
+ `dp_path` - path for sqlite3 to save the database to. Can be populated with `:memory:` to run an in-memory version of the sqlite db
+ `ssl_enabled` - boolean to configure to server to host over SSL
+ `ssl` - if an object with `key_path` and `cert_path` are provided, the API server will be available over HTTPS
+ `max_transaction_fee` - the maximum fee you're willing to pay for a transaction, has to be a `Number`
+ `rippled_servers` - an array of server objects indicating which `rippled` servers the API should connect to. These should be configured to point to your local `rippled` if you are running one, instead of `s_west.ripple.com`
+ `debug` - boolean to log debugging information
+ `url_base` - override the url base (protocol://host_name:port) that is used in url construction for rest responses

----------

### Version 2.0.1

### Changes

+ Add `max_transaction_fee` property to set the maximum fee you're willing to pay for a transaction

```js
{
  'config_version': '2.0.1',
  'debug': false,
  'port': 5990,
  'host': 'localhost',
  'ssl_enabled': false,
  'ssl': {
    'key_path': './certs/server.key',
    'cert_path': './certs/server.crt'
  },
  'db_path': './ripple-rest.db',
  'max_transaction_fee': 1000000,
  'rippled_servers': [
    'wss://s1.ripple.com:443'
  ]
}
```

+ `config_version` - will be checked by the configuration loader and it will throw an error if there have been breaking changes to the format
+ `port` - the port that the API server will be available on
+ `host` - the host the API server will be available on
+ `dp_path` - path for sqlite3 to save the database to. Can be populated with `:memory:` to run an in-memory version of the sqlite db
+ `ssl_enabled` - boolean to configure to server to host over SSL
+ `ssl` - if an object with `key_path` and `cert_path` are provided, the API server will be available over HTTPS
+ `max_transaction_fee` - the maximum fee you're willing to pay for a transaction, has to be a `Number`
+ `rippled_servers` - an array of server objects indicating which `rippled` servers the API should connect to. These should be configured to point to your local `rippled` if you are running one, instead of `s_west.ripple.com`
+ `debug` - boolean to log debugging information

----------

### Version 2.0.0

### Changes

+ All properties should be provided in lowercase
+ Deprecated Postgres support, moved to sqlite3 only
+ Removed `DATABASE_URL` and added `db_path` for specifying the path for sqlite to save to
+ Optionally you can provide the `:memory:` as the db_path to run an in-memory sqlite database

```js
{
  'config_version': '2.0.0',
  'debug': false,
  'port': 5990,
  'host': 'localhost',
  'ssl_enabled': false,
  'ssl': {
    'key_path': './certs/server.key',
    'cert_path': './certs/server.crt'
  },
  'db_path': './ripple-rest.db',
  'rippled_servers': [
    'wss://s1.ripple.com:443'
  ]
}
```

+ `config_version` - will be checked by the configuration loader and it will throw an error if there have been breaking changes to the format
+ `port` - the port that the API server will be available on
+ `host` - the host the API server will be available on
+ `dp_path` - path for sqlite3 to save the database to. Can be populated with `:memory:` to run an in-memory version of the sqlite db
+ `ssl_enabled` - boolean to configure to server to host over SSL
+ `ssl` - if an object with `key_path` and `cert_path` are provided, the API server will be available over HTTPS
+ `rippled_servers` - an array of server objects indicating which `rippled` servers the API should connect to. These should be configured to point to your local `rippled` if you are running one, instead of `s_west.ripple.com`
+ `debug` - boolean to log debugging information

----------

### Version 0.0.2

#### Changes

+ Added `debug` option

```js
{
  'config_version': '1.0.1',
  'PORT': 5990,
  'NODE_ENV': 'development',
  'HOST': 'localhost',
  'DATABASE_URL': 'postgres://ripple_rest_user:password@localhost:5432/ripple_rest_db',
  'ssl': {
    'key_path': './certs/server.key',
    'cert_path': './certs/server.crt'
  },
  'rippled_servers': [
    {
      'host': 's_west.ripple.com',
      'port': 443,
      'secure': true
    }
  ],
  'debug': true
}
```

+ `config_version` - will be checked by the configuration loader and it will throw an error if there have been breaking changes to the format
+ `PORT` - the port that the API server will be available on
+ `NODE_ENV` - either `development`, `staging`, or `production`
+ `HOST` - the host the API server will be available on
+ `DATABASE_URL` - the URL used to connect to the PostgreSQL database
+ `ssl` - if an object with `key_path` and `cert_path` are provided, the API server will be available over HTTPS
+ `rippled_servers` - an array of server objects indicating which `rippled` servers the API should connect to. These should be configured to point to your local `rippled` if you are running one, instead of `s_west.ripple.com`
+ `debug` - boolean to log debugging information

----------

### Version 0.0.1

```js
{
  'config_version': '0.0.1',
  'PORT': 5990,
  'NODE_ENV': 'development',
  'HOST': 'localhost',
  'DATABASE_URL': 'postgres://ripple_rest_user:password@localhost:5432/ripple_rest_db',
  'ssl': {
    'key_path': './certs/server.key',
    'cert_path': './certs/server.crt'
  },
  'rippled_servers': [
    {
      'host': 's_west.ripple.com',
      'port': 443,
      'secure': true
    }
  ]
}
```

+ `config_version` - will be checked by the configuration loader and it will throw an error if there have been breaking changes to the format
+ `PORT` - the port that the API server will be available on
+ `NODE_ENV` - either `development`, `staging`, or `production`
+ `HOST` - the host the API server will be available on
+ `DATABASE_URL` - the URL used to connect to the PostgreSQL database
+ `ssl` - if an object with `key_path` and `cert_path` are provided, the API server will be available over HTTPS
+ `rippled_servers` - an array of server objects indicating which `rippled` servers the API should connect to. These should be configured to point to your local `rippled` if you are running one, instead of `s_west.ripple.com`

----------
