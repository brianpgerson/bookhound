import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/app';
import NotFoundPage from './components/pages/not-found-page';

import HomePage from './components/pages/homepage';

// Import authentication related pages
import Login from './components/auth/login';
import Logout from './components/auth/logout';
import ForgotPassword from './components/auth/forgot-password';
import ResetPassword from './components/auth/reset-password';

import Register from './components/setup/register';
import Address from './components/setup/address';
import Wishlist from './components/setup/wishlist';
import Bank from './components/setup/bank';

import Dashboard from './components/dashboard';
import RequireAuth from './components/auth/require-auth';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="login" component={Login} />
    <Route path="logout" component={Logout} />
    <Route path="forgot-password" component={ForgotPassword} />
    <Route path="reset-password/:resetToken" component={ResetPassword} />
    <Route path="register" component={Register} />
    <Route path="address" component={RequireAuth(Address)} />
    <Route path="wishlist" component={RequireAuth(Wishlist)} />
    <Route path="bank" component={RequireAuth(Bank)} />
    <Route path="dashboard" component={RequireAuth(Dashboard)} />
    <Route path="*" component={NotFoundPage} />
  </Route>
);
