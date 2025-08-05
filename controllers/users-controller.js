const {
    fetchAllUsers,
    fetchUserById,
    insertUser,
    updateUser,
    removeUser,
  } = require('../models/users-model');
  
  exports.getUsers = (req, res, next) => {
    fetchAllUsers()
      .then((users) => res.status(200).send({ users }))
      .catch(next);
  };
  
  exports.getUserById = (req, res, next) => {
    const { id } = req.params;
    fetchUserById(id)
      .then((user) => res.status(200).send({ user }))
      .catch(next);
  };
  
  exports.postUser = (req, res, next) => {
    const { garage_id, first_name, last_name, email, phone, password_hash, role, address, postcode } = req.body;
    insertUser({ garage_id, first_name, last_name, email, phone, password_hash, role, address, postcode })
      .then((newUser) => res.status(201).send({ user: newUser }))
      .catch(next);
  };
  
  exports.patchUser = (req, res, next) => {
    const { id } = req.params;
    const { garage_id, first_name, last_name, email, phone, password_hash, role, address, postcode } = req.body;
    updateUser(id, { garage_id, first_name, last_name, email, phone, password_hash, role, address, postcode })
      .then((updatedUser) => res.status(200).send({ user: updatedUser }))
      .catch(next);
  };
  
  exports.deleteUser = (req, res, next) => {
    const { id } = req.params;
    removeUser(id)
      .then((deletedUser) => res.status(200).send({ user: deletedUser }))
      .catch(next);
  };

  /**
   * Check if a user already exists for the given garage and details.
   * If found, return the existing user (200).
   * Otherwise create a new "customer" user and return it (201).
   * Expects: { garage_id, first_name, last_name, email, phone, address, postcode }
   */
  exports.checkOrCreateUser = (req, res, next) => {
    const {
      garage_id,
      first_name,
      last_name,
      email,
      phone,
      address,
      postcode
    } = req.body;

    fetchAllUsers()
      .then((users) => {
        const existing = (users || []).find(
          (u) =>
            u.garage_id === garage_id &&
            u.first_name === first_name &&
            u.last_name === last_name &&
            u.email === email &&
            u.phone === phone
        );

        if (existing) {
          return res.status(200).send({ user: existing });
        }

        // Default role for customer‑created records
        const role = 'customer';

        return insertUser({
          garage_id,
          first_name,
          last_name,
          email,
          phone,
          role,
          address,
          postcode
        }).then((newUser) => {
          res.status(201).send({ user: newUser });
        });
      })
      .catch(next);
  };