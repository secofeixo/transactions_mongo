// controller to make log not using console, only in console
const winston = require('winston')

winston.emitErrs = true;

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp: true,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
module.exports.stream = {
  write(message) {
    logger.info(message);
  },
};
