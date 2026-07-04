import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, AppBar,
  Typography, CssBaseline, Box, Paper, Grid, ListItemAvatar, Avatar,
  ListItemText as MuiListItemText, ListItemSecondaryAction, IconButton,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const BACKEND_URL = 'http://localhost:5000';
const drawerWidth = 240;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDashboardHome = location.pathname === '/admin-dashboard' || location.pathname === '/admin-dashboard/';

  const menuItems = [
    { text: 'Dashboard Home', path: '' },
    { text: 'Register Doctor', path: 'register-doctor' },
    { text: 'Register Patient', path: 'register-patient' },
    { text: 'Register Nurse', path: 'register-nurse' },
    { text: 'Register Technician', path: 'register-technician' },
    { text: 'Appointments', path: 'appointments' },
    { text: 'View Patient Info', path: 'view-patient-info' },
    { text: 'IDS Alerts', path: 'ids-alerts' },
    { text: 'Firmware Update', path: 'firmware-update' },
    { text: 'Safe Commands', path: 'safe-commands' },
    { text: 'Settings', path: 'settings' },
  ];

  useEffect(() => {
    if (!isDashboardHome) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsRes, alertsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/stats`),
          fetch(`${BACKEND_URL}/api/ids-alerts`),
        ]);
        const statsData = await statsRes.json();
        const alertsData = await alertsRes.json();
        setStats(statsData);
        setRecentAlerts((alertsData.alerts || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [isDashboardHome]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#00796B', color: '#E0F2F1', boxShadow: 'none' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#00796B', color: '#E0F2F1', borderRight: '1px solid #004D40' } }}>
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map(({ text, path }) => (
              <ListItem key={text} disablePadding>
                <ListItemButton onClick={() => navigate(path)} sx={{ '&.Mui-selected': { backgroundColor: '#004D40', color: '#f7d064ff', fontWeight: 'bold' }, '&:hover': { backgroundColor: '#004D40', color: '#FF6F61' } }} selected={location.pathname.endsWith(path)}>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, bgcolor: '#F5F5F5', minHeight: '100vh' }}>
        {isDashboardHome ? (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: '#212121' }}>Welcome Back, Admin!</Typography>
            <Typography variant="body1" gutterBottom sx={{ mb: 4, color: '#757575' }}>
              Here's a live overview of the system status from the blockchain.
            </Typography>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={3}>
                {[
                  { label: 'Total IDS Alerts', value: stats?.totalIdsAlerts ?? '—' },
                  { label: 'Total Access Logs', value: stats?.totalAccessLogs ?? '—' },
                  { label: 'Approved Commands', value: stats?.totalApprovedCommands ?? '—' },
                  { label: 'Latest Block', value: stats?.latestBlock ?? '—' },
                ].map(({ label, value }) => (
                  <Grid item xs={12} sm={6} md={3} key={label}>
                    <Paper elevation={3} sx={{ p: 3, bgcolor: '#FFFFFF' }}>
                      <Typography variant="subtitle1" sx={{ color: '#212121', mb: 1 }}>{label}</Typography>
                      <Typography variant="h3" sx={{ color: '#00796B', fontWeight: 'bold' }}>{value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            {recentAlerts.length > 0 && (
              <Box mt={6}>
                <Typography variant="h5" gutterBottom sx={{ color: '#212121', fontWeight: 'bold' }}>
                  Recent IDS Alerts (from blockchain)
                </Typography>
                <List>
                  {recentAlerts.map((alert) => (
                    <ListItem key={alert.id} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alert.severity === 'High' || alert.severity === 'Critical' ? '#d32f2f' : '#FF6F61' }}>
                          <NotificationsIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <MuiListItemText
                        primary={`${alert.attackType} — Patient ${alert.patientId}`}
                        secondary={`Severity: ${alert.severity} | ${new Date(alert.timestamp * 1000).toLocaleString()}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end"><AccessTimeIcon /></IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        ) : (
          <Outlet />
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;