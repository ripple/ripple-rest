require 'capistrano/node-deploy'
require 'capistrano/uptodate'

set :application, 'ripple-rest'
set :scm, 'git'
set :repository, 'https://github.com/ripple/ripple-rest.git'
set :branch, ENV['branch'] ? ENV['branch'] : 'develop'
set :deploy_to, "/var/apps/#{application}"
set :user, 'ubuntu' # deploy user
set :node_user, "#{application}" # run user
set :node_binary, '/usr/bin/node'
set :node_env, ENV['NODE_ENV'] ? ENV['NODE_ENV'] : 'staging'
set :app_command, 'server.js'
#set :app_environment, '' # environment variables

namespace :deploy do
  desc "Copy settings file to release dir"
  task :copy_config_to_release_path do
    run "if [ -f #{shared_path}/config/config.json ]; then cp -ar #{shared_path}/config/config.json #{release_path}/; fi"
  end

  desc 'Create service user'
  task :create_user do
    run "sudo -u root useradd -U -m -r -s /dev/null #{application}"
  end
end

after 'node:install_packages', 'deploy:copy_config_to_release_path'
