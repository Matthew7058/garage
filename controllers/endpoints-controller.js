const { getEndpoints } = require('../models/endpoints-model.js');

  exports.getEndpoints = (req, res, next) => {
    getEndpoints().then((endpoints) => {
      res.status(200).send({ endpoints });
    });
  };