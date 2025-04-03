module.exports = [
    // Midtown Branch (branch_id = 1): Monday to Friday, 7:00 AM - 5:00 PM, capacity 4 per hour.
    { branch_id: 1, day_of_week: 1, open_time: "07:00", close_time: "17:00", capacity_per_hour: 4 },
    { branch_id: 1, day_of_week: 2, open_time: "07:00", close_time: "17:00", capacity_per_hour: 4 },
    { branch_id: 1, day_of_week: 3, open_time: "07:00", close_time: "17:00", capacity_per_hour: 4 },
    { branch_id: 1, day_of_week: 4, open_time: "07:00", close_time: "17:00", capacity_per_hour: 4 },
    { branch_id: 1, day_of_week: 5, open_time: "07:00", close_time: "17:00", capacity_per_hour: 4 },
    
    // Suburban Branch (branch_id = 2): Monday to Saturday, 08:00 AM - 4:00 PM, capacity 3 per hour.
    { branch_id: 2, day_of_week: 1, open_time: "08:00", close_time: "16:00", capacity_per_hour: 3 },
    { branch_id: 2, day_of_week: 2, open_time: "08:00", close_time: "16:00", capacity_per_hour: 3 },
    { branch_id: 2, day_of_week: 3, open_time: "08:00", close_time: "16:00", capacity_per_hour: 3 },
    { branch_id: 2, day_of_week: 4, open_time: "08:00", close_time: "16:00", capacity_per_hour: 3 },
    { branch_id: 2, day_of_week: 5, open_time: "08:00", close_time: "16:00", capacity_per_hour: 3 },
    { branch_id: 2, day_of_week: 6, open_time: "08:00", close_time: "16:00", capacity_per_hour: 3 },
    
    // Eastside Branch (branch_id = 3): Tuesday to Sunday, 09:00 AM - 6:00 PM, capacity 5 per hour.
    { branch_id: 3, day_of_week: 2, open_time: "09:00", close_time: "18:00", capacity_per_hour: 5 },
    { branch_id: 3, day_of_week: 3, open_time: "09:00", close_time: "18:00", capacity_per_hour: 5 },
    { branch_id: 3, day_of_week: 4, open_time: "09:00", close_time: "18:00", capacity_per_hour: 5 },
    { branch_id: 3, day_of_week: 5, open_time: "09:00", close_time: "18:00", capacity_per_hour: 5 },
    { branch_id: 3, day_of_week: 6, open_time: "09:00", close_time: "18:00", capacity_per_hour: 5 },
    { branch_id: 3, day_of_week: 7, open_time: "09:00", close_time: "18:00", capacity_per_hour: 5 }
  ];