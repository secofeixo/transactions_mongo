// app/models/user.js
// load the things we need
const mongoose = require('mongoose'),
    bcrypt   = require('bcrypt'),
    Schema = mongoose.Schema;

// define the schema for our user model
var userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  password: String,
  verified: {
    type: Boolean,
    default: false,
  },
  token: String,
  balance: {
    type: Number,
    default: 0
  },
  pendingTransactions: [ Schema.ObjectId ],
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.main_conn.model('User', userSchema);
