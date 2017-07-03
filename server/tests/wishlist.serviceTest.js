const should = require('should');
const sinon = require('sinon');
const Bluebird = require('bluebird');
require('sinon-as-promised')(Bluebird);
const _ = require('lodash');
const testWishlistData = require('./testWishlistData');
const WishlistService = Bluebird.promisifyAll(require('../services/wishlist.service'));
const Preference = require('../models/preferences');
const ZincService = require('zinc-fetch');

describe('The wishlist service', () => {

	afterEach(() => {
		sinon.restore(Preference.findOne);
		sinon.restore(ZincService.product.getPrices);
	});

  	it('should have a thing?', () => {
    	should.exist(WishlistService.refreshWishlistItemPrices);
  	});

  	it('should find the cheapest thing', (done) => {
  		var prefsStub = sinon.stub(Preference, 'findOne');
  		prefsStub.resolves(testWishlistData.simplePrefs);

  		var zincStub = sinon.stub(ZincService.product, 'getPrices');
  		zincStub.resolves(testWishlistData.zincResponseCheap);

  		WishlistService
  			.refreshWishlistItemPrices(testWishlistData.simpleWishlist, {_id: '589aad7579da9f3afbec6f25'})
  			.then(wishlist => {
  				var price = wishlist.items[0].price;
  				should.exist(wishlist);
  				should.equal(147, price)
  				done();
  			});
	});

	it('should find the cheapest thing when prices are high', (done) => {
  		var prefsStub = sinon.stub(Preference, 'findOne');
  		prefsStub.resolves(testWishlistData.simplePrefs);

  		var zincStub = sinon.stub(ZincService.product, 'getPrices');
  		zincStub.resolves(testWishlistData.zincResponseNotCheap);

  		WishlistService
  			.refreshWishlistItemPrices(testWishlistData.simpleWishlist, {_id: '589aad7579da9f3afbec6f25'})
  			.then(wishlist => {
  				var price = wishlist.items[0].price;
  				should.exist(wishlist);
  				should.equal(10000, price)
  				done();
  			});
	});

	it('should find the cheapest thing when shipping is high', (done) => {
  		var prefsStub = sinon.stub(Preference, 'findOne');
  		prefsStub.resolves(testWishlistData.simplePrefs);

  		var zincStub = sinon.stub(ZincService.product, 'getPrices');
  		zincStub.resolves(testWishlistData.zincResponseBadShipping);

  		WishlistService
  			.refreshWishlistItemPrices(testWishlistData.simpleWishlist, {_id: '589aad7579da9f3afbec6f25'})
  			.then(wishlist => {
  				var price = wishlist.items[0].price;
  				should.exist(wishlist);
  				should.equal(2000, price)
  				done();
  			});
	});

	it('should not find anything if the prefs do not allow for it', (done) => {
  		var prefsStub = sinon.stub(Preference, 'findOne');
  		prefsStub.resolves(testWishlistData.newOnly);

  		var zincStub = sinon.stub(ZincService.product, 'getPrices');
  		zincStub.resolves(testWishlistData.zincResponseNotCheap);

  		WishlistService
  			.refreshWishlistItemPrices(testWishlistData.simpleWishlist, {_id: '589aad7579da9f3afbec6f25'})
  			.then(wishlist => {
  				should.exist(wishlist);
  				should.equal(wishlist.items[0].unavailable, true);
  				done();
  			});
	});
});
