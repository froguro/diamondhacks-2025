import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Button, Box, Typography } from '@mui/material';
import Navbar from './Navbar';
import LogSection from './LogSection';

function Dashboard() {
  const [value, setValue] = useState(dayjs());
  const [showLogSection, setShowLogSection] = useState(false);
  const [logData, setLogData] = useState(null);
  const firstName = localStorage.getItem('firstName') || 'User';
  const isMobile = /iPhone|Android/i.test(navigator.userAgent);
  const [showMessage, setShowMessage] = useState(false);
  const [polling, setPolling] = useState(false);
  const [loading, setLoading] = useState(false); // New state for button loading
  const pollIntervalRef = useRef(null); // Ref to store the polling interval
  const username = localStorage.getItem('username');

  const checkForNewHealthData = async () => {
    try {
      const response = await fetch('https://diamondhacks-2025.onrender.com/api/check-health-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: value.format('YYYY-MM-DD'),
          username: username,
        }),
      });

      const data = await response.json();
      if (data.dataImported) {
        setPolling(false); // Stop polling
        clearInterval(pollIntervalRef.current); // Clear the interval
        setLoading(false); // Stop the loading indicator
        await fetchDailyLog(value); // Fetch the daily log
        setShowLogSection(true); // Show the log section
      }
    } catch (error) {
      console.error('Error checking health data:', error);
      setPolling(false); // Stop polling on error
      clearInterval(pollIntervalRef.current);
      setLoading(false); // Stop the loading indicator
    }
  };

  const handleImportStats = () => {
    setLoading(true); // Start the loading indicator
    setPolling(true); // Start polling

    // Start polling for new health data
    pollIntervalRef.current = setInterval(() => {
      if (polling) {
        checkForNewHealthData();
      } else {
        clearInterval(pollIntervalRef.current);
      }
    }, 3000); // Check every 3 seconds

    // Stop polling after 2 minutes if no data is found
    setTimeout(() => {
      setPolling(false);
      clearInterval(pollIntervalRef.current);
      setLoading(false); // Stop the loading indicator
    }, 120000);
  };

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      setPolling(false);
      clearInterval(pollIntervalRef.current);
    };
  }, []);

  const fetchDailyLog = async (date) => {
    try {
      const response = await fetch(`https://diamondhacks-2025.onrender.com/api/daily-log/${date.format('YYYY-MM-DD')}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
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
          {showMessage && (
              <Typography sx={{ color: 'red', textAlign: 'center' }}>
                Please open this link on your phone to launch the app.
              </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleLogStats}
              sx={{ backgroundColor: '#f87060' }}
            >
              Log Stats
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleImportStats}
              disabled={loading} // Disable the button while loading
              sx={{ backgroundColor: '#f87060' }}
            >
              {loading ? 'Importing...' : 'Import Stats'} {/* Show loading text */}
            </Button>
            <Button
              variant="contained"
              color="info"
              sx={{ backgroundColor: '#f87060' }}
            >
              Ask AI About Your Stats
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
