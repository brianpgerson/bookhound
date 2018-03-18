const  schedule = require('node-schedule'),
PurchaseService = require('../services/purchase.service'),
           Bank = require('../controllers/bank.controller');

const second = 1000;

module.exports = {
    scheduled: {},

    scheduleJob: function() {
        let chargeRule = new schedule.RecurrenceRule();
        chargeRule.hour = 18;
        chargeRule.minute = 5;
        chargeRule.second = 0;

        let buyRule = new schedule.RecurrenceRule();
        buyRule.hour = 18;
        buyRule.minute = 10;
        buyRule.second = 0;

        let orderPoller = setInterval(() => {
            PurchaseService.orderRequestPoller();
        }, 10 * second)

        this.scheduled.chargeJob = schedule.scheduleJob(chargeRule, () => Bank.findEligibleAccountsToCharge());
        this.scheduled.buyJob = schedule.scheduleJob(buyRule, () => Bank.findEligibleAccountsToCharge());
    },

    init: function() {
        Bank.findEligibleAccountsToCharge();
        Bank.findEligibleAccountsToBuyBooks();
        this.scheduleJob();
    }
};
