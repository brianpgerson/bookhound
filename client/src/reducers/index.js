import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import authReducer from './auth_reducer';
import errorReducer from './error_reducer';
import setupReducer from './setup_reducer';

const rootReducer = combineReducers({
  auth: authReducer,
  form: formReducer,
  error: errorReducer,
  setup: setupReducer
});

export default rootReducer;
