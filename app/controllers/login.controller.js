const logger = require('./log.controller.js'),
  configToken = require('../../config/token.js'),
  User = require('../models/user'),
  moment = require('moment'),
  jwt = require('jwt-simple');

function login(req, res, err, user, info) {

  const userid = user._id;
  logger.info(`login.controller.js. login. User: ${JSON.stringify(userid)}`);
  logger.info(`login.controller.js. login. info: ${JSON.stringify(info)}`);
  // res.status(200).json(req.user);
  if (err) { 
    return next(err); 
  }
  if (!user) {
    res.status(401).json(info)
    return;
  }
  req.logIn(user, (err) => {
    if (err) { 
      return next(err);
    }
    res.status(200).json(user);
  });
} // login

function logout(req, res) {
  logger.info(`login.controller.js. logout.`);
  req.logout();
  res.status(200).json({msg: 'user logged out'});
} // logout

function signup(req, res, err, user, info) {
  const userid = user._id;
  logger.info(`login.controller.js. signup. User: ${JSON.stringify(userid)}`);
  logger.info(`login.controller.js. signup. info: ${JSON.stringify(info)}`);
  // res.status(200).json(req.user);
  if (err) { 
    return next(err); 
  }
  if (!user) {
    res.status(401).json(info)
    return;
  }
  req.logIn(user, (err) => {
    if (err) { 
      return next(err);
    }
    res.status(200).json(user);
  });

}

module.exports = {
  login,
  logout,
  signup,
};
