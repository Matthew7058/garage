const {
    fetchAllGarageChains,
    fetchGarageChainById,
    insertGarageChain,
    updateGarageChain,
    removeGarageChain,
  } = require('../models/garageChains-model');
  
  exports.getGarageChains = (req, res, next) => {
    fetchAllGarageChains()
      .then((chains) => res.status(200).send({ chains }))
      .catch(next);
  };
  
  exports.getGarageChainById = (req, res, next) => {
    const { id } = req.params;
    fetchGarageChainById(id)
      .then((chain) => res.status(200).send({ chain }))
      .catch(next);
  };
  
  exports.postGarageChain = (req, res, next) => {
    const { name, contact } = req.body;
    insertGarageChain({ name, contact })
      .then((newChain) => res.status(201).send({ chain: newChain }))
      .catch(next);
  };
  
  exports.patchGarageChain = (req, res, next) => {
    const { id } = req.params;
    const { name, contact } = req.body;
    updateGarageChain(id, { name, contact })
      .then((updatedChain) => res.status(200).send({ chain: updatedChain }))
      .catch(next);
  };
  
  exports.deleteGarageChain = (req, res, next) => {
    const { id } = req.params;
    removeGarageChain(id)
      .then((deletedChain) => res.status(200).send({ chain: deletedChain }))
      .catch(next);
  };