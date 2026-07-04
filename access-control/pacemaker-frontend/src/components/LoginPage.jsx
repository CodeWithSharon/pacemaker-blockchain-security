// src/components/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card, // Replaced Paper with Card for theme consistency
  Box,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Link,
  Snackbar, // Added Snackbar for user feedback
  Alert, // Added Alert for Snackbar
  Grid,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Define the custom theme with a very dark green and light blue color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#005073', // Deep Professional Blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#52f4ccff', // Soft Teal
      contrastText: '#fff',
    },
    background: {
      default: '#026088ff', // Light Grey
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
          borderRadius: '999px',
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
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

const roles = ['Admin', 'Doctor', 'Technician', 'Nurse'];

const LoginPage = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const saved = localStorage.getItem('rememberMe');
    if (saved === 'true') {
      const savedRole = localStorage.getItem('rememberRole') || '';
      const savedUser = localStorage.getItem('rememberUser') || '';
      setRole(savedRole);
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!role) newErrors.role = 'Role is required';
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!validate()) {
      setSnackbarMessage("Please fill all required fields.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberRole', role);
      localStorage.setItem('rememberUser', username);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberRole');
      localStorage.removeItem('rememberUser');
    }

    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    
    setSnackbarMessage("Login successful!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    const route = role.toLowerCase();
    // Simulate a slight delay for the snackbar to be seen before navigating
    setTimeout(() => {
      navigate(`/${route}-dashboard`);
    }, 1500);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleForgotPassword = () => {
    setSnackbarMessage("Forgot Password flow coming soon!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Container maxWidth="xs">
          <Card
            elevation={8}
            sx={{
              padding: 4,
              borderRadius: '1rem',
              bgcolor: 'background.paper',
              boxShadow: '0 8px 24px rgba(0, 51, 0, 0.2)', // A dark green shadow
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography
                variant="h5"
                gutterBottom
                align="center"
                sx={{ fontWeight: 'bold', color: 'primary.main' }}
              >
                Role-Based Login
              </Typography>
            </Box>
            <Box component="form" noValidate onSubmit={handleLogin}>
              <TextField
                select
                fullWidth
                label="Select Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                margin="normal"
                error={Boolean(errors.role)}
                helperText={errors.role}
                required
                InputLabelProps={{ sx: { color: 'primary.main', fontWeight: 'medium' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              >
                {roles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                error={Boolean(errors.username)}
                helperText={errors.username}
                required
                InputLabelProps={{ sx: { color: 'primary.main', fontWeight: 'medium' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                autoComplete="username"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                error={Boolean(errors.password)}
                helperText={errors.password}
                required
                InputLabelProps={{ sx: { color: 'primary.main', fontWeight: 'medium' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        sx={{ color: 'primary.main' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Grid container alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
                      />
                    }
                    label="Remember Me"
                    sx={{ color: 'primary.main' }}
                  />
                </Grid>
                <Grid item>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleForgotPassword}
                    underline="hover"
                    sx={{ color: 'primary.main' }}
                  >
                    Forgot Password?
                  </Link>
                </Grid>
              </Grid>

              {/* Login Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                color="secondary" // Changed to secondary for consistency
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                  color: 'secondary.contrastText', // Ensuring text color matches
                }}
                disabled={!role || !username || !password}
              >
                Login
              </Button>

              {/* Back to Home Button */}
              <Button
                variant="outlined"
                fullWidth
                color="primary"
                sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </Box>
          </Card>
        </Container>

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

export default LoginPage;
