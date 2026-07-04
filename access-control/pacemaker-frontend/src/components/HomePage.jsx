// src/components/HomePage.jsx
import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box,
  Container, Grid, Card, CardContent, TextField,
  Snackbar, Alert
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Favorite, Warning, BatteryFull, People, VideoCall, LocalHospital
} from '@mui/icons-material';

// Custom theme with a professional color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#005073', // Deep Professional Blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#70c1b3', // Soft Teal
      contrastText: '#fff',
    },
    background: {
      default: '#dde4eeff', // Light Grey
      paper: '#FFFFFF',    // White for cards
    },
    text: {
      primary: '#333333',  // Dark Grey
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '999px', // rounded-full
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem', // rounded-2xl
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: 6,
          },
        },
      },
    },
  },
});

const HomePage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  };

  const handleLogin = () => {
    console.log("Navigating to login page...");
    window.location.href = '/login';
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      setSnackbarMessage("Please fill all fields");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    setSnackbarMessage("Message sent successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
        {/* Navigation Header */}
        <AppBar position="sticky" color="default" elevation={1}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <img
                src="https://placehold.co/40x40/005073/ffffff?text=HC"
                alt="HeartCare Hospital Logo"
                style={{ borderRadius: '50%', marginRight: '10px' }}
              />
              <Typography variant="h6" fontWeight="bold">
                <span style={{ color: theme.palette.primary.main }}>Heart</span>
                <span style={{ color: theme.palette.secondary.main }}>Care Hospital</span>
              </Typography>
            </Box>
            {[
              { name: 'about', label: 'About Us' },
              { name: 'description', label: 'Pacemaker' },
              { name: 'features', label: 'Features' },
              { name: 'contact', label: 'Contact' }
            ].map((link, idx) => (
              <Button key={idx} color="inherit" onClick={() => handleScroll(link.name)}>
                {link.label}
              </Button>
            ))}
            <Button
              color="secondary"
              variant="contained"
              sx={{ ml: 2, color: theme.palette.secondary.contrastText }}
              onClick={handleLogin}
            >
              Login
            </Button>
          </Toolbar>
        </AppBar>

        {/* Welcome Section */}
        <Box id="welcome" sx={{ p: { xs: 6, md: 12 }, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h3" fontWeight="bold">Welcome to HeartCare Hospital</Typography>
          <Typography variant="h5" sx={{ mt: 2 }}>Saving Lives Through Innovation in Pacemaker Technology</Typography>
          <Typography variant="body1" sx={{ mt: 2, maxWidth: '700px', mx: 'auto' }}>
            We specialize in advanced cardiac care with a focus on heart pacemaker implants, real-time monitoring,
            and long-term patient wellness.
          </Typography>
        </Box>

        {/* About Us */}
        <Box id="about" sx={{ p: { xs: 6, md: 12 }, bgcolor: 'background.paper' }}>
          <Container>
            <Typography variant="h4" gutterBottom>About Us</Typography>
            <Typography sx={{ mb: 2 }}>
              HeartCare Hospital is a leading cardiology facility dedicated to treating heart conditions with cutting-edge medical technology and experienced care. Our focus is on personalized treatment plans, especially for patients needing pacemaker support.
            </Typography>
            <Typography>
              Today’s pacemakers are intelligent — they can adjust to the body's activity levels, store diagnostic information, and wirelessly transmit data to healthcare providers for real-time monitoring. This significantly improves the patient’s quality of life and safety. With over 20 years of service and thousands of successful procedures, we are trusted by patients nationwide. We blend compassionate healthcare with real-time tech solutions to monitor and manage cardiac health efficiently.
            </Typography>
          </Container>
        </Box>

        {/* Pacemaker */}
        <Box id="description" sx={{ p: { xs: 6, md: 12 }, bgcolor: 'background.default' }}>
          <Container>
            <Typography variant="h4" gutterBottom>What is a Heart Pacemaker?</Typography>
            <Typography>
              A pacemaker is a small medical device implanted in the chest to control abnormal heart rhythms. It uses electrical pulses to help the heart beat at a normal rate and rhythm. Pacemakers are commonly used to treat conditions like bradycardia, where the heart beats too slowly, or heart block, where the heart's electrical signal is partially or completely blocked.
            </Typography>
          </Container>
        </Box>

        {/* Features */}
        <Box id="features" sx={{ p: { xs: 6, md: 12 }, bgcolor: 'background.paper' }}>
          <Container>
            <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 6 }}>Key Features</Typography>
            <Grid container spacing={11} justifyContent="center">
              {[
                { icon: <Favorite sx={{ color: theme.palette.primary.main, fontSize: 40 }} />, title: "Remote Monitoring", description: "Track vital signs 24/7.", bgColor: '#E3F4F1' },
                { icon: <Warning sx={{ color: '#F7C676', fontSize: 40 }} />, title: "Emergency Alerts", description: "Automatic abnormal heart alerts.", bgColor: '#FFF8E1' },
                { icon: <BatteryFull sx={{ color: '#5cb85c', fontSize: 40 }} />, title: "Long Battery Life", description: "Lasts 8–10 years.", bgColor: '#E8F5E9' },
                { icon: <People sx={{ color: theme.palette.secondary.main, fontSize: 40 }} />, title: "Expert Team", description: "Certified cardiologists.", bgColor: '#E3F2FD' },
                { icon: <VideoCall sx={{ color: '#8A82A0', fontSize: 40 }} />, title: "Telemedicine Support", description: "Consult doctors from anywhere.", bgColor: '#F3E5F5' },
                { icon: <LocalHospital sx={{ color: theme.palette.primary.main, fontSize: 40 }} />, title: "Advanced Infrastructure", description: "Modern ICUs and labs.", bgColor: '#E0F2F1' },
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card elevation={3} sx={{ textAlign: 'center', p: 4, height: '100%', bgcolor: feature.bgColor }}>
                    {feature.icon}
                    <CardContent>
                      <Typography variant="h6">{feature.title}</Typography>
                      <Typography>{feature.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Contact */}
        <Box id="contact" sx={{ p: { xs: 6, md: 12 }, bgcolor: 'background.default' }}>
          <Container>
            <Typography variant="h4" gutterBottom>Contact Us</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography>📧 support@heartcarehospital.com</Typography>
                <Typography>📞 +91-9876543210</Typography>
                <Typography>📍 Bengaluru, India</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField fullWidth label="Message" name="message" multiline rows={4} value={formData.message} onChange={handleChange} sx={{ mb: 2 }} />
                <Button variant="contained" color="primary" onClick={handleSubmit}>Send Message</Button>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: '#fff' }}>
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} HeartCare Hospital. All rights reserved.
          </Typography>
        </Box>

        {/* Snackbar for alerts */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;
