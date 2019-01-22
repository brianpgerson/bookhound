import axios from 'axios';
import cookie from 'react-cookie';
import {API_URL} from '../constants/constants';
import { receiveError } from './error-actions';
import { AUTH_USER,
         RESET_PASSWORD_COMPLETE,
         FORGOT_PASSWORD_REQUEST,
         ERROR,
         PROTECTED_TEST,
         UNAUTH_USER } from './types';

export function loginUser({ email, password }) {
  return function(dispatch) {
    return axios.post(`${API_URL}/auth/login`, { email, password })
    .then(response => {
      cookie.save('token', response.data.token, { path: '/' });
      dispatch({ type: AUTH_USER });
    })
    .catch((error) => {
      receiveError(dispatch, error.response, ERROR)
    });
    }
  }

export function registerUser({ email, firstName, lastName, password }) {
  return function(dispatch) {
    return axios.post(`${API_URL}/auth/register`, { email, firstName, lastName, password })
    .then(response => {
      cookie.save('token', response.data.token, { path: '/' });
      dispatch({ type: AUTH_USER });
    })
    .catch((error) => {
      receiveError(dispatch, error.response, ERROR)
    });
  }
}

export function logoutUser() {
  return function (dispatch) {
    dispatch({ type: UNAUTH_USER });
    cookie.remove('token', { path: '/' });
  }
}

export function getForgotPasswordToken({ email }) {
  return function (dispatch) {
    return axios.post(`${API_URL}/auth/forgot-password`, { email })
    .then((response) => {
      dispatch({
        type: FORGOT_PASSWORD_REQUEST,
        payload: response.data.success,
      });
    })
    .catch((error) => {
      receiveError(dispatch, error.response, ERROR);
    });
  };
}

export function resetPassword(token, { password }) {
  return function (dispatch) {
    return axios.post(`${API_URL}/auth/reset-password/${token}`, { password })
    .then((response) => {
      dispatch({
        type: RESET_PASSWORD_COMPLETE,
        payload: {
          success: true
        },
      });
    })
    .catch((error) => {
      receiveError(dispatch, error.response, ERROR);
      dispatch({
        type: RESET_PASSWORD_COMPLETE,
        payload: {
          success: false
        },
      });
    });
  };
}


export function protectedTest() {
  return function(dispatch) {
    axios.get(`${API_URL}/protected`, {
      headers: { 'Authorization': cookie.load('token') }
    })
    .then(response => {
      dispatch({
        type: PROTECTED_TEST,
        payload: response.data.content
      });
    })
    .catch((error) => {
      receiveError(dispatch, error.response, ERROR)
    });
  }
}
