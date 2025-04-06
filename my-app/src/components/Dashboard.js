import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Button, Box, Typography } from '@mui/material';
import Navbar from './Navbar';
import LogSection from './LogSection';  // Add this import
// Add Dialog imports at the top
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function Dashboard() {
  const [value, setValue] = useState(dayjs());
  const [showLogSection, setShowLogSection] = useState(false);
  const [logData, setLogData] = useState(null);
  const firstName = localStorage.getItem('firstName') || 'User';
  const isMobile = /iPhone|Android/i.test(navigator.userAgent);
  const [showMessage, setShowMessage] = useState(false);
  const [polling, setPolling] = useState(false);
  const username = localStorage.getItem('username');

  const checkForNewHealthData = async () => {
    try {
      const response = await fetch('https://diamondhacks-2025.onrender.com/api/check-health-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: value.format('YYYY-MM-DD'),
          username: username
        })
      });

      const data = await response.json();
      if (data.dataImported) {
        setPolling(false);
        await fetchDailyLog(value);
        setShowLogSection(true);
      }
    } catch (error) {
      console.error('Error checking health data:', error);
    }
  };

  const handleImportStats = () => {
    // if (isMobile) {
    //   window.location.href = 'solz://';
    // } else {
    //   setShowMessage(true);
    //   // Set a timer to hide the message after 5 seconds
    //   setTimeout(() => {
    //     setShowMessage(false);
    //   }, 5000);
    // }
    
    // Start polling for new health data
    setPolling(true);
    const pollInterval = setInterval(() => {
      if (polling) {
        checkForNewHealthData();
      } else {
        clearInterval(pollInterval);
      }
    }, 3000); // Check every 3 seconds

    // Stop polling after 2 minutes if no data found
    setTimeout(() => {
      setPolling(false);
      clearInterval(pollInterval);
    }, 120000);
  };

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => setPolling(false);
  }, []);

  const fetchDailyLog = async (date) => {
    try {
      const response = await fetch(`https://diamondhacks-2025.onrender.com/api/daily-log/${date.format('YYYY-MM-DD')}`, {
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

  const [aiSummary, setAiSummary] = useState('');
  const [showAiDialog, setShowAiDialog] = useState(false);

  const handleAskAI = async () => {
    try {
        console.log("running");
      const response = await fetch('https://diamondhacks-2025.onrender.com/api/ask-ai', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: value.format('YYYY-MM-DD'),
          username: username
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.summary) {
        setAiSummary(data.summary);
        setShowAiDialog(true);
      }
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      setAiSummary('Failed to get AI analysis. Please try again.');
      setShowAiDialog(true);
    }
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
              sx={{ backgroundColor: '#f87060' }}
            >
              Import Stats
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={handleAskAI}
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
      <Dialog 
        open={showAiDialog} 
        onClose={() => setShowAiDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>AI Health Analysis</DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: 'pre-line', my: 2 }}>
            {aiSummary || 'Analyzing your health data...'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAiDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Dashboard;
