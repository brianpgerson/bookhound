import axios from 'axios';
import cookie from 'react-cookie';
import {API_URL, CLIENT_ROOT_URL} from '../constants/constants';
import { receiveError } from './error-actions';
import {SAVE_ADDRESS,
        SAVE_WISHLIST,
        RECEIVE_USER_SETUP,
        RECEIVE_PLAID_CONFIG } from './types';

function getToken() {
  return {headers: { 'Authorization': cookie.load('token')}};
};

export function getPlaidConfig() {
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
}

export function exchangeToken(tokenMetadata) {
  const jwt = getToken();
  return function(dispatch) {
    axios.post(`${API_URL}/setup/exchange-token`, tokenMetadata, jwt).then(response => {
    }).catch(error =>{
      console.log(error);
      receiveError(dispatch, error);
    })
  }
}

export function getUserSetup() {
  const jwt = getToken();
  return function(dispatch) {
    axios.get(`${API_URL}/setup/user`, jwt).then(response => {
      dispatch({
        type: RECEIVE_USER_SETUP,
        payload: response.data
      });
    }).catch(error => {
      console.log(error);
      receiveError(dispatch, error);
    })
  }
}

export function saveAddress(addressFields) {
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

export function updateAddress(addressFields) {
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

export function saveWishlist(wishlistUrl) {
  const jwt = getToken();
  return function(dispatch) {
      axios.post(`${API_URL}/setup/wishlist`, wishlistUrl, jwt)
      .then(response => {
        dispatch({
          type: SAVE_WISHLIST,
          payload: response.data
        });
      })
      .catch((error) => {
        console.log(error);
        receiveError(dispatch, error);
      });
    }
  };

export function refreshWishlistItems(wishlistUrl) {
  const jwt = getToken();
  return function(dispatch) {
      axios.put(`${API_URL}/setup/wishlist`, wishlistUrl, jwt)
      .then(response => {
        dispatch({
          type: SAVE_WISHLIST,
          payload: response.data
        });
      })
      .catch((error) => {
        console.log(error);
        receiveError(dispatch, error);
      });
    }
}

export function updateWishlist(wishlistUrl) {
  const jwt = getToken();
  return function(dispatch) {
      axios.put(`${API_URL}/setup/wishlist`, wishlistUrl, jwt)
      .then(response => {
        dispatch({
          type: SAVE_WISHLIST,
          payload: response.data
        });
      })
      .catch((error) => {
        console.log(error);
        receiveError(dispatch, error);
      });
    }
  };
