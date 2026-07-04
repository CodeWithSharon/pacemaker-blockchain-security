// src/components/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          HeartCare Hospital
        </Typography>

        <Box>
          <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
          <Button color="inherit" onClick={() => window.scrollTo(0, document.getElementById('about').offsetTop)}>About Us</Button>
          <Button color="inherit" onClick={() => window.scrollTo(0, document.getElementById('features').offsetTop)}>Features</Button>
          <Button color="inherit" onClick={() => window.scrollTo(0, document.getElementById('contact').offsetTop)}>Contact</Button>
          <Button color="inherit" onClick={handleLoginClick}>Login</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
