const schedule = require('node-schedule'),
      Bank = require('../controllers/bank.controller');

module.exports = {
    let scheduled = {};

    scheduleJob: function() {
        let rule = new schedule.RecurrenceRule();
        rule.hour = 17;

        // Kick off the job
        scheduled.chargeJob = schedule.scheduleJob(rule, () => Bank.findEligibleAccountsToCharge());
        scheduled.buyJob = schedule.scheduleJob(rule, () => Bank.findEligibleAccountsToCharge());
    },

    init: function() {
        Bank.findEligibleAccountsToCharge();
        Bank.findEligibleAccountsToBuyBooks();
        // this.scheduleJob();
    }
};
