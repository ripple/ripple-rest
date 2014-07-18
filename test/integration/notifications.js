var assert = require('assert');
var async = require('async');
var httpClient = require('superagent');

describe('Getting next and previous notification urls', function() {
  before(function() {
    account = 'rP5ShE8dGBH6hHtNvRESdMceen36XFBQmh';
    transactionHashesOrderedOldestToNewest = [
      '75959B065FB32D93439C961ACAF80099C067B54AE64D41E040558E3581C31357',
      '9FEFEC78092EFA99008B798C2AEF1EB6CA68F001CBB40EED7DDAB4CA99E3BA9C',
      'F60E6049D444B7B07AE6FEFA07CC8AF9BDEDB1D6F81FA4FB0A4F1DE72A0E2ED6',
      '8EC7F3C7C85C387BC47CA513255EC136C97BCEFC7CB6E97A93EFE6FC9C923AA7',
      '54CC31F444BD7172000EE3BBCBFFD42711D2B850CA7BD4809B10FC4F1B01C98D',
      '9CEA9981ADA97884C56869ED22411EA55052652B9DDA6CCC3012965422D659AD',
      'A5AF6C5F4E8BD4417EEA942B79D51321BBFD10B14918E883846193AAAAD08953',
      'B1BC0C49D16C6EE23047A8E71B48D09D92E206A50DF5F1BD6340A973E5F47407',
      '6D897A08E4B704864CE10720BB448ECC93B788AF6ECA4E453E33D73594F59571',
      '1DD8C891321285B42A8D4AEDD8B88653E5EB7B367A3BC2B8A422D77CDF2975AA',
      '73854A202727EE318131095888A179B1C7C948D539FA42716505F301BFEDC0EF',
      'E812DBF63C4017CAC41CC466923C1DBAF971E5E6944339CD3A59EB10F32FC104',
      '4DE3F5D844BECB72605E1C42EBF389EFE37D1DBD35690967A924C1C269F15984',
      '16B382878AD5AA6EC259D5118485FB590712B58453116A5DE50A19FFF72369C1',
      '499EA9BA711A44DFEC2484B4F6D55E7E741F4D99E58C4CCF20C2C969AECD1567',
      '412F0184F3FFC65D15B8ECC141164923D2F2F7FE4C1EC6266B1FA18161BAC49A',
      '8B17DF97452C93AE495170B78D81F02B227E408C706BCA464EDCE14E85A598F8',
      'FFF4F65FD8F1DB45DEC84EE1E390047FDB92D81ACE08BAA11B0A1BF3BA85F5B3',
      'BA6FBFCAB24296E09008FBA0FC9E39EB1738D0A0B1F5671BE6C91CCA106BB640'
    ]; 
  });

  it('should traverse the history in order using next_notification_url', function(done) {
    this.timeout = 30000;
    function buildNotificationCallback(hash, index) {
      return function(callback) {
        httpClient
          .get('http://localhost:5990/v1/accounts/'+account+'/notifications/'+hash)
          .end(function(error, response) {
            var notification = response.body.notification;
            var expectedHash = transactionHashesOrderedOldestToNewest[index];
            var expectedNextHash = transactionHashesOrderedOldestToNewest[index+1];
            if (notification) {
              console.log(notification.hash, expectedHash);
              console.log(notification.next_hash, expectedNextHash);
              assert.strictEqual(notification.hash, expectedHash);
              assert.strictEqual(notification.next_notification_url, 'http://localhost:5990/v1/accounts/'+account+'/notifications/'+expectedNextHash);
              assert.strictEqual(notification.hash, expectedHash);
              if (index < index.length-1) {
                assert.strictEqual(notification.next_hash, expectedNextHash);
              }
            } else {
              console.error('BadNotificationError', error);
            }
            callback(error, response);
          });
      }
    };
    var notificationCallbacks = []
    transactionHashesOrderedOldestToNewest.forEach(function(transactionHash, index) {
      notificationCallbacks.push(buildNotificationCallback(transactionHash, index));
    }); 
    async.series(notificationCallbacks, function(error, response) {
      console.log('ERROR', error);
      done();
    });
  });
});

