
const logger = require('./log.controller.js'),
  configToken = require('../../config/token.js'),
  User = require('../models/user'),
  moment = require('moment'),
  jwt = require('jwt-simple'),
  ctrlEmail = require('./email.controller'),
  ctrlToken = require('./token.controller');

function getProfile(req, res) {

  const userid = req.user._id;
  logger.info(`user.controller.js. getProfile. User in session: ${JSON.stringify(userid)}`);

  res.status(200).json({
    user : req.user, // get the user out of session and pass to template
  });
} // getProfile

function verifyProfile(req, res) {
  const token = req.query.token;
  if (!token) {
    res.status(400).json({msg: "token not set"});
    return;
  }
  var payload = jwt.decode(token, configToken.tokenSecret);
  logger.debug(`user.controller.js. verifyProfile. token: ${token}`);
  logger.debug(`user.controller.js. verifyProfile. payload: ${payload}`);
  
  if(payload.exp <= moment().unix()) {
     return res
      .status(401)
        .send({message: "token has expired"});
  }
  
  req.user = payload.sub;
  logger.debug(`user.controller.js. verifyProfile. payload: ${req.user}`);

  User.update({'_id': req.user},{'$set': {'verified': true}}).exec((err) => {
    if (err) {
      logger.error(`user.controller.js. verifyProfile. Error updating user validating email. ${sError}`);
      res.status(500).json({msg: 'Internal Error'});
      return;
    }

    res.status(200).json({msg: 'Account verified'});
  })
}

function renewTokenValidateEmail(req, res) {
  const sEmail = req.params.email;
  logger.info(`user.controller. renewTokenValidateEmail. email: ${sEmail}`);
  User.findOne({'email': sEmail}).exec((err, user) => {
    // if there are any errors, return the error before anything else
    if (err) {
      res.status(500).json({msg: 'internal error'});
      return;
    }

    // if no user is found, return the message
    if (!user) {
      res.status(404).json({msg: 'No user found'});
      return;
    }

    const token = ctrlToken.createToken(user);
    logger.info(`user.controller. renewTokenValidateEmail. token validate email: ${token}`);
    ctrlEmail.sendEmailValidateEmail(user, token);
    res.status(200).json({msg: 'Email with a link to validate your email has been sent'});
  });
}

function getBalance(req, res) {
  if (req.isAuthenticated()) {
    if (req.user.verified) {
      const sIdUser = req.params.id;
      if (sIdUser) {
        User.findOne({'_id': sIdUser}).exec((err,user) => {
          // if there are any errors, return the error before anything else
          if (err) {
            res.status(500).json({msg: 'internal error'});
            return;
          }

          // if no user is found, return the message
          if (!user) {
            res.status(404).json({msg: 'No user found'});
            return;
          }

          res.status(200).json({ balance: user.balance })
        })
        return;
      } else {
        res.status(404).json({ msg: 'Id of user not specified' });
        return;
      }
    }
  }

  res.status(200).json({ balance: req.user.balance });
}

async function getUser(idUser) {
  return new Promise (async (resolve, reject) => {
    let useObj;
    try {
      useObj = await User.findOne({'_id': idUser});
    } catch (err) {
      logger.debug(`user.controller. getUser. Error reading user source ${err}`);
      reject({ msg:'internal error reading user'});
      return;
    }

    if (!useObj) {
      logger.debug(`user.controller. getUser. User source not exists`);
      reject({msg: 'user does not exists'})
      return;
    }

    resolve(useObj);
  })
}



module.exports = {
  getProfile,
  verifyProfile,
  renewTokenValidateEmail,
  getBalance,
  getUser,
};
