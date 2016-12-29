import axios from 'axios';
import cookie from 'react-cookie';
import { receiveError } from './error-actions';
import { SAVE_ADDRESS,
         ERROR } from './types';


const API_URL = 'http://localhost:3000/api';
const CLIENT_ROOT_URL = 'http://localhost:8080';

export function saveAddress(addressFields) {
  const token = cookie.load('token').slice(4);
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
        receiveError(dispatch, error, ERROR);
      });
    }
  }
