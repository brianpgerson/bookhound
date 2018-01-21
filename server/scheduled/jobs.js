const schedule = require('node-schedule'),
          Bank = require('../controllers/bank.controller');

module.exports = {
    scheduled: {},

    scheduleJob: function() {
        let rule = new schedule.RecurrenceRule();
        rule.hour = 17;

        this.scheduled.chargeJob = schedule.scheduleJob(rule, () => Bank.findEligibleAccountsToCharge());
        this.scheduled.buyJob = schedule.scheduleJob(rule, () => Bank.findEligibleAccountsToCharge());
    },

    init: function() {
        Bank.findEligibleAccountsToCharge();
        Bank.findEligibleAccountsToBuyBooks();
        this.scheduleJob();
    }
};
