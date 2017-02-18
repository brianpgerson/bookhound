'use strict'

const Promise = require('bluebird'),
      zincKey = require('../config/main').zinc,
        fetch = require('node-fetch'),
         auth = 'Basic ' + new Buffer(zincKey + ':').toString('base64');
fetch.Promise = Promise;

function _request(method, path, data) {
    data = JSON.stringify(data);

    const reqOptions = {
        method: method,
        headers: {
          'Authorization': auth,
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    if (!!data) {
        reqOptions.body = data;
    }

    return fetch(path, reqOptions)
            .then(res => res.json())
            .then(json => json);
}

function post(path, data) {
    return _request('POST', path, data);
}

function get(path, data) {
    return _request('GET', path, data);
}

function del(path, data) {
    return _request('DELETE', path, data);
}

module.exports = {
    orders: {
        create: function (data) {
            return post('https://api.zinc.io/v1/orders', data);
        },
        retrieve: function(order_id) {
            return get('https://api.zinc.io/v1/orders/' + order_id, {});
        },
        cancel: function(order_id) {
            return post('https://api.zinc.io/v1/orders/' + order_id + '/cancellation', requestParams);
        }
    },
    product: {
        getPrices: (product) => {
            return get(`https://api.zinc.io/v1/products/${product.productId}/offers?retailer=amazon`);
        }
    }
};
