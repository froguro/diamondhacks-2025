import React, { useState } from 'react';
import { TextField, Grid, Box, Typography, Button } from '@mui/material';

function LogSection({ selectedDate, onClose, initialData }) {
  const [logData, setLogData] = useState({
    stepCount: initialData?.stepCount || '',
    distanceWalked: initialData?.distanceWalked || '',
    restingEnergy: initialData?.restingEnergy || '',
    activeEnergy: initialData?.activeEnergy || '',
    flightsClimbed: initialData?.flightsClimbed || '',
    heartRate: initialData?.heartRate || '',
    restingHeartRate: initialData?.restingHeartRate || '',
    walkingHeartRateAvg: initialData?.walkingHeartRateAvg || '',
    bodyTemperature: initialData?.bodyTemperature || '',
    bloodPressureDiastolic: initialData?.bloodPressureDiastolic || '',
    bloodPressureSystolic: initialData?.bloodPressureSystolic || '',
    hoursOfSleep: initialData?.hoursOfSleep || ''
  });

  const handleChange = (e) => {
    setLogData({
      ...logData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveLog = async () => {
    try {
      const response = await fetch('https://diamondhacks-2025.onrender.com/api/daily-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...logData,
          date: selectedDate.format('YYYY-MM-DD')
        })
      });
      
      const data = await response.json();
      if (data._id) {
        alert('Log saved successfully!');
        onClose(); // Close the section after successful save
      } else {
        throw new Error('Failed to save log');
      }
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Error saving log');
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Logging Stats
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Step Count"
            name="stepCount"
            value={logData.stepCount}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Distance Walked (km)"
            name="distanceWalked"
            value={logData.distanceWalked}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Resting Energy"
            name="restingEnergy"
            value={logData.restingEnergy}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Active Energy"
            name="activeEnergy"
            value={logData.activeEnergy}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Flights Climbed"
            name="flightsClimbed"
            value={logData.flightsClimbed}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Heart Rate"
            name="heartRate"
            value={logData.heartRate}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Resting Heart Rate"
            name="restingHeartRate"
            value={logData.restingHeartRate}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Walking Heart Rate Average"
            name="walkingHeartRateAvg"
            value={logData.walkingHeartRateAvg}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Body Temperature (°C)"
            name="bodyTemperature"
            value={logData.bodyTemperature}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Blood Pressure Diastolic"
            name="bloodPressureDiastolic"
            value={logData.bloodPressureDiastolic}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Blood Pressure Systolic"
            name="bloodPressureSystolic"
            value={logData.bloodPressureSystolic}
            onChange={handleChange}
            type="number"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Hours of Sleep"
            name="hoursOfSleep"
            value={logData.hoursOfSleep}
            onChange={handleChange}
            type="number"
            />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveLog}
        >
          Save Log
        </Button>
      </Box>
    </Box>
  );
}

export default LogSection;