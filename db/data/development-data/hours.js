module.exports = [
    // Downtown Branch (branch_id = 1): Monday to Friday, 8 AM - 6 PM, capacity 5 per hour.
    { branch_id: 1, day_of_week: 1, open_time: "08:00", close_time: "18:00", capacity_per_hour: 5 },
    { branch_id: 1, day_of_week: 2, open_time: "08:00", close_time: "18:00", capacity_per_hour: 5 },
    { branch_id: 1, day_of_week: 3, open_time: "08:00", close_time: "18:00", capacity_per_hour: 5 },
    { branch_id: 1, day_of_week: 4, open_time: "08:00", close_time: "18:00", capacity_per_hour: 5 },
    { branch_id: 1, day_of_week: 5, open_time: "08:00", close_time: "18:00", capacity_per_hour: 5 },
    // Uptown Branch (branch_id = 2): Monday to Saturday, 9 AM - 5 PM, capacity 3 per hour.
    { branch_id: 2, day_of_week: 1, open_time: "09:00", close_time: "17:00", capacity_per_hour: 3 },
    { branch_id: 2, day_of_week: 2, open_time: "09:00", close_time: "17:00", capacity_per_hour: 3 },
    { branch_id: 2, day_of_week: 3, open_time: "09:00", close_time: "17:00", capacity_per_hour: 3 },
    { branch_id: 2, day_of_week: 4, open_time: "09:00", close_time: "17:00", capacity_per_hour: 3 },
    { branch_id: 2, day_of_week: 5, open_time: "09:00", close_time: "17:00", capacity_per_hour: 3 },
    { branch_id: 2, day_of_week: 6, open_time: "09:00", close_time: "17:00", capacity_per_hour: 3 },
    // Central Branch (branch_id = 3): Tuesday to Saturday, 10 AM - 7 PM, capacity 4 per hour.
    { branch_id: 3, day_of_week: 2, open_time: "10:00", close_time: "19:00", capacity_per_hour: 4 },
    { branch_id: 3, day_of_week: 3, open_time: "10:00", close_time: "19:00", capacity_per_hour: 4 },
    { branch_id: 3, day_of_week: 4, open_time: "10:00", close_time: "19:00", capacity_per_hour: 4 },
    { branch_id: 3, day_of_week: 5, open_time: "10:00", close_time: "19:00", capacity_per_hour: 4 },
    { branch_id: 3, day_of_week: 6, open_time: "10:00", close_time: "19:00", capacity_per_hour: 4 },
  ]