'use strict';

const Promise = require('bluebird'),
      fetch = Promise.promisifyAll(require('fetch'));

module.exports = function (zincKey, options) {
  const defaults = options || {};

  const auth = 'Basic ' + new Buffer(zincKey + ':').toString('base64');

  function _request(method, path, data, callback) {
    data = JSON.stringify(data);

    const reqOptions = {
      method: method,
      headers: {
        'Authorization': auth,
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    return fetch(path, reqOptions)
      .then(res => res.json())
      .then(json => return json);
  }

  function post(path, data, callback) {
    _request('POST', path, data, callback);
  }

  function get(path, data, callback) {
    _request('GET', path, data, callback);
  }

  function del(path, data, callback) {
    _request('DELETE', path, data, callback);
  }

  function normalizeArguments() {
    var args = arguments[0];
    if(typeof args[0] == 'object' && typeof args[1] == 'function' && !args[2])
      return { count: args[0].count, offset: args[0].offset, cb: args[1] };
    else
      return { count: args[0], offset: args[1], cb: args[2] };
  }

  return {
    orders: {
      create: function (data, cb) {
        post('/v1/orders', data, cb);
      },
      retrieve: function(order_id, cb) {
        if(!(order_id && typeof order_id === 'string')) {
          cb('order_id required');
        }
        get('/v1/orders/' + order_id, {}, cb);
      },
      cancel: function(order_id, cb) {
        var requestParams = {};
        if(!(order_id && typeof order_id === 'string')) {
          cb('order_id required');
        }
        post('/v1/orders/' + order_id + '/cancellation', requestParams, cb);
      }
    }
  };
}
