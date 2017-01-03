const plaid = require('plaid');
const _ = require('lodash');
const moment = require('moment');
const config = require('../config/main');
const plaidClient = new plaid.Client(config.plaid.client, config.plaid.secret, plaid.environments.tartan);

exports.getUserInfo = function (financialData) {
	let at = financialData.accessToken;
	let ai = financialData.accountId;

	plaidClient.getConnectUser(at, {}, function (err, response) {
		const checking = _.filter(response.transactions, function (transaction) {
			return transaction._account === ai
		});

		var og = 1081.78;
		var sorted = _.sortBy(checking, 'date').reverse();

		const start = moment(new Date()).subtract(3, 'years');
		const end = moment(new Date()).subtract(2, 'years');
		const days = end.diff(start, 'days');
		let tracker = _.reduce(sorted, function(memo, transaction) {
			memo[transaction.date] = transaction.amount;
			return memo;
		}, {currentBalance: 1081.78})

		_.times(days, function(index) {
			const today = end.format('YYYY-MM-DD');
			const dayBefore = end.add(1, 'day').format('YYYY-MM-DD');
			let newBalance;

			if (index === 0) {
				newBalance = tracker[today] ? tracker.currentBalance - tracker[today] : tracker.currentBalance;
			} else if (tracker[today]) {
				newBalance = tracker[dayBefore] - tracker[today];
			} else {
				newBalance = tracker[dayBefore];
			}
			tracker[today] = parseFloat(newBalance.toFixed(2));
		});

		const averageWithdrawal = _.meanBy(checking, 'amount');
		let daysBetweenTransactions = [];
		_.each(checking, function(txn, index) {
			if (index < checking.length - 1) {
				thisTxn = moment(txn.date);
				earlierTxn = moment(checking[index+1].date);
				daysBetweenTransactions.push(thisTxn.diff(earlierTxn, 'days'));
			}
		})

		var today = moment(new Date()).subtract(2, 'years').subtract(1, 'days').format('YYYY-MM-DD');
		var current = tracker[today];

		return {
			balancesOverTime: tracker,
			averageWithdrawalSize: averageWithdrawal,
			averageWithdrawalFrequency: _.mean(daysBetweenTransactions),
			lowestRecentBalance: _.minBy(_.values(tracker)),
			currentBalance: current
		};
	});
}
