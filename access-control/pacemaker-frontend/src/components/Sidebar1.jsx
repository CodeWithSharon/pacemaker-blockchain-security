//src/components/Sidebar1.jsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '@mui/material';

const Sidebar = ({ selectedPage, setSelectedPage, darkMode, setDarkMode }) => {
  const theme = useTheme();
  return (
    <Box sx={{ width: 280, flexShrink: 0, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mt: 2, mb: 4, textAlign: 'center' }}>Doctor Panel</Typography>
      <List>
        <ListItem disablePadding><ListItemButton selected={selectedPage === 'dashboard'} onClick={() => setSelectedPage('dashboard')}><ListItemIcon><DashboardIcon sx={{ color: 'inherit' }} /></ListItemIcon><ListItemText primary="Dashboard" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton selected={selectedPage === 'patients'} onClick={() => setSelectedPage('patients')}><ListItemIcon><PeopleIcon sx={{ color: 'inherit' }} /></ListItemIcon><ListItemText primary="Patients" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton selected={selectedPage === 'reports'} onClick={() => setSelectedPage('reports')}><ListItemIcon><VaccinesIcon sx={{ color: 'inherit' }} /></ListItemIcon><ListItemText primary="Reports & Rx" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton selected={selectedPage === 'appointments'} onClick={() => setSelectedPage('appointments')}><ListItemIcon><EventNoteIcon sx={{ color: 'inherit' }} /></ListItemIcon><ListItemText primary="Appointments" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton selected={selectedPage === 'profile'} onClick={() => setSelectedPage('profile')}><ListItemIcon><PersonIcon sx={{ color: 'inherit' }} /></ListItemIcon><ListItemText primary="Profile" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton selected={selectedPage === 'chat'} onClick={() => setSelectedPage('chat')}><ListItemIcon><ChatIcon sx={{ color: 'inherit' }} /></ListItemIcon><ListItemText primary="Chat" /></ListItemButton></ListItem>
      </List>
      <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
        <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)} sx={{ mb: 2 }}>{darkMode ? <LightModeIcon /> : <DarkModeIcon />}</IconButton>
      </Box>
    </Box>
  );
};

export default Sidebar;