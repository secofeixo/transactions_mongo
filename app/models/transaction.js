// app/models/sentence.js
// load the things we need
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// define the schema for our sentence model
const transactionSchema = Schema({
  source: Schema.ObjectId,
  destination: Schema.ObjectId,
  amount: Number,
  state: {
    type: String,
    enum: ['initial', 'pending', 'committed', 'done', 'canceled'],
    default: 'initial',
  }
});

// create the model for sentences and expose it to our app
module.exports = mongoose.main_conn.model('Transactions', transactionSchema);
