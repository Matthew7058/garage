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
const bookingTypesController = require('./controllers/bookingTypes-controller');
const bookingsController = require('./controllers/bookings-controller');

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

// Operating Hours endpoints
app.get('/api/operating-hours', operatingHoursController.getOperatingHours);
app.get('/api/operating-hours/branch/:branch_id', operatingHoursController.getOperatingHoursByBranch);
app.get('/api/operating-hours/:id', operatingHoursController.getOperatingHourById);
app.post('/api/operating-hours', operatingHoursController.postOperatingHour);
app.patch('/api/operating-hours/:id', operatingHoursController.patchOperatingHour);
app.delete('/api/operating-hours/:id', operatingHoursController.deleteOperatingHour);

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