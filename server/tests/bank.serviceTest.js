const should = require('should');
const _ = require('lodash');
const moment = require('moment');
const config = require('../config/main');
const rawTestAccountData = require('./testAccountData');
const BankService = require('../services/bank.service');
let testAccountData;

function setDatesOnData(initial) {
	let data = _.cloneDeep(initial);
	let types = ['big', 'small', 'medium'];
	
	_.forEach(types, type => {
		let mostRecent = moment(data[type + 'Transactions'][0].date);
		// we get this to programmatically reset the months of our data.
		// this code is time-sensitive and goes back a preset amount of time from "now".
		// that means the test data (which is pulled from real data and therefore benefits
		// from retaining its original cadence) needs to be "offset" to be more recent.
		let originalFirstMonth = mostRecent.month();
		let originalFirstYear = mostRecent.year();

		let now = moment(moment.now());

		data[type + 'Transactions'] = _.map(data[type + 'Transactions'], (txn) => {
			let origDate = moment(txn.date);

			// ensures that it's always at least one month before "now"
			let monthDelta = originalFirstMonth - origDate.month() + 1;
			let yearDelta = originalFirstYear - origDate.year();
			// eg, it's feb (1) and the delta is 5 months from the originalFirstMonth
			// we would want it to be 1 - 5, or -4, which is not valid. now add 12 to give 
			// 8, and modulo to handle positive numbers and you still get 8. if it were the other way around
			// (it's june, or 5, and we have a delta of 1 to give 4, plus 12 is 16, which module 12 is 4 again)
			let newMonth = (12 + (now.month() - monthDelta)) % 12;
			let newYear = now.year() - yearDelta;

			let offsetDate = origDate.year(newYear).month(newMonth);

			// handle days of the month changing
			if (offsetDate.date() > offsetDate.daysInMonth()) {
				offsetDate.date(offsetDate.daysInMonth());
			}

			txn.date = offsetDate.format('YYYY-MM-DD');
			return txn;
		});
	});
	return data;
}

describe('The transaction parser', () => {
	before((done) => {
		testAccountData = setDatesOnData(rawTestAccountData);
		done();
	});

  	it('should have a thing?', () => {
    	should.exist(BankService.getBasicUserInfo);
  	});

  	it('should parse an extremely basic set of financial data', () => {
  		const basicInfo = getBasicInfo('small');
	  	const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;
	  	const amountToExtract = BankService.getDecisionInfo(basicInfo);
	  	console.log(amountToExtract);

	  	amountToExtract.should.be.a.Number();
	  	amountToExtract.should.be.aboveOrEqual(config.globalMin);
	  	amountToExtract.should.be.belowOrEqual(config.globalMax);
	});

	it('should parse an somewhat less basic set of financial data', () => {
  		const basicInfo = getBasicInfo('medium');
	  	const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;
	  	const amountToExtract = BankService.getDecisionInfo(basicInfo);
	  	console.log(amountToExtract);

	  	amountToExtract.should.be.a.Number();
	  	amountToExtract.should.be.aboveOrEqual(config.globalMin);
	  	amountToExtract.should.be.belowOrEqual(config.globalMax);
	});

	it('should parse a more intense set of transactions', () => {
		const basicInfo = getBasicInfo('big');
	  	const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;
	  	const amountToExtract = BankService.getDecisionInfo(basicInfo);
	  	console.log(amountToExtract);

	  	amountToExtract.should.be.a.Number();
	  	amountToExtract.should.be.aboveOrEqual(config.globalMin);
	  	amountToExtract.should.be.belowOrEqual(config.globalMax);
	});

	it('should parse a somewhat less basic set of transactions many times successfully', () => {
		const basicInfo = getBasicInfo('medium');
	  	const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;

	  	let nums = [];
	  	_.times(100, (i) => {
	  		nums.push(BankService.getDecisionInfo(basicInfo));
	  	});

	  	_.every(nums, (amountToExtract) => {
		  	amountToExtract.should.be.a.Number();
		  	amountToExtract.should.be.aboveOrEqual(config.globalMin);
		  	amountToExtract.should.be.belowOrEqual(config.globalMax);
	  	});
	});

	it('should parse a somewhat less basic set of transactions many times successfully with a lower balance', () => {
		let origBalance = testAccountData.mediumCurrentBalance;

		testAccountData.mediumCurrentBalance = 200;
		const basicInfo = getBasicInfo('medium');
	  	const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;

	  	let nums = [];
	  	_.times(100, (i) => {
	  		nums.push(BankService.getDecisionInfo(basicInfo));
	  	});

	  	_.every(nums, (amountToExtract) => {
		  	amountToExtract.should.be.a.Number();
		  	amountToExtract.should.be.aboveOrEqual(config.globalMin);
		  	amountToExtract.should.be.belowOrEqual(config.globalMax);
	  	});
	  	testAccountData.mediumCurrentBalance = origBalance;
	});

	it('should parse a somewhat less basic set of transactions many times successfully with a tiny balance', () => {
		let origBalance = testAccountData.mediumCurrentBalance;

		testAccountData.mediumCurrentBalance = 100;
		const basicInfo = getBasicInfo('medium');
		const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;

	  	let nums = [];
	  	_.times(100, (i) => {
	  		nums.push(BankService.getDecisionInfo(basicInfo));
	  	});


	  	_.every(nums, (amountToExtract) => {
		  	amountToExtract.should.be.a.Number();
		  	amountToExtract.should.equal(0)
	  	});
	  	testAccountData.mediumCurrentBalance = origBalance;
	});

	it('should parse a more intense set of transactions many times successfully', () => {
		const basicInfo = getBasicInfo('big');
	  	const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;

	  	let nums = [];
	  	_.times(100, (i) => {
	  		nums.push(BankService.getDecisionInfo(basicInfo));
	  	});

	  	_.every(nums, (amountToExtract) => {
		  	amountToExtract.should.be.a.Number();
		  	amountToExtract.should.be.aboveOrEqual(config.globalMin);
		  	amountToExtract.should.be.belowOrEqual(config.globalMax);
	  	});
	});

	it('should calculate stripe fees', () => {
		BankService.getTotalWithStripeCharges(1500).should.equal(1576);
		BankService.getTotalWithStripeCharges(100).should.equal(159);
	});
});

function getBasicInfo (type) {
	return {
  		currentBalance: testAccountData[`${type}CurrentBalance`],
  		lowestRecentBalance: testAccountData[`${type}LowestBalance`],
  		oneYearBalances: testAccountData[`${type}Balance`],
  		sortedTransactions: testAccountData[`${type}Transactions`]
  	};
}


