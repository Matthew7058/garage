const {
  fetchAllPresets,
  fetchPresetById,
  insertPreset,
  updatePreset,
  removePreset,
  insertPresetItem,
  updatePresetItem,
  removePresetItem,
  fetchPresetsByBranch
} = require('../models/invoicePresets-model');

/**
 * GET /api/invoice-presets
 * Optional query params: branch_id, includeInactive=false
 */
exports.getInvoicePresets = (req, res, next) => {
  const { branch_id, includeInactive } = req.query;
  fetchAllPresets({
    branch_id: branch_id ? Number(branch_id) : undefined,
    includeInactive: includeInactive !== 'false'
  })
    .then(presets => res.status(200).send({ presets }))
    .catch(next);
};

/**
 * GET /api/invoice-presets/:id
 */
exports.getInvoicePresetById = (req, res, next) => {
  fetchPresetById(req.params.id)
    .then(preset => res.status(200).send({ preset }))
    .catch(next);
};

/**
 * GET /api/invoice-presets/branch/:branch_id
 * Optional query param: includeInactive=false
 */
exports.getInvoicePresetsByBranch = (req, res, next) => {
  const { branch_id } = req.params;
  const { includeInactive } = req.query;

  if (!branch_id) {
    return res.status(400).send({ msg: 'branch_id is required' });
  }

  fetchPresetsByBranch(
    Number(branch_id),
    includeInactive !== 'false' // default true
  )
    .then((presets) => res.status(200).send({ presets }))
    .catch(next);
};

/**
 * POST /api/invoice-presets
 * Body: { branch_id, name, category?, active?, items?: [ ... ] }
 */
exports.postInvoicePreset = (req, res, next) => {
  insertPreset(req.body)
    .then(preset => res.status(201).send({ preset }))
    .catch(next);
};

/**
 * PATCH /api/invoice-presets/:id
 * Body: { branch_id?, name?, category?, active? }
 */
exports.patchInvoicePreset = (req, res, next) => {
  updatePreset(req.params.id, req.body)
    .then(updated => res.status(200).send({ preset: updated }))
    .catch(next);
};

/**
 * DELETE /api/invoice-presets/:id
 */
exports.deleteInvoicePreset = (req, res, next) => {
  removePreset(req.params.id)
    .then(deleted => res.status(200).send({ preset: deleted }))
    .catch(next);
};

/**
 * POST /api/invoice-presets/:id/items
 * Body: { type?, description?, quantity?, price?, vat_applies?, quantity_default? }
 */
exports.postInvoicePresetItem = (req, res, next) => {
  const preset_id = Number(req.params.id);
  insertPresetItem({ ...req.body, preset_id })
    .then(item => res.status(201).send({ item }))
    .catch(next);
};

/**
 * PATCH /api/invoice-presets/items/:item_id
 */
exports.patchInvoicePresetItem = (req, res, next) => {
  updatePresetItem(req.params.item_id, req.body)
    .then(item => res.status(200).send({ item }))
    .catch(next);
};

/**
 * DELETE /api/invoice-presets/items/:item_id
 */
exports.deleteInvoicePresetItem = (req, res, next) => {
  removePresetItem(req.params.item_id)
    .then(item => res.status(200).send({ item }))
    .catch(next);
};