import axios from 'axios';
import * as _ from 'lodash';
import cookie from 'react-cookie';
import { browserHistory } from 'react-router';
import {API_URL, CLIENT_ROOT_URL} from '../constants/constants';
import { receiveError } from './error-actions';
import {SAVE_ADDRESS,
        SAVE_WISHLIST,
        WISHLIST_UPDATING,
        SAVE_PREFERENCES,
        UNAUTH_USER,
        RECEIVE_USER_SETUP,
        RECEIVE_PLAID_CONFIG } from './types';

function getToken () {
  return {headers: { 'Authorization': cookie.load('token')}};
};

function startSavingWishlist () {
  return {
    type: WISHLIST_UPDATING,
    payload: true
  };
}

function receiveWishlist (wishlist) {
  return {
    type: SAVE_WISHLIST,
    payload: wishlist
  };
}

function endSavingWishlist () {
  return {
    type: WISHLIST_UPDATING,
    payload: false
  };
}

export function getPlaidConfig () {
  const jwt = getToken();
  return function(dispatch) {
    axios.get(`${API_URL}/setup/plaid`, jwt)
    .then(response => {
      dispatch({
        type: RECEIVE_PLAID_CONFIG,
        payload: response.data
      });
    })
  }
};

export function exchangeToken (tokenMetadata) {
  const jwt = getToken();
  return function(dispatch) {
    axios.post(`${API_URL}/setup/exchange-token`, tokenMetadata, jwt).then(response => {
    }).catch(error =>{
      console.log(error);
      receiveError(dispatch, error);
    })
  }
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
        receiveError(dispatch, error);
      });
    }
};

export function refreshWishlistItems (wishlistUrl) {
  const jwt = getToken();
  return function(dispatch) {
      dispatch(startSavingWishlist());
      axios.put(`${API_URL}/setup/wishlist/refresh`, wishlistUrl, jwt)
      .then(response => {
        dispatch(receiveWishlist(response.data));
        dispatch(endSavingWishlist());
      })
      .catch((error) => {
        console.log(error);
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
        console.log(error);
        receiveError(dispatch, error);
      });
    }
};

export function updatePreferences (preferences) {
  const jwt = getToken();
  return function(dispatch) {
      axios.put(`${API_URL}/setup/preferences`, preferences, jwt)
      .then(response => {
        dispatch({
          type: SAVE_PREFERENCES,
          payload: response.data
        });
      })
      .catch((error) => {
        console.log(error);
        receiveError(dispatch, error);
      });
    }
}
