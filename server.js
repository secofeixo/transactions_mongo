// server.js

// set up ======================================================================
// get all the tools we need
const express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  mongoose = require('./config/mongoose'),
  passport = require('passport'),
  flash = require('connect-flash'),
  session = require('express-session'),
  SessionMongoStore = require('connect-mongo')(session),
  helmet = require('helmet'),
  bodyParser = require('body-parser'),
  compression = require('compression'),
  methodOverride = require('method-override'),
  path = require('path'),
  configDB = require('./config/database.js'),
  logger = require('./app/controllers/log.controller.js');

// configuration ===============================================================

const oneDay = 1000 * 60 * 60 * 24;
const sessionOptions = {
  secret: 'ultrasecrettoken',
  name: 'sessionId',
  cookie: { maxAge: oneDay },
  resave: false,
  saveUninitialized: true,
  store: new SessionMongoStore({ mongooseConnection: mongoose.main_conn }),
};

app.use(helmet({ hsts: false }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));
// app.use(fileUpload());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ msg: 'Malformed JSON' });
  }
  return next();
});

app.use(compression());
app.use(methodOverride());
app.use(express.static(path.resolve('./public')));
app.use(require('morgan')('combined', { stream: logger.stream }));

app.use(session(sessionOptions));

// app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
require('./config/passport')(passport); // pass passport for configuration

app.use(passport.initialize());
app.use(passport.session());
// app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
logger.info('server listening on port ' + port);
