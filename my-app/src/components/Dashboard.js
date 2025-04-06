import React, { useState } from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Button, Box, Typography } from '@mui/material';
import Navbar from './Navbar';
import LogSection from './LogSection';  // Add this import

function Dashboard() {
  const [value, setValue] = useState(dayjs());
  const [showLogSection, setShowLogSection] = useState(false);
  const [logData, setLogData] = useState(null);
  const firstName = localStorage.getItem('firstName') || 'User';

  const fetchDailyLog = async (date) => {
    try {
      const response = await fetch(`http://localhost:3001/api/daily-log/${date.format('YYYY-MM-DD')}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLogData(data);
    } catch (error) {
      console.error('Error fetching log:', error);
      setLogData(null);
    }
  };

  const handleDateChange = (newValue) => {
    setValue(newValue);
    setShowLogSection(false);
    fetchDailyLog(newValue);
  };

  const handleLogStats = async () => {
    await fetchDailyLog(value); // Fetch data for the selected date
    setShowLogSection(true);
  };

  const handleImportStats = () => {
    // TODO: Implement import stats functionality
    console.log('Importing stats for:', value.format('YYYY-MM-DD'));
  };

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <Typography variant="h4" sx={{ mb: 4 }}>
          Welcome, {firstName}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar 
              value={value} 
              onChange={handleDateChange} 
            />
          </LocalizationProvider>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleLogStats}
            >
              Log Stats
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleImportStats}
            >
              Import Stats
            </Button>
          </Box>

          {showLogSection && (
            <LogSection 
              selectedDate={value} 
              onClose={() => setShowLogSection(false)}
              initialData={logData}
            />
          )}
        </Box>
      </div>
    </>
  );
}

export default Dashboard;