module.exports.env = 'dev';

module.exports.remoteOptions = {
  local_signing: true,
  servers: [{
    host: 's_west.ripple.com',
    port: 443,
    secure: true
  }]
};
