import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import authReducer from './auth_reducer';
import errorReducer from './error_reducer';
import setupReducer from './setup_reducer';
import bankReducer from './bank_reducer';
import modalReducer from './modal_reducer';

const rootReducer = combineReducers({
  auth: authReducer,
  form: formReducer,
  error: errorReducer,
  setup: setupReducer,
  modal: modalReducer,
  bank: bankReducer
});

export default rootReducer;
