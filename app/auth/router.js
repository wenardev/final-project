const router = require('express').Router();
const autoController = require('./controller');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({usernameField: 'email'}, autoController.localStrategy));
router.post('/register', autoController.register);
router.post('/login', autoController.login);
router.post('/logout', autoController.logout);
router.get('/me', autoController.me);

module.exports = router;