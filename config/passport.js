// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
const User = require('../app/models/user'),
    logger = require('../app/controllers/log.controller'),
    ctrlEmail = require('../app/controllers/email.controller'),
    ctrlToken = require('../app/controllers/token.controller');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // serialize the user for the session
    passport.serializeUser(function(user, done) {
        logger.info('passport serializeUser');
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        logger.info('passport deserializeUser');
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // ***************************************************************
    // SIGNUP
    // ***************************************************************
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    (req, email, password, done) => {
		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'email' :  email }, (err, user) => {
            logger.info(`passport local-signup ${err}`);
            logger.info(`passport local-signup ${JSON.stringify(user)}`);
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, {msg: 'That email is already taken.'});
            } else {
                // create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.email    = email;
                newUser.password = newUser.generateHash(password); // use the generateHash function in our user model
                newUser.verified = false;

				// save the user
                newUser.save((err) =>{
                    if (err)
                        throw err;

                    const token = ctrlToken.createToken(newUser);
                    logger.info(`passport local-signup. token validate email: ${token}`);
                    ctrlEmail.sendEmailValidateEmail(newUser, token);

                    return done(null, newUser);
                });
            }

        });

    }));

    // ***************************************************************
    // LOGIN
    // ***************************************************************
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    (req, email, password, done) => { // callback with email and password from our form
        logger.info('passport local-login');

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'email' :  email }, (err, user) => {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, { msg: 'No user found.'}); // req.flash is the way to set flashdata using connect-flash

            if (!user.verified) {
                return done(null, false, { msg: 'Email not validated.'}); // req.flash is the way to set flashdata using connect-flash                
            }

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, {msg: 'Oops! Wrong password.'}); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

};
