const should = require('should');
const _ = require('lodash');
const testAccountData = require('./testAccountData');
const BankService = require('../services/bank.service');

describe('The transaction parser', () => {
  	it('should have a thing?', () => {
    	should.exist(BankService.getBasicUserInfo);
  	});

  	it('should parse an extremely basic set of financial data', () => {
  		const basicInfo = getBasicInfo('small');
	  	const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;
	  	const high = 5;
	  	const low = 1;
	  	const amountToExtract = BankService.getDecisionInfo(basicInfo);
	  	console.log(amountToExtract);

	  	amountToExtract.should.be.a.Number();
	  	amountToExtract.should.be.above(low);
	  	amountToExtract.should.be.below(high);
	});

	it('should parse a more intense set of transactions', () => {
		const basicInfo = getBasicInfo('big');
	  	const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;
	  	const high = 5;
	  	const low = 1;
	  	const amountToExtract = BankService.getDecisionInfo(basicInfo);
	  	console.log(amountToExtract);

	  	amountToExtract.should.be.a.Number();
	  	amountToExtract.should.be.above(low);
	  	amountToExtract.should.be.below(high);
	});

	it('should parse a more intense set of transactions many times successfully', () => {
		const basicInfo = getBasicInfo('big');
	  	const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;
	  	const high = 5;
	  	const low = 1;

	  	let nums = [];
	  	_.times(100, (index) => {
	  		nums.push(BankService.getDecisionInfo(basicInfo));
	  	});

	  	_.every(nums, (amountToExtract) => {
		  	amountToExtract.should.be.a.Number();
		  	amountToExtract.should.be.above(low);
		  	amountToExtract.should.be.below(high);
	  	});

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


