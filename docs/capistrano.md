# Capistrano Deploy Instructions #

`ripple-rest` can be deployed with capistrano. It has been tested with ubuntu 13.10.

### Install capistrano and dependencies

Assuming you have ruby and bundler installed, from the `ripple-rest` root, run:
```bash
bundle install
```

### Set up deploy user

You need a user with sudo access to deploy. The script is configured to use the `ubuntu` user, you can change the :user setting in capistrano if you want a different user. You should copy your ssh key to this user's authorized_keys file.

### Add a service user

An unprivileged user should be created to securely run the server, you can use this cap task to add it:

```bash
bundle exec cap HOSTS=<ip or hostnames of target server> deploy:create_user
```

### Put the configuration in place

SSH to the server and create the configuration file.

This example config uses the in-memory sqlite3 database and no SSL. NODE_ENV is omitted because capistrano sets it as an environment variable.
```bash
mkdir -p /var/apps/ripple-rest/shared/config
cat <<END > /var/apps/ripple-rest/shared/config/config.json
{
  "config_version": "1.0.1",
  "PORT": 5990,
  "HOST": "localhost",
  "rippled_servers": [
    {
      "host": "s-west.ripple.com",
      "port": 443,
      "secure": true
    }
  ],
  "debug": true
}
END
```

On each deploy, this configuration will be copied from this file to the release path.

### Deploy

Set the `HOSTS` environment variable to the target server and run:
```bash
bundle exec cap HOSTS=<ip or hostname of target server> deploy
```

You can deploy any branch by setting the `branch` environment variable
```bash
bundle exec cap HOSTS=<ip or hostname of target server> branch=mycoolfeature deploy
```

Capistrano also allows you to set (override) variables
```bash
bundle exec cap HOSTS=<ip or hostname of target server> --set repository='https://github.com/foo/ripple-rest.git' deploy
```

