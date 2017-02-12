const AuthenticationController = require('./controllers/authentication.controller'),
      AddressController = require('./controllers/address.controller'),
      UserController = require('./controllers/user.controller'),
      WishlistController = require('./controllers/wishlist.controller'),
      helpers = require('./helpers'),
      BankController = require('./controllers/bank.controller'),
      express = require('express'),
      passportService = require('./config/passport'),
      passport = require('passport'),
      ROLE_NORMAL = require('./constants').ROLE_NORMAL,
      ROLE_ADMIN = require('./constants').ROLE_ADMIN;

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });
const addUserToReq = helpers.addUserToReq;

module.exports = function(app) {
  // Initializing route groups
  const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        setupRoutes = express.Router();

  //=========================
  // Auth Routes
  //=========================

  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/auth', authRoutes);

  // Registration route
  authRoutes.post('/register', AuthenticationController.register);

  // Login route
  authRoutes.post('/login', requireLogin, AuthenticationController.login);

  // Password reset request route (generate/send token)
  authRoutes.post('/forgot-password', AuthenticationController.forgotPassword);

  // Password reset route (change password using token)
  authRoutes.post('/reset-password/:token', AuthenticationController.verifyToken);

  //=========================
  // Signup Routes
  //=========================

  apiRoutes.use('/setup', setupRoutes);
  setupRoutes.post('/address', requireAuth, addUserToReq, AddressController.saveAddress);
  setupRoutes.put('/address', requireAuth, addUserToReq, AddressController.updateAddress);
  setupRoutes.post('/wishlist', requireAuth, addUserToReq, WishlistController.saveWishlist);
  setupRoutes.put('/wishlist', requireAuth, addUserToReq, WishlistController.updateWishlist);
  setupRoutes.post('/exchange-token', requireAuth, addUserToReq, BankController.exchange);
  setupRoutes.get('/plaid', requireAuth, BankController.getPlaidConfig);
  setupRoutes.get('/user', requireAuth, addUserToReq, UserController.getSetup);

  //=========================
  // User Routes
  //=========================

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
