const jwt = require('jwt-simple'),
	moment = require('moment'),
	config = require('../../config/token.js');

function createToken(user) {
  const payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, "days").unix(),
  };
  return jwt.encode(payload, config.tokenSecret);
};

module.exports = {
	createToken
}