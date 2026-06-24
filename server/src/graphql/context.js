const passport = require('passport');

function createContext({ req }) {
  return new Promise((resolve) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      resolve({ user: user || null, req });
    })(req, {}, () => {});
  });
}

module.exports = { createContext };
