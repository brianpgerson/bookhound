const AuthenticationController = require('./controllers/authentication'),
      AddressController = require('./controllers/address'),
      UserController = require('./controllers/user');
      WishlistController = require('./controllers/wishlist'),
      BankController = require('./controllers/bank'),
      express = require('express'),
      passportService = require('./config/passport'),
      passport = require('passport'),
      ROLE_NORMAL = require('./constants').ROLE_NORMAL,
      ROLE_ADMIN = require('./constants').ROLE_ADMIN;

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  // Initializing route groups
  const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        setupRoutes = express.Router(),
        bankRoutes = express.Router();

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
  setupRoutes.post('/address', requireAuth, AddressController.saveAddress);
  setupRoutes.post('/wishlist', requireAuth, WishlistController.saveWishlist);
  setupRoutes.post('/exchange-token', requireAuth, BankController.exchange);
  setupRoutes.get('/plaid', requireAuth, BankController.getPlaidConfig);
  setupRoutes.get('/user', requireAuth, UserController.getSetup);

  //=========================
  // User Routes
  //=========================

  // Set url for API group routes
  app.use('/api', apiRoutes);

  // Test protected route
  apiRoutes.get('/protected', requireAuth, (req, res) => {
    res.send({ content: 'The protected test route is functional!' });
  });




};
