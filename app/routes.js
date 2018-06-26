// app/routes.js
const ctrlTransactions = require('./controllers/transaction.controller.js'),
	ctrlUser = require('./controllers/user.controller'),
	ctrlLogin = require('./controllers/login.controller');

module.exports = function(app, passport) {

	// process the login form
	app.post('/login', (req, res, next) => {
		passport.authenticate('local-login', (err, user, info) => {
			ctrlLogin.login(req, res, err, user, info);
		})(req, res, next);
	});

	app.get('/login', (req, res) => {
		isLoggedIn(req, res, () => {
			res.status(200).json({msg: 'user logged in'});
		});
	})

	// *************************************
	// SIGNUP
	// *************************************
	// process the signup form
	app.post('/signup', (req, res, next) => {
		passport.authenticate('local-signup', (err, user, info) => {
			ctrlLogin.signup(req, res, err, user, info);
		})(req, res, next);
	});

	// *************************************
	// PROFILE/TRANSLATE
	// *************************************

	app.get('/profile', isLoggedIn, ctrlUser.getProfile)
	
	// verify the profile
	app.get('/verifyProfile', ctrlUser.verifyProfile)

	app.get('/renewtoken/:email', ctrlUser.renewTokenValidateEmail)

	// protected in order to be logged in
	app.get('/user/:id/balance', isLoggedIn, ctrlUser.getBalance);

	app.post('/user/:id/transfer/:amount/to/:user', isLoggedIn, ctrlTransactions.transfer);

	// *************************************
	// LOGOUT
	// *************************************
	app.get('/logout', ctrlLogin.logout);
};

// route middleware to make sure
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) {
		if (req.user.verified) {
			return next();
		}
	}
	// if they aren't redirect them to the home page
	// res.status(401).json({msg: 'User not login in'});
  res.status(404).json({
    msg : 'User not logged in',
  });
}
