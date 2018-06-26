const logger = require('./log.controller.js'),
  nodemailer = require('nodemailer'),
  configEmail = require('../../config/email');

// const sendmailCfg = {
//   sendmail: true,
//   newline: 'unix',
//   path: '/usr/sbin/sendmail',
// };

const smtpCfg = {
  pool: true,
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use TLS
  auth: {
    user: configEmail.account,
    pass: configEmail.pwd,
  },
};

const transporter = nodemailer.createTransport(smtpCfg);

function sendEmailValidateEmail(user, token, next) {
  const mailOptions = {
    from: 'info <info@transactions_mongodb.com>',
    to: user.email,
    subject: 'Transactions in Mongodb. Email validation',
    text: `Click in the new link to validate your profile: http://localhost:8080/verifyProfile?token=${token}`,
    html: `Click in the new link to validate your profile: http://localhost:8080/verifyProfile?token=${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.info(`emailcontroller. sendEmailValidateEmail. Error: ${error}`);
    } else {
      logger.info(`emailcontroller. sendEmailValidateEmail. Message sent: ${info.response}`);
    }
  });
}

module.exports = {
  sendEmailValidateEmail,
};
