//src/pages/Settings.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const mockUsers = [
  { id: 1, name: 'Dr. Jane Doe', email: 'jane.doe@example.com', role: 'Doctor' },
  { id: 2, name: 'Nurse Mary Smith', email: 'mary.smith@example.com', role: 'Nurse' },
  { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'System Administrator' },
];

const Settings = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('account');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [users, setUsers] = useState(mockUsers);
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handlePasswordChange = () => {
    alert('Password change functionality would be implemented here!');
  };

  const handleUserDelete = (id) => {
    setUsers(users.filter(user => user.id !== id));
    alert('User deleted.');
  };

  const handleUserEdit = (id) => {
    alert(`Editing user with ID: ${id}. This would open a modal or form.`);
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'account':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar src={profileImage} sx={{ width: 80, height: 80 }} />
              <Button variant="outlined" component="label">
                Upload Image
                <input type="file" hidden onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setProfileImage(URL.createObjectURL(file));
                  }
                }} />
              </Button>
            </Box>
            <Typography>
              **Name**: Admin User
            </Typography>
            <Typography>
              **Email**: admin@example.com
            </Typography>
            <Typography>
              **Role**: System Administrator
            </Typography>
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <TextField label="New Password" type="password" fullWidth sx={{ mb: 2 }} />
              <TextField label="Confirm Password" type="password" fullWidth sx={{ mb: 2 }} />
              <Button variant="contained" color="primary" onClick={handlePasswordChange}>
                Update Password
              </Button>
            </Box>
          </Box>
        );
      case 'notifications':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Email Notifications for Alerts"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Receive email updates for critical IDS alerts.
            </Typography>
          </Box>
        );
      case 'manage-users':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Manage Users
            </Typography>
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleUserEdit(user.id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleUserDelete(user.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', padding: '2rem', gap: '2rem' }}>
      <Card sx={{ minWidth: 240 }}>
        <CardContent>
          <List>
            <ListItem button selected={selectedSection === 'account'} onClick={() => setSelectedSection('account')}>
              <ListItemText primary="Account Settings" />
            </ListItem>
            <ListItem button selected={selectedSection === 'notifications'} onClick={() => setSelectedSection('notifications')}>
              <ListItemText primary="Notifications" />
            </ListItem>
            <ListItem button selected={selectedSection === 'manage-users'} onClick={() => setSelectedSection('manage-users')}>
              <ListItemText primary="Manage Users" />
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <Button variant="contained" color="secondary" onClick={handleLogout} fullWidth>
                Logout
              </Button>
            </ListItem>
          </List>
        </CardContent>
      </Card>
      <Card sx={{ flexGrow: 1 }}>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;