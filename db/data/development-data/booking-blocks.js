// /__tests__/data/hoursOverrideData.js
module.exports = [
  // Branch 1: closed all day on 2025-08-02 for staff training
  {
    branch_id: 1,
    date: "2025-08-02",
    start_time: '10:00',
    end_time: '12:00',
    daily_capacity: 0,
    reason: null, // use template capacity_per_hour
    reason: "Staff training",
  },

  // Branch 1: shortened hours on 2025-08-15, only open 10–14 with capacity 8
  {
    branch_id: 1,
    date: "2025-08-02",
    start_time: '10:00',
    end_time: '12:00',
    daily_capacity: 0,
    reason: null, // use template capacity_per_hour
    reason: "Staff training",
  },

  // Branch 2: capacity boost to 25 on 2025-09-01 for end-of-summer rush
  {
    branch_id: 2,
    date: "2025-08-02",
    start_time: '9:00',
    end_time: '12:00',
    daily_capacity: 0,
    reason: null, // use template capacity_per_hour
    reason: "Staff training",
  }
];