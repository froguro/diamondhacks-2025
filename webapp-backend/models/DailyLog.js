const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  stepCount: { type: Number },
  distanceWalked: { type: Number },
  restingEnergy: { type: Number },
  activeEnergy: { type: Number },
  flightsClimbed: { type: Number },
  heartRate: { type: Number },
  restingHeartRate: { type: Number },
  walkingHeartRateAvg: { type: Number },
  bodyTemperature: { type: Number },
  bloodPressureDiastolic: { type: Number },
  bloodPressureSystolic: { type: Number },
  hoursOfSleep: { type: Number }
});

module.exports = mongoose.model('DailyLog', dailyLogSchema);