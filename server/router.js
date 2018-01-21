const AuthenticationController = require('./controllers/authentication.controller'),
             AddressController = require('./controllers/address.controller'),
                UserController = require('./controllers/user.controller'),
            WishlistController = require('./controllers/wishlist.controller'),
                       helpers = require('./helpers'),
                BankController = require('./controllers/bank.controller'),
                       express = require('express'),
                          path = require('path'),
               passportService = require('./config/passport'),
                      passport = require('passport'),
                   ROLE_NORMAL = require('./constants').ROLE_NORMAL,
                    ROLE_ADMIN = require('./constants').ROLE_ADMIN;

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });
const addUserToReq = helpers.addUserToReq;
const addPopulatedUserToReq = helpers.addPopulatedUserToReq;

module.exports = function(app) {
    // Initializing route groups
    const apiRoutes = express.Router(),
         authRoutes = express.Router(),
        clientRoute = express.Router(),
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
  setupRoutes.get('/user', requireAuth, addPopulatedUserToReq, UserController.getSetup);

  setupRoutes.post('/address', requireAuth, addUserToReq, AddressController.saveAddress);
  setupRoutes.put('/address', requireAuth, addUserToReq, AddressController.updateAddress);

  setupRoutes.post('/wishlist', requireAuth, addPopulatedUserToReq, WishlistController.saveWishlist);
  setupRoutes.put('/wishlist', requireAuth, addPopulatedUserToReq, WishlistController.updateWishlist);
  setupRoutes.put('/wishlist/refresh', requireAuth, addPopulatedUserToReq, WishlistController.refreshWishlistItems);

  setupRoutes.post('/exchange-token', requireAuth, addUserToReq, BankController.exchange);
  setupRoutes.get('/plaid', requireAuth, BankController.getPlaidConfig);

  //=========================
  // User Routes
  //=========================

  // Set url for API group routes
  app.use('/api', apiRoutes);

  app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../client', 'index.html'));
});
};
