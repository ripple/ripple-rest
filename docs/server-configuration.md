# `ripple-rest` Configuration

This document tracks all changes to the `config.json` format. If a new version is released the details will be updated here.

Minor version changes will be denoted by incrementing the last of the three version numbers (`0.0.1` -> `0.0.2`). Breaking changes will increment the second of the three numbers (`0.0.1` -> `0.1.1`). New versions of the API will have incremented the first of the three numbers (`0.0.1` -> `1.0.1`).

----------

### Version 0.0.2

```js
{
  "config_version": "0.0.2",
  "PORT": 5990,
  "NODE_ENV": "development",
  "HOST": "localhost",
  "DATABASE_URL": "postgres://ripple_rest_user:password@localhost:5432/ripple_rest_db",
  "ssl": {
    "key_path": "./certs/server.key",
    "cert_path": "./certs/server.crt"
  },
  "rippled_servers": [
    {
      "host": "s_west.ripple.com",
      "port": 443,
      "secure": true
    }
  ],
  "currency_prioritization": [
    "XRP",
    "EUR",
    "GBP",
    "AUD",
    "NZD",
    "USD",
    "CAD",
    "CHF",
    "JPY",
    "CNY"
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
+ `currency_priorititzation` - used for displaying Orders, this array defines the Currency Priority Ranking `ripple-rest` will use to determine the base and counter currencies

----------

### Version 0.0.1

```js
{
  "config_version": "0.0.1",
  "PORT": 5990,
  "NODE_ENV": "development",
  "HOST": "localhost",
  "DATABASE_URL": "postgres://ripple_rest_user:password@localhost:5432/ripple_rest_db",
  "ssl": {
    "key_path": "./certs/server.key",
    "cert_path": "./certs/server.crt"
  },
  "rippled_servers": [
    {
      "host": "s_west.ripple.com",
      "port": 443,
      "secure": true
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
