const should = require('should');
const _ = require('lodash');
const transactionParser = require('../controllers/transactionParser');

describe('The transaction parser', () => {
  	it('should have a thing?', () => {
    	should.exist(transactionParser.getBasicUserInfo);
  	});

  	it('should parse an extremely basic set of financial data', () => {
  		const basicInfo = getBasicInfo();
	  	const safeDelta = basicInfo.currentBalance - basicInfo.lowestRecentBalance;
	  	const high = safeDelta * 0.04;
	  	const low = safeDelta * 0.01;
	  	const amountToExtract = transactionParser.getDecisionInfo(basicInfo);

	  	(amountToExtract).should.be.a.Number();
	  	(amountToExtract).should.be.above(low);
	  	(amountToExtract).should.be.below(high);
	});
});

function getBasicInfo () {
	return {
  		currentBalance: 100,
  		lowestRecentBalance: 30,
  		oneYearBalances: getOneYearBalances(),
  		sortedTransactions: getSortedTransactions()
  	};
}

function getOneYearBalances () {
	return { currentBalance: 57.69,
			'2017-02-07': 57.69,
			'2017-02-06': 57.69,
			'2017-02-05': 57.69,
			'2017-02-04': 57.69,
			'2017-02-03': 57.69,
			'2017-02-02': 57.69,
			'2017-02-01': 57.69,
			'2017-01-31': 57.69,
			'2017-01-30': 57.69,
			'2017-01-29': 57.69,
			'2017-01-28': 57.69,
			'2017-01-27': 57.69,
			'2017-01-26': 57.69,
			'2017-01-25': 57.69,
			'2017-01-24': 57.69,
			'2017-01-23': 69.69,
			'2017-01-22': 69.69,
			'2017-01-21': 69.69,
			'2017-01-20': 69.69,
			'2017-01-19': 69.69,
			'2017-01-18': 69.69,
			'2017-01-17': 69.69,
			'2017-01-16': 69.69,
			'2017-01-15': 69.69,
			'2017-01-14': 69.69,
			'2017-01-13': 69.69,
			'2017-01-12': 69.69,
			'2017-01-11': 69.69,
			'2017-01-10': 19.69,
			'2017-01-09': 19.69,
			'2017-01-08': 19.69,
			'2017-01-07': 19.69,
			'2017-01-06': 19.69,
			'2017-01-05': 19.69,
			'2017-01-04': 25,
			'2017-01-03': 25,
			'2017-01-02': 25,
			'2017-01-01': 25,
			'2016-12-31': 25,
			'2016-12-30': 25,
			'2016-12-29': 25,
			'2016-12-28': 25,
			'2016-12-27': 25,
			'2016-12-26': 25,
			'2016-12-25': 25,
			'2016-12-24': 25,
			'2016-12-23': 25,
			'2016-12-22': 25,
			'2016-12-21': 25,
			'2016-12-20': 25,
			'2016-12-19': 25,
			'2016-12-18': 25,
			'2016-12-17': 25,
			'2016-12-16': 25,
			'2016-12-15': 25,
			'2016-12-14': 25,
			'2016-12-13': 25,
			'2016-12-12': 25,
			'2016-12-11': 25,
			'2016-12-10': 25,
			'2016-12-09': 25,
			'2016-12-08': 25,
			'2016-12-07': 25,
			'2016-12-06': 25,
			'2016-12-05': 25,
			'2016-12-04': 25,
			'2016-12-03': 25,
			'2016-12-02': 25,
			'2016-12-01': 25,
			'2016-11-30': 25,
			'2016-11-29': 25,
			'2016-11-28': 25,
			'2016-11-27': 25,
			'2016-11-26': 25,
			'2016-11-25': 25,
			'2016-11-24': 25,
			'2016-11-23': 25,
			'2016-11-22': 25,
			'2016-11-21': 25,
			'2016-11-20': 25,
			'2016-11-19': 25,
			'2016-11-18': 25,
			'2016-11-17': 25,
			'2016-11-16': 25,
			'2016-11-15': 25,
			'2016-11-14': 25,
			'2016-11-13': 25,
			'2016-11-12': 25,
			'2016-11-11': 25,
			'2016-11-10': 25,
			'2016-11-09': 25,
			'2016-11-08': 25,
			'2016-11-07': 25,
			'2016-11-06': 25,
			'2016-11-05': 25,
			'2016-11-04': 25,
			'2016-11-03': 25,
			'2016-11-02': 25,
			'2016-11-01': 25,
			'2016-10-31': 25,
			'2016-10-30': 25,
			'2016-10-29': 25,
	}
};

function getSortedTransactions() {
	return [
		{
			_account: 'YEnPdyD6QwF55JPJ9QQASJeRMJy3OoFrYNQ1e',
	        _id: 'RZnQeLVOoacrrN0NqXXLU6O5P5YnbmI8obgx6',
	        amount: -25,
	        date: '2016-10-28',
	        name: 'DEPOSIT ID NUMBER 720767',
     	},
     	{
     		_account: 'YEnPdyD6QwF55JPJ9QQASJeRMJy3OoFrYNQ1e',
	        _id: 'gE3Rv54yM0FggQJQ3MmpCOBeq0DeM5caAmd37',
	        _pendingTransaction: 'yM8gYwL0knu11zVz9qREFQ9MjOQqARU9wyJjK',
	        amount: 5.31,
	        date: '2017-01-04',
	        name: 'CKE*QUETZAL ITERNET SAN FRANCISCO CA 01/02',
	    },
     	{
     		_account: 'YEnPdyD6QwF55JPJ9QQASJeRMJy3OoFrYNQ1e',
	        _id: 'jEkergJM54FLLQ5Qb8VghQjL8Zk4aefmbOB3r',
	        _pendingTransaction: 'VEndeqwr5ZFJJNyNdZkvC6OmB31ndAuYk8zO8',
	        amount: -50,
	        date: '2017-01-10',
	        name: 'Online Transfer 5917898227 from cool ########4713 transaction #: 5917898227 01/10',
	    },
     	{
     		_account: 'YEnPdyD6QwF55JPJ9QQASJeRMJy3OoFrYNQ1e',
	   		_id: 'yM8gYwL0knu11zVz9qM7u180x8bMe5ULn0B9a',
   			amount: 12,
	   		date: '2017-01-23',
   			name: 'MONTHLY SERVICE FEE',
     	}
   	]
}

