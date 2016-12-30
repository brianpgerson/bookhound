import axios from 'axios';
import cookie from 'react-cookie';
import { receiveError } from './error-actions';
import {SAVE_ADDRESS,
        SAVE_WISHLIST,
        RECEIVE_USER_SETUP,
        RECEIVE_PLAID_CONFIG } from './types';


const API_URL = 'http://localhost:3000/api';
const CLIENT_ROOT_URL = 'http://localhost:8080';

function getToken() {
  return cookie.load('token');
};

export function getPlaidConfig() {
  const token = getToken();
  return function(dispatch) {
    axios.get(`${API_URL}/setup/plaid`, {
        headers: { 'Authorization': token }
      })
    .then(response => {
      dispatch({
        type: RECEIVE_PLAID_CONFIG,
        payload: response.data
      });
    })
  }
}

export function exchangeToken(tokenMetadata) {
  const token = getToken();
  return function(dispatch) {
    axios.post(`${API_URL}/setup/exchange-token`, tokenMetadata, {
        headers: { 'Authorization': token }
    }).then(response => {
      debugger;
    }).catch(err =>{
      debugger;
    })
  }
}

export function getUserSetup() {
  const token = getToken();
  return function(dispatch) {
    axios.get(`${API_URL}/setup/user`, {
        headers: { 'Authorization': token }
    }).then(response => {
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
  const token = getToken();
  return function(dispatch) {
      axios.post(`${API_URL}/setup/address`, addressFields, {
        headers: { 'Authorization': token }
      })
      .then(response => {
        dispatch({
        	type: SAVE_ADDRESS,
        	payload: response.data.address
        });
        window.location.href = CLIENT_ROOT_URL + '/wishlist';
      })
      .catch((error) => {
        console.log(error);
        receiveError(dispatch, error);
      });
    }
  };

export function saveWishlist(wishlistUrl) {
  const token = getToken();
  return function(dispatch) {
      axios.post(`${API_URL}/setup/wishlist`, wishlistUrl, {
        headers: { 'Authorization': token }
      })
      .then(response => {
        dispatch({
          type: SAVE_WISHLIST,
          payload: response.payload
        });
        window.location.href = CLIENT_ROOT_URL + '/bank';
      })
      .catch((error) => {
        console.log(error);
        receiveError(dispatch, error);
      });
    }
  };
