// /__tests__/data/hoursOverrideData.js
module.exports = [
  // Branch 1: closed all day on 2025-08-02 for staff training
  {
    branch_id: 1,
    date: "2025-08-02",
    is_closed: true,
    open_time: null,
    close_time: null,
    capacity_per_hour: null,
    daily_capacity: null,
    reason: "Staff training",
  },

  // Branch 1: shortened hours on 2025-08-15, only open 10–14 with capacity 8
  {
    branch_id: 1,
    date: "2025-08-15",
    is_closed: false,
    open_time: "10:00",
    close_time: "14:00",
    capacity_per_hour: 2,
    daily_capacity: 8,
    reason: "Inventory audit",
  },

  // Branch 2: capacity boost to 25 on 2025-09-01 for end-of-summer rush
  {
    branch_id: 2,
    date: "2025-09-01",
    is_closed: false,
    open_time: null,
    close_time: null,
    capacity_per_hour: 2,
    daily_capacity: 25,
    reason: "Summer rush capacity increase",
  },

  // Branch 3: holiday closure on Christmas
  {
    branch_id: 3,
    date: "2025-12-25",
    is_closed: true,
    open_time: null,
    close_time: null,
    capacity_per_hour: null,
    daily_capacity: null,
    reason: "Christmas Day",
  },

  // Branch 3: half-day early close on New Year's Eve
  {
    branch_id: 3,
    date: "2025-12-31",
    is_closed: false,
    open_time: null,      // use template open_time
    close_time: "12:00",
    capacity_per_hour: 2,
    daily_capacity: 10,   // reduced capacity
    reason: "New Year’s Eve early close",
  },
];