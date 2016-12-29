import axios from 'axios';
import cookie from 'react-cookie';
import { receiveError } from './error-actions';
import { SAVE_ADDRESS, SAVE_WISHLIST } from './types';


const API_URL = 'http://localhost:3000/api';
const CLIENT_ROOT_URL = 'http://localhost:8080';

function getToken() {
  return cookie.load('token').slice(4);
};

export function saveAddress(addressFields) {
  const token = getToken();
  return function(dispatch) {
      axios.post(`${API_URL}/signup/address`, addressFields, {
        headers: { 'Authorization': token }
      })
      .then(response => {
        dispatch({
        	type: SAVE_ADDRESS,
        	payload: response.payload
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
      axios.post(`${API_URL}/signup/wishlist`, wishlistUrl, {
        headers: { 'Authorization': token }
      })
      .then(response => {
        dispatch({
          type: SAVE_WISHLIST,
          payload: response.payload
        });
        window.location.href = CLIENT_ROOT_URL;
      })
      .catch((error) => {
        console.log(error);
        receiveError(dispatch, error);
      });
    }
  };
