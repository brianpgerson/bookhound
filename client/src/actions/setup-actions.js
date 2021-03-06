import axios from 'axios';
import * as _ from 'lodash';
import cookie from 'react-cookie';
import { browserHistory } from 'react-router';
import {API_URL} from '../constants/constants';
import { receiveError } from './error-actions';
import {SAVE_ADDRESS,
        SAVE_WISHLIST,
        WISHLIST_UPDATING,
        UNAUTH_USER,
        RECEIVE_USER_SETUP,
        SHOW_PURCHASES } from './types';

function getToken () {
  return {headers: { 'Authorization': cookie.load('token')}};
};

function startSavingWishlist () {
  return {
    type: WISHLIST_UPDATING,
    payload: true
  };
};

function receiveWishlist (wishlist) {
  return {
    type: SAVE_WISHLIST,
    payload: wishlist
  };
};

function endSavingWishlist () {
  return {
    type: WISHLIST_UPDATING,
    payload: false
  };
};

export function setShowPurchases(doShow) {
  return (dispatch) => {
    dispatch({
      type: SHOW_PURCHASES,
      payload: doShow
    });
  }; 
};

export function getUserSetup () {
  const jwt = getToken();
  return function(dispatch) {
    axios.get(`${API_URL}/setup/user`, jwt).then(response => {
      dispatch({
        type: RECEIVE_USER_SETUP,
        payload: response.data
      });
    }).catch(error => {
      if (_.get(error, 'response.status') === 401) {
        dispatch({ type: UNAUTH_USER });
        browserHistory.push('/login');
      } else {
        console.error(error);
        receiveError(dispatch, error);
      }
    });
  }
};

export function saveAddress (addressFields) {
  const jwt = getToken();
  return function(dispatch) {
      axios.post(`${API_URL}/setup/address`, addressFields, jwt)
      .then(response => {
        dispatch({
        	type: SAVE_ADDRESS,
        	payload: response.data.address
        });
      })
      .catch((error) => {
        console.error(error);
        receiveError(dispatch, error);
      });
    }
};

export function updateAddress (addressFields) {
  const jwt = getToken();
  return function(dispatch) {
      axios.put(`${API_URL}/setup/address`, addressFields, jwt)
      .then(response => {
        dispatch({
          type: SAVE_ADDRESS,
          payload: response.data.address
        });
      })
      .catch((error) => {
        console.error(error);
        receiveError(dispatch, error);
      });
    }
};

export function saveWishlist (wishlistUrl) {
  const jwt = getToken();
  return function(dispatch) {
      dispatch(startSavingWishlist());
      axios.post(`${API_URL}/setup/wishlist`, wishlistUrl, jwt)
      .then(response => {
        dispatch(receiveWishlist(response.data));
        dispatch(endSavingWishlist());
      })
      .catch((error) => {
        console.error(error);
        receiveError(dispatch, error);
      });
    }
};

export function refreshWishlistItems (wishlistUrl) {
  const jwt = getToken();
  return function(dispatch) {
      dispatch(startSavingWishlist());
      axios.put(`${API_URL}/setup/wishlist/refresh`, {}, jwt)
      .then(response => {
        dispatch(receiveWishlist(response.data));
        dispatch(endSavingWishlist());
      })
      .catch((error) => {
        console.error(error);
        receiveError(dispatch, error);
      });
    }
};

export function updateWishlist (wishlistUrl) {
  const jwt = getToken();
  return function(dispatch) {
      dispatch(startSavingWishlist());
      axios.put(`${API_URL}/setup/wishlist`, wishlistUrl, jwt)
      .then(response => {
        dispatch(receiveWishlist(response.data));
        dispatch(endSavingWishlist());
      })
      .catch((error) => {
        console.error(error);
        receiveError(dispatch, error);
      });
    }
};
