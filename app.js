require('cross-fetch/polyfill');

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Import controllers

const endpointsController = require('./controllers/endpoints-controller');
const garageChainsController = require('./controllers/garageChains-controller');
const branchesController = require('./controllers/branches-controller');
const usersController = require('./controllers/users-controller');
const operatingHoursController = require('./controllers/operatingHours-controller');
const operatingHoursOverrideController = require('./controllers/operatingHoursOverride-controller');
const bookingTypesController = require('./controllers/bookingTypes-controller');
const bookingsController = require('./controllers/bookings-controller');
const bookingBlocksController = require('./controllers/bookingBlocks-controller');
const invoicePresetsController = require('./controllers/invoicePresets-controller');
const authController = require('./controllers/auth-controller');
const { getMotHistory } = require('./controllers/motHistory-controller');
const confirmationEmailRouter = require('./controllers/resend-controller');

// API Documentation endpoint
app.get('/api', endpointsController.getEndpoints);

// Garage Chains endpoints
app.get('/api/garage-chains', garageChainsController.getGarageChains);
app.get('/api/garage-chains/:id', garageChainsController.getGarageChainById);
app.post('/api/garage-chains', garageChainsController.postGarageChain);
app.patch('/api/garage-chains/:id', garageChainsController.patchGarageChain);
app.delete('/api/garage-chains/:id', garageChainsController.deleteGarageChain);
app.get('/api/garage-chains/:chain_id/branches', branchesController.getBranchesByChain);

// Branches endpoints
app.get('/api/branches', branchesController.getBranches);
app.get('/api/branches/:id', branchesController.getBranchById);
app.post('/api/branches', branchesController.postBranch);
app.patch('/api/branches/:id', branchesController.patchBranch);
app.delete('/api/branches/:id', branchesController.deleteBranch);

// Users endpoints
app.get('/api/users', usersController.getUsers);
app.get('/api/users/:id', usersController.getUserById);
app.post('/api/users', usersController.postUser);
app.patch('/api/users/:id', usersController.patchUser);
app.delete('/api/users/:id', usersController.deleteUser);

// Authentication endpoints
app.post('/api/auth/signup', authController.signUp);
app.post('/api/auth/login',  authController.logIn);

// new MOT-history endpoint:
app.get('/api/mot-history/:vrn', getMotHistory);

// Resend email endpoint mounted under /api
app.use('/api', confirmationEmailRouter);

// Operating Hours endpoints
app.get('/api/operating-hours', operatingHoursController.getOperatingHours);
app.get('/api/operating-hours/branch/:branch_id', operatingHoursController.getOperatingHoursByBranch);
app.get('/api/operating-hours/:id', operatingHoursController.getOperatingHourById);
app.post('/api/operating-hours', operatingHoursController.postOperatingHour);
app.patch('/api/operating-hours/:id', operatingHoursController.patchOperatingHour);

app.delete('/api/operating-hours/:id', operatingHoursController.deleteOperatingHour);

// Operating Hours Override endpoints
app.get('/api/operating-hours-override', operatingHoursOverrideController.getAllOverrides);
app.post('/api/operating-hours-override', operatingHoursOverrideController.postOverride);
app.get('/api/operating-hours-override/:id', operatingHoursOverrideController.getOverrideById);
app.patch('/api/operating-hours-override/:id', operatingHoursOverrideController.patchOverride);
app.delete('/api/operating-hours-override/:id', operatingHoursOverrideController.deleteOverride);
app.get(
  '/api/branches/:branch_id/operating-hours-override/:date',
  operatingHoursOverrideController.getOverridesByBranchDate
);

// Booking Types endpoints
app.get('/api/booking-types', bookingTypesController.getBookingTypes);
app.get('/api/booking-types/branch/:branch_id', bookingTypesController.getBookingTypesByBranch);
app.get('/api/booking-types/:id', bookingTypesController.getBookingTypeById);
app.post('/api/booking-types', bookingTypesController.postBookingType);
app.patch('/api/booking-types/:id', bookingTypesController.patchBookingType);
app.delete('/api/booking-types/:id', bookingTypesController.deleteBookingType);

// Bookings endpoints
app.get('/api/bookings', bookingsController.getBookings);
app.get('/api/bookings/branch/:branch_id/date/:date', bookingsController.getBookingsByBranchAndDate);
app.get('/api/bookings/branch/:branch_id', bookingsController.getBookingsByBranch);
app.get('/api/bookings/:id', bookingsController.getBookingById);
app.post('/api/bookings', bookingsController.postBooking);
app.patch('/api/bookings/:id', bookingsController.patchBooking);
app.delete('/api/bookings/:id', bookingsController.deleteBooking);
app.get('/api/bookings/user/email/:email', bookingsController.getBookingsByUserEmail);
app.get('/api/bookings/user/search/:name', bookingsController.searchBookingsByUserName);

// Booking Blocks endpoints
// (order matters: put specific routes before the generic :id)
app.get('/api/booking-blocks/branch/:branch_id/date/:date', bookingBlocksController.getBlocksByBranchAndDate);
app.get('/api/booking-blocks', bookingBlocksController.getAllBlocks);
app.get('/api/booking-blocks/:id', bookingBlocksController.getBlockById);
app.post('/api/booking-blocks', bookingBlocksController.postBlock);
app.patch('/api/booking-blocks/:id', bookingBlocksController.patchBlock);
app.delete('/api/booking-blocks/:id', bookingBlocksController.deleteBlock);

// Invoice Presets endpoints
// Presets
app.get('/api/invoice-presets',                 invoicePresetsController.getInvoicePresets);
// By Branch
app.get('/api/invoice-presets/branch/:branch_id', invoicePresetsController.getInvoicePresetsByBranch);
app.get('/api/invoice-presets/:id',                 invoicePresetsController.getInvoicePresetById);
app.post('/api/invoice-presets',                invoicePresetsController.postInvoicePreset);
app.patch('/api/invoice-presets/:id',           invoicePresetsController.patchInvoicePreset);
app.delete('/api/invoice-presets/:id',          invoicePresetsController.deleteInvoicePreset);

// Preset Items
app.post('/api/invoice-presets/:id/items',      invoicePresetsController.postInvoicePresetItem);
app.patch('/api/invoice-presets/items/:item_id',invoicePresetsController.patchInvoicePresetItem);
app.delete('/api/invoice-presets/items/:item_id',invoicePresetsController.deleteInvoicePresetItem);


// Job Sheets endpoints  ── same controller, category forced to "jobsheet"
app.get   ('/api/job-sheets',                     invoicePresetsController.getJobSheets);
app.get   ('/api/job-sheets/booking/:booking_id', invoicePresetsController.getJobSheetByBookingId);
app.get   ('/api/job-sheets/:id',                 invoicePresetsController.getJobSheetById);
app.post  ('/api/job-sheets',                     invoicePresetsController.postJobSheet);
app.patch ('/api/job-sheets/:id',                 invoicePresetsController.patchJobSheet);
app.delete('/api/job-sheets/:id',                 invoicePresetsController.deleteJobSheet);

// 404 error for any undefined route
app.all('*', (req, res) => {
  res.status(404).send({ msg: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  if (err.status && err.msg) res.status(err.status).send({ msg: err.msg });
  else {
    console.error(err);
    res.status(500).send({ msg: 'Internal Server Error' });
    }
});

module.exports = app;