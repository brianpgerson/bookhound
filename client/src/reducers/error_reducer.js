import { ERROR, CLEAR_ERRORS } from '../actions/types';

const INITIAL_STATE = { message: '' };

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case ERROR:
      return { ...state, message: action.payload };
    case CLEAR_ERRORS:
      return { ...state, message: '' };
  }

  return state;
}
