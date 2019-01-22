import { AUTH_USER, UNAUTH_USER, FORGOT_PASSWORD_REQUEST, RESET_PASSWORD_COMPLETE } from '../actions/types';

const INITIAL_STATE = { 
  message: '', 
  content: '', 
  authenticated: false,
  resetComplete: null,
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case AUTH_USER:
      return { ...state, authenticated: true };
    case UNAUTH_USER:
      return { ...state, authenticated: false };
    case FORGOT_PASSWORD_REQUEST:
      return { ...state, message: action.payload.message };
    case RESET_PASSWORD_COMPLETE:
      console.log(action);
      return { ...state, resetComplete: action.payload.success };
  }

  return state;
}
