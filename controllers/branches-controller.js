const {
    fetchAllBranches,
    fetchBranchById,
    insertBranch,
    updateBranch,
    removeBranch,
    fetchBranchesByChainId,
  } = require('../models/branches-model');
  
  exports.getBranches = (req, res, next) => {
    fetchAllBranches()
      .then((branches) => res.status(200).send({ branches }))
      .catch(next);
  };
  
  exports.getBranchById = (req, res, next) => {
    const { id } = req.params;
    fetchBranchById(id)
      .then((branch) => res.status(200).send({ branch }))
      .catch(next);
  };

  exports.getBranchesByChain = (req, res, next) => {
    const { chain_id } = req.params;
    fetchBranchesByChainId(chain_id)
      .then((branches) => res.status(200).send({ branches }))
      .catch(next);
  };
  
  exports.postBranch = (req, res, next) => {
    const { garage_id, branch_name, address, phone, email } = req.body;
    insertBranch({ garage_id, branch_name, address, phone, email })
      .then((newBranch) => res.status(201).send({ branch: newBranch }))
      .catch(next);
  };
  
  exports.patchBranch = (req, res, next) => {
    const { id } = req.params;
    const { garage_id, branch_name, address, phone, email } = req.body;
    updateBranch(id, { garage_id, branch_name, address, phone, email })
      .then((updatedBranch) => res.status(200).send({ branch: updatedBranch }))
      .catch(next);
  };
  
  exports.deleteBranch = (req, res, next) => {
    const { id } = req.params;
    removeBranch(id)
      .then((deletedBranch) => res.status(200).send({ branch: deletedBranch }))
      .catch(next);
  };