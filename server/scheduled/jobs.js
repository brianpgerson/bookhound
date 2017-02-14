const schedule = require('node-schedule'),
      Bank = require('../controllers/bank.controller');

module.exports = {
  scheduleJob: function() {
    rule = '* * * * *'
    console.log(rule)
    // Kick off the job
    const chargeJob = schedule.scheduleJob(rule, function() {
      Bank.findEligibleAccountsToCharge();
    });

    const buyJob = schedule.scheduleJob(rule, function() {
      Bank.findEligibleAccountsToCharge();
    });
  },

  init: function() {
    Bank.findEligibleAccountsToCharge();
    Bank.findEligibleAccountsToBuyBooks();
    // this.scheduleJob();
  }
};
