var accountSid = 'sid';
var authToken = 'secret';
var username = 'your@email.com';
var password = 'also-secret';

var Nightmare = require('nightmare');
var Twilio = require('twilio');

var nightmare = Nightmare({ show: true, typeInterval: 5 });

var logIn = function() {
  return nightmare
    .viewport(1000, 1200)
    .goto('https://www.twilio.com/login')
    .wait('#email')
    .type('#email', username)
    .type('#password', password)
    .click('[type=submit]');
};

var getWarnings = function() {
  var MonitorClient = Twilio.MonitorClient;
  var monitorClient = new MonitorClient(accountSid, authToken);
  var params = {
    logLevel: "warning"
  };
  return monitorClient.alerts.list(params);
};

var checkWarnings = function(data) {
  return data.alerts.reduce(function(loopingNightmare, alert) {
    return loopingNightmare
      .goto('https://www.twilio.com/console/voice/logs/calls/' + alert.resource_sid)
      .wait('a[data-tip="Replay"]')
      .evaluate(function() {
        $('.label-danger, .label-warning').parent().next().find('a[data-tip="Replay"]')[0].click();
      })
      .wait('i.text-success');
  }, nightmare);
};

logIn().then(getWarnings).then(checkWarnings).then(function() {
  console.log('all done!');
});
