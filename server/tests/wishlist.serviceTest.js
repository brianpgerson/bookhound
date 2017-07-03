const should = require('should');
const sinon = require('sinon');
const Promise = require('bluebird');
require('sinon-as-promised')(Promise);
const _ = require('lodash');
const testWishlistData = require('./testWishlistData');
const config = require('../config/main');
const WishlistItem = require('../models/wishlist-item');
const proxyquire = require('proxyquire');
let zincStub =  { product: {} };
let simpleWishlist;

const WishlistService = proxyquire('../services/wishlist.service', { 'zinc-fetch': () => zincStub });

describe('The wishlist service', () => {
  before(() => {
    simpleWishlist = _.cloneDeep(testWishlistData.simpleWishlist);
    simpleWishlist.items = _.map(simpleWishlist.items, (item) => {
      return new WishlistItem({
            _creator: 'blahblahblah',
            productId: item.productId,
            title: item.title,
            link: item.link,
            price: item.price,
            shipping: item.shipping
        });
    });
  });

	it('should have a thing?', () => {
  	should.exist(WishlistService.refreshWishlistItemPrices);
	});

	it('should find the cheapest thing', (done) => {
	  zincStub.product.getPrices = () => new Promise((resolve) => {
      return resolve(testWishlistData.zincResponseCheap);   
    });


		WishlistService
			.refreshWishlistItemPrices(simpleWishlist)
			.then(items => {
				var item = items[0]
        var price = item.price;
				should.exist(item);
				should.equal(147, price)
				done();
			});
	});

	it('should find the cheapest thing when prices are high', (done) => {
  		zincStub.product.getPrices = () => new Promise((resolve) => {
        return resolve(testWishlistData.zincResponseNotCheap);   
      });

  		WishlistService
  			.refreshWishlistItemPrices(simpleWishlist)
  			.then(items => {
  				var item = items[0]
          var price = item.price;
  				should.exist(item);
  				should.equal(10000, price)
  				done();
  			});
	});

	it('should find the cheapest thing when shipping is high', (done) => {
      zincStub.product.getPrices = () => new Promise((resolve) => {
        return resolve(testWishlistData.zincResponseBadShipping);   
      });

  		WishlistService
  			.refreshWishlistItemPrices(simpleWishlist)
  			.then(items => {
  				var item = items[0]
          var price = item.price;
  				should.exist(item);
  				should.equal(2000, price)
  				done();
  			});
	});

	it('should not find anything if the prefs do not allow for it', (done) => {
      zincStub.product.getPrices = () => new Promise((resolve) => {
        return resolve(testWishlistData.zincResponseNotCheap);   
      });

      let wishlist = _.cloneDeep(simpleWishlist);
      wishlist.preferredConditions.used = false;

  		WishlistService
  			.refreshWishlistItemPrices(wishlist)
  			.then(results => {
  				should.exist(results);
  				should.equal(results[0].unavailable, true);
  				done();
  			});
	});
});
