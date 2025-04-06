const mongoose = require('mongoose');

const HealthKitDataSchema = new mongoose.Schema({
  username: String,
  timestamp: Number,
  date: Date,

  // Metrics
  stepCount: Number,
  distanceWalkingRunning: Number,
  restingEnergy: Number,
  activeEnergy: Number,
  flightsClimbed: Number,

  heartRate: Number,
  restingHeartRate: Number,
  walkingHeartRateAvg: Number,

  bodyTemperature: Number,
  bloodPressureDiastolic: Number,
  bloodPressureSystolic: Number,

  hoursOfSleep: Number
});

module.exports = mongoose.model('HealthKitData', HealthKitDataSchema);
