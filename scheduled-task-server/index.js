var request = require('request');
var schedule = require('node-schedule');

var APP = {
  scheduleJob: function() {
    rule = '* 17 * * *'

    // Kick off the job
    var job = schedule.scheduleJob(rule, function() {
      request('localhost:8080/api/daily-charge', function (error, response, body) {
        if (error) {
          console.log('error:', error)
        } else if (!error && response.statusCode == 200) {
          console.log('success!');
        }
      })
    });
  },

  init: function() {
    APP.scheduleJob();
  }
};

(function(){
  APP.init();
})();
