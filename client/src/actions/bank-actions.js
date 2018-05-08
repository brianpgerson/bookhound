import axios from 'axios';
import * as _ from 'lodash';
import cookie from 'react-cookie';
import { browserHistory } from 'react-router';
import {API_URL, CLIENT_ROOT_URL} from '../constants/constants';
import { receiveError } from './error-actions';
import { getUserSetup } from './setup-actions';
import { RECEIVE_REFUND_CONFIRMATION,
         RECEIVE_PLAID_CONFIG } from './types';

function getToken () {
  return {headers: { 'Authorization': cookie.load('token')}};
};

function receiveRefund(response) {
    return {
        type: RECEIVE_REFUND_CONFIRMATION,
        payload: response.data
    }
}

export function initiateRefund (refund) {
    const jwt = getToken();
    return function(dispatch) {
        axios.post(`${API_URL}/bank/refund`, refund, jwt)
            .then(response => {
                dispatch(receiveRefund(response));
            }).catch(error =>{
                console.error(error);
                receiveError(dispatch, error);
            })
    }
}

export function getPlaidConfig () {
  const jwt = getToken();
  return function(dispatch) {
    axios.get(`${API_URL}/bank/plaid`, jwt)
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
    return axios.post(`${API_URL}/bank/exchange-token`, tokenMetadata, jwt).then(response => {
      // do something?
    }).catch(error =>{
      console.error(error);
      receiveError(dispatch, error);
    })
  }
};

