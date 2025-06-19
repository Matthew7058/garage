const bcrypt = require('bcrypt');
const {
  fetchUserByEmail,
  insertUser
} = require('../models/users-model');

// POST /api/auth/signup
exports.signUp = (req, res, next) => {
  const { garage_id, first_name, last_name, email, phone, password } = req.body;

  // 1) Make sure email isn't taken
  fetchUserByEmail(email)
    .then((user) => {
      console.log(user);
      if(user.role === 'customer') {
        return Promise.reject({ status: 409, msg: 'Email already in use' });
      }
    })
    .catch((err) => {
      if (err.status !== 404) throw err;
      // 2) Hash the password
      return bcrypt.hash(password, 10);
    })
    .then((hash) => {
      // 3) Insert new user with hashed password
      return insertUser({
        garage_id,
        first_name,
        last_name,
        email,
        phone,
        password_hash: hash,
        role: 'customer'
      });
    })
    .then((newUser) => {
      // strip out the hash before returning
      const { password_hash, ...safeUser } = newUser;
      res.status(201).send({ user: safeUser });
    })
    .catch(next);
};

// POST /api/auth/login
exports.logIn = (req, res, next) => {
  const { email, password } = req.body;

  let loadedUser;
  fetchUserByEmail(email)
    .then((user) => {
      loadedUser = user;
      // 1) Compare passwords
      return bcrypt.compare(password, user.password_hash);
    })
    .then((isValid) => {
      if (!isValid) return Promise.reject({ status: 401, msg: 'Invalid credentials' });
      const { password_hash, ...safeUser } = loadedUser;
      res.status(200).send({ user: safeUser });
    })
    .catch(next);
};