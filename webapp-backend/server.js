const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const DailyLog = require('./models/DailyLog');
const HealthData = require('./models/HealthKitData');

const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Sign up endpoint
// Sign up endpoint
app.post('/api/signup', async (req, res) => {
    try {
      const { username, firstName, lastName, email, password, dateOfBirth, country, stateProvince } = req.body;
  
      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
  
      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create new user
      const user = new User({
        username,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        dateOfBirth,
        country,
        stateProvince
      });
  
      await user.save();
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(201).json({ token, firstName: user.firstName });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  });

// Password update endpoint
app.post('/api/update-password', authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update password and timestamp
      user.password = newHashedPassword;
      user.passwordUpdatedAt = new Date();
      await user.save();
  
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating password', error: error.message });
    }
  });
  
// Login endpoint
// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Find user by username instead of email
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.json({ token, firstName: user.firstName });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  });

// Protected dashboard endpoint
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

// Get daily log for specific date
app.get('/api/daily-log/:date', authenticateToken, async (req, res) => {
  try {
    const log = await DailyLog.findOne({
      userId: req.user.userId,
      date: new Date(req.params.date)
    });
    res.json(log || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching log' });
  }
});

// Save daily log
app.post('/api/daily-log', authenticateToken, async (req, res) => {
  try {
    const existingLog = await DailyLog.findOne({
      userId: req.user.userId,
      date: new Date(req.body.date)
    });

    if (existingLog) {
      Object.assign(existingLog, req.body);
      await existingLog.save();
      res.json(existingLog);
    } else {
      const newLog = new DailyLog({
        userId: req.user.userId,
        ...req.body
      });
      await newLog.save();
      res.json(newLog);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving log' });
  }
});

// Sending health data to database
app.post('/api/submit-health-data', async (req, res) => {
  try {
    const {
      username,
      timestamp,
      stepCount,
      distanceWalkingRunning,
      restingEnergy,
      activeEnergy,
      flightsClimbed,
      heartRate,
      restingHeartRate,
      walkingHeartRateAvg,
      bodyTemperature,
      bloodPressureDiastolic,
      bloodPressureSystolic,
      hoursOfSleep
    } = req.body;

    if (!username || !timestamp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const healthData = new HealthData({
      username,
      timestamp,
      stepCount,
      distanceWalkingRunning,
      restingEnergy,
      activeEnergy,
      flightsClimbed,
      heartRate,
      restingHeartRate,
      walkingHeartRateAvg,
      bodyTemperature,
      bloodPressureDiastolic,
      bloodPressureSystolic,
      hoursOfSleep
    });

    await healthData.save();
    res.status(201).json({ message: 'Health data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving health data', error: error.message });
  }
});

// Get all health data for a user
app.get('/api/user/:username/health-data', async (req, res) => {
  try {
    const { username } = req.params;

    const data = await HealthData.find({ username }).sort({ timestamp: -1 }); // newest first
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health data', error: error.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));