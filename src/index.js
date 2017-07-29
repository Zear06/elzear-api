// @flow
import bodyParser from 'body-parser';
import express from 'express';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import session from 'express-session';
import { authLogin, authRegister, loginCallback, registerCallback } from './auth';
import health from './health';

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}
app.use(passport.initialize());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}
app.use(allowCrossDomain);
app.set('port', (process.env.PORT || 3001));


function generateToken(req, res, next) {
  const token = jwt.sign({
    id: req.user.id,
  }, 'server secret', {
    // expiresInMinutes: 120
  });

  res.status(200).json({
    user: req.user,
    token
  });
}

const authenticate = expressJwt({ secret: 'server secret' });

function authenticatae(req, res, next) {
  return authenticate(req, res, next);
}

function me(req, res) {
  return res.status(200).json(req.user);
}
app.get('/me', authenticatae, me);

app.get('/health', health);
app.post('/auth/:authType/login', authLogin);
app.get('/auth/:authType/login', authLogin);
app.post('/auth/:authType/login/callback', loginCallback);
app.get('/auth/:authType/login/callback', loginCallback);
app.post('/auth/:authType/register', authRegister);
app.get('/auth/:authType/register', authRegister);
app.get('/auth/:authType/register/callback', registerCallback);

// Error Handler
app.use((error, req, res, next) => {
  console.log('error', error);
  res.status(500).json({ error, message: error.message });
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});

export default app;
