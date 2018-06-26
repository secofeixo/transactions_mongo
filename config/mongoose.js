const configDB = require('./database'),
  mongoose = require('mongoose'),
  logger = require('../app/controllers/log.controller.js');

// Create mongodb connection
mongoose.Promise = global.Promise;

mongoose.main_conn = mongoose.createConnection(configDB.url);

logger.info('Create mongo connection');

mongoose.main_conn.on('error', err => {
  if (err) {
    throw new Error('Could not connect with MongoDB database. goldenspear');
  }
});


module.exports = mongoose;
