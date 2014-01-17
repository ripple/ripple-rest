var NotificationMonitor = require('./notificationMonitor'),
  MonitoredAddress = require('../models/monitoredAddress');

MonitoredAddress.findOrCreate({
  notificationAddress: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM'
});

var nm = new NotificationMonitor({
  // trace: true,
  // startLedger: 4469800,
  servers: [{
    host: 's_west.ripple.com',
    port: 443,
    trusted: true
  }]
});

setTimeout(function(){
  nm.start();
}, 1000);

