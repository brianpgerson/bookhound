const ROLE_NORMAL = require('./constants').ROLE_NORMAL;
const ROLE_ADMIN = require('./constants').ROLE_ADMIN;
const AuthController = require('./controllers/authentication');
const _ = require('lodash');

exports.addUserToReq = function addUserToReq(req, res, next) {
   AuthController.me(req).then(function (currentUser) {
    req.currentUser = _.pick(currentUser, ['_id', 'email', 'profile']);
    next();
   });
};


// Set user info from request
exports.setUserInfo = function setUserInfo(request) {
  const getUserInfo = {
    _id: request._id,
    firstName: request.profile.firstName,
    lastName: request.profile.lastName,
    email: request.email,
    role: request.role
  };

  return getUserInfo;
};



exports.getRole = function getRole(checkRole) {
  let role;

  switch (checkRole) {
    case ROLE_ADMIN: role = 2; break;
    case ROLE_NORMAL: role = 1; break;
    default: role = 1;
  }

  return role;
};
