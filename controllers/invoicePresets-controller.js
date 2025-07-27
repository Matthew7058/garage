const {
  fetchAllPresets,
  fetchPresetById,
  insertPreset,
  updatePreset,
  removePreset,
  insertPresetItem,
  updatePresetItem,
  removePresetItem,
  fetchPresetsByBranch,
  fetchJobSheetByBookingId,
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
 * (The body may now include: vin, mileage, technician, booking_id)
 */
exports.postInvoicePreset = (req, res, next) => {
  insertPreset(req.body)
    .then(preset => res.status(201).send({ preset }))
    .catch(next);
};

/**
 * PATCH /api/invoice-presets/:id
 * Body: { branch_id?, name?, category?, active? }
 * (The body may now include: vin, mileage, technician, booking_id)
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

// --- job‑sheet response helpers ---
function sendJobSheetArray(res, arr, status = 200) {
  res.status(status).send({ job_sheets: arr });
}
function sendJobSheetSingle(res, sheet, status = 200) {
  res.status(status).send({ job_sheet: sheet });
}


/** ---------------- Job‑Sheets (category = 'jobsheet') -------------- */

// GET /api/job-sheets            -> list all job‑sheets (optional branch_id, includeInactive)
exports.getJobSheets = (req, res, next) => {
  const { branch_id, includeInactive } = req.query;
  fetchAllPresets({
    branch_id: branch_id ? Number(branch_id) : undefined,
    includeInactive: includeInactive !== 'false'
  })
    .then(presets => {
      const jobSheets = presets.filter(
        p => (p.category || '').toLowerCase() === 'jobsheet'
      );
      sendJobSheetArray(res, jobSheets);
    })
    .catch(next);
};

// GET /api/job-sheets/:id
exports.getJobSheetById = (req, res, next) => {
  fetchPresetById(req.params.id)
    .then(preset => sendJobSheetSingle(res, preset))
    .catch(next);
};

// GET /api/job-sheets/booking/:booking_id
exports.getJobSheetByBookingId = (req, res, next) => {
  const { booking_id } = req.params;
  fetchJobSheetByBookingId(booking_id)
    .then(preset => sendJobSheetSingle(res, preset))
    .catch(next);
};

// POST /api/job-sheets
exports.postJobSheet = (req, res, next) => {
  insertPreset(req.body)
    .then(preset => sendJobSheetSingle(res, preset, 201))
    .catch(next);
};

// PATCH /api/job-sheets/:id
exports.patchJobSheet = (req, res, next) => {
  updatePreset(req.params.id, req.body)
    .then(updated => sendJobSheetSingle(res, updated))
    .catch(next);
};

// DELETE /api/job-sheets/:id
exports.deleteJobSheet = (req, res, next) => {
  removePreset(req.params.id)
    .then(deleted => sendJobSheetSingle(res, deleted))
    .catch(next);
};

// Items – reuse existing handlers   (/api/job-sheets/:id/items etc.)
exports.postJobSheetItem   = exports.postInvoicePresetItem;
exports.patchJobSheetItem  = exports.patchInvoicePresetItem;
exports.deleteJobSheetItem = exports.deleteInvoicePresetItem;