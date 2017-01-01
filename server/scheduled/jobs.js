const schedule = require('node-schedule'),
      Bank = require('../controllers/bank');

module.exports = {
  scheduleJob: function() {
    rule = '* * * * *'

    // Kick off the job
    const job = schedule.scheduleJob(rule, function() {
      Bank.ping('cool');
    });
  },

  init: function() {
    this.scheduleJob();
  }
};
