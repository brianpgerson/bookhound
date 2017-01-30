const schedule = require('node-schedule'),
      Bank = require('../controllers/bank');

module.exports = {
  scheduleJob: function() {
    rule = '* * * * *'
    console.log(rule)
    // Kick off the job
    const job = schedule.scheduleJob(rule, function() {
      console.log('fun bank time')
      Bank.findEligibleAccounts();
    });
  },

  init: function() {
    Bank.findEligibleAccounts();
    // this.scheduleJob();
  }
};
