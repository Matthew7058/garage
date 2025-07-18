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