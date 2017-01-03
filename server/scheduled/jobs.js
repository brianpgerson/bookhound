const schedule = require('node-schedule'),
      Bank = require('../controllers/bank');

module.exports = {
  scheduleJob: function() {
    rule = '* * * * *'

    // Kick off the job
    const job = schedule.scheduleJob(rule, function() {
      Bank.findEligibleAccounts();
    });
  },

  init: function() {
    this.scheduleJob();
  }
};
