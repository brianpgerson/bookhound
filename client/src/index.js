import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { Router, browserHistory } from 'react-router';
import reduxThunk from 'redux-thunk';
import routes from './routes';
import reducers from './reducers/index';
import cookie from 'react-cookie';
import { AUTH_USER } from './actions/types';

import './public/stylesheets/base.scss';

const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore);
const store = createStoreWithMiddleware(reducers);

const token = cookie.load('token');

if (token) {
  	store.dispatch({ type: AUTH_USER });
}

ReactDOM.render(
  	<Provider store={store}>
    	<Router history={browserHistory} routes={routes} />
  	</Provider>,
  	document.querySelector('.wrapper'));
