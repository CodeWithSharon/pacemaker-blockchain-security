// src/components/DoctorDashboard.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, FormControlLabel, Checkbox, IconButton, Alert,
  Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, createTheme,
  ThemeProvider, CssBaseline
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import LaunchIcon from '@mui/icons-material/Launch';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

// --- Mock Data ---
// In a real application, this data would be fetched from a backend API.
const initialPatients = [
  { id: 1, name: 'John Doe', age: 45, gender: 'Male', medicalHistory: 'Hypertension', notes: 'Patient has been stable for 3 months.', vitals: { heartRate: 78, spO2: 98 } },
  { id: 2, name: 'Jane Smith', age: 30, gender: 'Female', medicalHistory: 'Arrhythmia', notes: 'Monitor heart rate closely.', vitals: { heartRate: 110, spO2: 95 } },
  { id: 3, name: 'Robert Johnson', age: 62, gender: 'Male', medicalHistory: 'Bradycardia', notes: 'Schedule follow-up appointment.', vitals: { heartRate: 55, spO2: 99 } },
];

const mockAppointments = [
  { id: 1, time: '10:00 AM', patient: 'John Doe', reason: 'Routine Checkup' },
  { id: 2, time: '11:00 AM', patient: 'Jane Smith', reason: 'Follow-up' },
];

// Mock vitals data for the line charts
const mockVitalsData = [
  { name: 'Day 1', heartRate: 75, spO2: 98 },
  { name: 'Day 2', heartRate: 78, spO2: 99 },
  { name: 'Day 3', heartRate: 85, spO2: 97 },
  { name: 'Day 4', heartRate: 80, spO2: 98 },
  { name: 'Day 5', heartRate: 79, spO2: 98 },
  { name: 'Day 6', heartRate: 82, spO2: 99 },
  { name: 'Day 7', heartRate: 80, spO2: 98 },
];

const mockECGData = [
  { time: 1, value: 5 }, { time: 2, value: 10 }, { time: 3, value: 15 },
  { time: 4, value: 20 }, { time: 5, value: 25 }, { time: 6, value: 30 },
  { time: 7, value: 25 }, { time: 8, value: 20 }, { time: 9, value: 15 },
  { time: 10, value: 10 }, { time: 11, value: 5 }, { time: 12, value: 0 },
  { time: 13, value: -5 }, { time: 14, value: -10 }, { time: 15, value: -5 },
  { time: 16, value: 0 }, { time: 17, value: 5 }, { time: 18, value: 10 },
  { time: 19, value: 15 }, { time: 20, value: 20 }, { time: 21, value: 25 },
  { time: 22, value: 30 }, { time: 23, value: 25 }, { time: 24, value: 20 },
  { time: 25, value: 15 }, { time: 26, value: 10 }, { time: 27, value: 5 },
  { time: 28, value: 0 }, { time: 29, value: -5 }, { time: 30, value: -10 },
];

const mockNotifications = [
  { id: 1, text: 'New lab report added for John Doe.', type: 'info' },
  { id: 2, text: 'Appointment reminder: Jane Smith at 11:00 AM.', type: 'info' },
  { id: 3, text: 'CRITICAL ALERT: Heart rate fluctuation detected in Patient 3.', type: 'critical' },
];

const mockDoctorProfile = {
  name: 'Dr. Emily Carter',
  department: 'Cardiology',
  contact: 'emily.carter@hospital.com',
  qualifications: 'M.D. in Cardiology, F.A.C.C.',
  availability: 'Mon-Fri, 9:00 AM - 5:00 PM',
  profilePic: 'https://placehold.co/150x150',
};

const mockChatContacts = [
  { id: 1, name: 'Nurse Alice', status: 'online' },
  { id: 2, name: 'Technician Bob', status: 'online' },
  { id: 3, name: 'Receptionist Carol', status: 'offline' },
];

const reportTypes = ['Lab Report', 'X-Ray', 'ECG', 'Blood Test', 'Other'];
const medicineOptions = ['Aspirin', 'Metoprolol', 'Lisinopril', 'Simvastatin'];

// --- Main Component ---
const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(initialPatients);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [notifications] = useState(mockNotifications);
  const [selectedPage, setSelectedPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // Theme setup for dark mode using useMemo for performance
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        // Updated colors for the Indigo, Lavender, and Gold theme
        primary: {
          main: '#3F51B5', // Indigo
          contrastText: '#fff',
        },
        secondary: {
          main: '#B39DDB', // Lavender
          contrastText: '#212121',
        },
        warning: {
          main: '#FFC107', // Gold for accents
        },
        background: {
          default: darkMode ? '#121212' : '#EDE7F6', // Light lavender background
          paper: darkMode ? '#1E2328' : '#fff', // White for cards in light mode
        },
        text: {
          primary: darkMode ? '#E0E0E0' : '#212121',
          secondary: darkMode ? '#B0B0B0' : '#555555',
        },
        divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
      typography: {
        fontFamily: 'Roboto, sans-serif',
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
            },
          },
        },
        MuiTableContainer: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: ({ ownerState, theme }) => ({
              ...(ownerState.selected && {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                },
              }),
            }),
          },
        },
      },
    }),
    [darkMode]
  );

  // --- State for Dialogs ---
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportForm, setReportForm] = useState({ patientId: '', reportType: '', notes: '', file: null });
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({ patientId: '', diagnosis: '', medicines: [] });
  const [openPatientDetailsDialog, setOpenPatientDetailsDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openAddPatientDialog, setOpenAddPatientDialog] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ name: '', age: '', gender: '', medicalHistory: '', notes: '' });
  const [openUpdatePatientDialog, setOpenUpdatePatientDialog] = useState(false);
  const [updatePatientForm, setUpdatePatientForm] = useState(null);
  const [openBookAppointmentDialog, setOpenBookAppointmentDialog] = useState(false);
  const [newAppointmentForm, setNewAppointmentForm] = useState({ patientId: '', date: '', time: '', reason: '' });

  // --- General Handlers ---
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // --- Add Patient Handlers ---
  const handleOpenAddPatientDialog = () => setOpenAddPatientDialog(true);
  const handleCloseAddPatientDialog = () => {
    setOpenAddPatientDialog(false);
    setNewPatientForm({ name: '', age: '', gender: '', medicalHistory: '', notes: '' });
  };
  const handleNewPatientFormChange = (e) => setNewPatientForm({ ...newPatientForm, [e.target.name]: e.target.value });
  const handleAddPatient = () => {
    const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
    const patientToAdd = {
      ...newPatientForm,
      id: newId,
      vitals: { heartRate: 70, spO2: 98 }, // Default vitals for a new patient
    };
    setPatients([...patients, patientToAdd]);
    handleCloseAddPatientDialog();
  };

  // --- Update Patient Handlers ---
  const handleOpenUpdatePatientDialog = (patient) => {
    setUpdatePatientForm(patient);
    setOpenUpdatePatientDialog(true);
  };
  const handleCloseUpdatePatientDialog = () => {
    setOpenUpdatePatientDialog(false);
    setUpdatePatientForm(null);
  };
  const handleUpdatePatientFormChange = (e) => {
    setUpdatePatientForm({ ...updatePatientForm, [e.target.name]: e.target.value });
  };
  const handleUpdatePatient = () => {
    setPatients(patients.map(p => p.id === updatePatientForm.id ? updatePatientForm : p));
    handleCloseUpdatePatientDialog();
  };

  // --- Reports Handlers ---
  const handleOpenReportDialog = () => setOpenReportDialog(true);
  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
    setReportForm({ patientId: '', reportType: '', notes: '', file: null });
  };
  const handleReportFormChange = (e) => setReportForm({ ...reportForm, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setReportForm({ ...reportForm, file: e.target.files[0] });
  const handleReportSubmit = (e) => {
    e.preventDefault();
    console.log(`Report submitted for patient: ${patients.find(p => p.id === reportForm.patientId)?.name}`);
    handleCloseReportDialog();
  };

  // --- Prescription Handlers ---
  const handleOpenPrescriptionDialog = () => setOpenPrescriptionDialog(true);
  const handleClosePrescriptionDialog = () => {
    setOpenPrescriptionDialog(false);
    setPrescriptionForm({ patientId: '', diagnosis: '', medicines: [] });
  };
  const handlePrescriptionFormChange = (e) => setPrescriptionForm({ ...prescriptionForm, [e.target.name]: e.target.value });
  const handleMedicineChange = (e) => {
    const { value, checked } = e.target;
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: checked
        ? [...prev.medicines, value]
        : prev.medicines.filter(m => m !== value)
    }));
  };
  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    console.log(`Prescription submitted for patient: ${patients.find(p => p.id === prescriptionForm.patientId)?.name}`);
    handleClosePrescriptionDialog();
  };

  // --- Patient Details Handlers ---
  const handleViewPatientDetails = (patient) => {
    setSelectedPatient({ ...patient, ecgData: mockECGData });
    setOpenPatientDetailsDialog(true);
  };
  const handleClosePatientDetailsDialog = () => {
    setOpenPatientDetailsDialog(false);
    setSelectedPatient(null);
  };

  // --- Appointment Handlers ---
  const handleOpenBookAppointmentDialog = () => setOpenBookAppointmentDialog(true);
  const handleCloseBookAppointmentDialog = () => {
    setOpenBookAppointmentDialog(false);
    setNewAppointmentForm({ patientId: '', date: '', time: '', reason: '' });
  };
  const handleNewAppointmentFormChange = (e) => setNewAppointmentForm({ ...newAppointmentForm, [e.target.name]: e.target.value });
  const handleBookAppointment = () => {
    const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    const patientName = patients.find(p => p.id === parseInt(newAppointmentForm.patientId))?.name || 'Unknown';
    setAppointments([...appointments, { ...newAppointmentForm, id: newId, patient: patientName }]);
    handleCloseBookAppointmentDialog();
    console.log(`Appointment booked for ${patientName} on ${newAppointmentForm.date} at ${newAppointmentForm.time}.`);
  };

  // --- Export Handlers ---
  const handleExportPdf = () => {
    console.log('Exporting patient list to PDF. This would be a backend process in a real application.');
  };

  const handleExportCsv = () => {
    console.log('Exporting patient list to CSV. This would be a backend process in a real application.');
  };

  // --- Renders content based on selected page ---
  const renderContent = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {selectedPage === 'dashboard' && (
          <>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>Vitals Trends (Last 7 Days)</Typography>
                <Divider sx={{ my: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockVitalsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartRate" stroke="#3F51B5" name="Heart Rate (BPM)" />
                    <Line type="monotone" dataKey="spO2" stroke="#B39DDB" name="SpO2 (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Quick Actions and Notifications are now in a flexbox to span the width */}
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Card sx={{ p: 2, flex: 1 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Quick Actions</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpenAddPatientDialog}>Add Patient</Button>
                    <Button variant="contained" startIcon={<UploadFileIcon />} onClick={handleOpenReportDialog}>Add Report</Button>
                    <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleOpenPrescriptionDialog}>Prescribe</Button>
                  </Box>
                </CardContent>
              </Card>
              <Card sx={{ p: 2, flex: 1 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Notifications Center</Typography>
                  <Box maxHeight={150} sx={{ overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <Alert key={n.id} severity={n.type === 'critical' ? 'error' : 'info'} sx={{ mb: 1 }}>
                        {n.text}
                      </Alert>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {selectedPage === 'patients' && (
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Patient Management</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpenAddPatientDialog}>
                  Add New Patient
                </Button>
                <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleExportPdf}>
                  Export to PDF
                </Button>
                <Button variant="outlined" startIcon={<DescriptionIcon />} onClick={handleExportCsv}>
                  Export to CSV
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient Name</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Medical History</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.map((p) => (
                      <TableRow key={p.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.age}</TableCell>
                        <TableCell>{p.gender}</TableCell>
                        <TableCell>{p.medicalHistory}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleViewPatientDetails(p)} startIcon={<LaunchIcon />}>View</Button>
                          <IconButton size="small" color="primary" onClick={() => handleOpenUpdatePatientDialog(p)}><EditIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {selectedPage === 'reports' && (
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Card sx={{ p: 2, flex: 1 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>Prescribe Medicines</Typography>
                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleOpenPrescriptionDialog}>
                  Create New Prescription
                </Button>
              </CardContent>
            </Card>
            <Card sx={{ p: 2, flex: 1 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>Add Medical Report</Typography>
                <Button variant="contained" startIcon={<UploadFileIcon />} onClick={handleOpenReportDialog}>
                  Upload New Report
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}

        {selectedPage === 'appointments' && (
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Today’s Appointments</Typography>
              <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpenBookAppointmentDialog}>Book New Appointment</Button>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((a) => (
                      <TableRow key={a.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{a.time}</TableCell>
                        <TableCell>{a.patient}</TableCell>
                        <TableCell>{a.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {selectedPage === 'profile' && (
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Doctor Profile</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box component="img" src={mockDoctorProfile.profilePic} alt="Profile" sx={{ width: 100, height: 100, borderRadius: '50%', mr: 2 }} />
                <Box>
                  <Typography variant="h6">{mockDoctorProfile.name}</Typography>
                  <Typography color="text.secondary">{mockDoctorProfile.department}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1"><strong>Qualifications:</strong> {mockDoctorProfile.qualifications}</Typography>
              <Typography variant="body1"><strong>Contact:</strong> {mockDoctorProfile.contact}</Typography>
              <Typography variant="body1"><strong>Availability:</strong> {mockDoctorProfile.availability}</Typography>
            </CardContent>
          </Card>
        )}

        {selectedPage === 'chat' && (
          <Box sx={{ display: 'flex', gap: 4, height: '100%' }}>
            <Card sx={{ p: 2, flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Contacts</Typography>
                <List>
                  {mockChatContacts.map(contact => (
                    <ListItem key={contact.id}>
                      <ListItemText primary={contact.name} secondary={contact.status === 'online' ? 'Online' : 'Offline'} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 2 }}>
              <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>Chat with Nurse Alice</Typography>
                <Alert severity="info">
                  This is a mock chat UI. In a real application, this would be a live chat with a backend service.
                </Alert>
              </CardContent>
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <TextField fullWidth placeholder="Type a message..." />
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default, color: theme.palette.text.primary }}>
        {/* Sidebar */}
        <Box sx={{
          width: 280,
          flexShrink: 0,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
            Doctor Panel
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton selected={selectedPage === 'dashboard'} onClick={() => setSelectedPage('dashboard')}>
                <ListItemIcon><DashboardIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton selected={selectedPage === 'patients'} onClick={() => setSelectedPage('patients')}>
                <ListItemIcon><PeopleIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText primary="Patients" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton selected={selectedPage === 'reports'} onClick={() => setSelectedPage('reports')}>
                <ListItemIcon><VaccinesIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText primary="Reports & Rx" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton selected={selectedPage === 'appointments'} onClick={() => setSelectedPage('appointments')}>
                <ListItemIcon><EventNoteIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText primary="Appointments" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton selected={selectedPage === 'profile'} onClick={() => setSelectedPage('profile')}>
                <ListItemIcon><PersonIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton selected={selectedPage === 'chat'} onClick={() => setSelectedPage('chat')}>
                <ListItemIcon><ChatIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText primary="Chat" />
              </ListItemButton>
            </ListItem>
          </List>
          <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)} sx={{ mb: 2 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <Button variant="contained" color="secondary" onClick={handleLogout} fullWidth>
              Logout
            </Button>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
          {renderContent()}
        </Box>

        {/* --- Dialogs for forms and details --- */}

        {/* Add New Patient Dialog */}
        <Dialog open={openAddPatientDialog} onClose={handleCloseAddPatientDialog}>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField margin="normal" fullWidth label="Patient Name" name="name" value={newPatientForm.name} onChange={handleNewPatientFormChange} required />
              <TextField margin="normal" fullWidth label="Age" name="age" type="number" value={newPatientForm.age} onChange={handleNewPatientFormChange} required />
              <TextField select fullWidth label="Gender" name="gender" value={newPatientForm.gender} onChange={handleNewPatientFormChange} margin="normal" required>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField margin="normal" fullWidth label="Medical History / Condition" name="medicalHistory" value={newPatientForm.medicalHistory} onChange={handleNewPatientFormChange} />
              <TextField margin="normal" fullWidth label="Notes" name="notes" value={newPatientForm.notes} onChange={handleNewPatientFormChange} multiline rows={4} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddPatientDialog}>Cancel</Button>
            <Button onClick={handleAddPatient} variant="contained" disabled={!newPatientForm.name || !newPatientForm.age || !newPatientForm.gender}>Add Patient</Button>
          </DialogActions>
        </Dialog>

        {/* Update Patient Details Dialog */}
        <Dialog open={openUpdatePatientDialog} onClose={handleCloseUpdatePatientDialog}>
          <DialogTitle>Edit Patient Details</DialogTitle>
          <DialogContent>
            {updatePatientForm && (
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <TextField margin="normal" fullWidth label="Patient Name" name="name" value={updatePatientForm.name} onChange={handleUpdatePatientFormChange} required />
                <TextField margin="normal" fullWidth label="Age" name="age" type="number" value={updatePatientForm.age} onChange={handleUpdatePatientFormChange} required />
                <TextField select fullWidth label="Gender" name="gender" value={updatePatientForm.gender} onChange={handleUpdatePatientFormChange} margin="normal" required>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
                <TextField margin="normal" fullWidth label="Medical History / Condition" name="medicalHistory" value={updatePatientForm.medicalHistory} onChange={handleUpdatePatientFormChange} />
                <TextField margin="normal" fullWidth label="Notes" name="notes" value={updatePatientForm.notes} onChange={handleUpdatePatientFormChange} multiline rows={4} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUpdatePatientDialog}>Cancel</Button>
            <Button onClick={handleUpdatePatient} variant="contained" disabled={!updatePatientForm?.name || !updatePatientForm?.age || !updatePatientForm?.gender}>Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Book Appointment Dialog */}
        <Dialog open={openBookAppointmentDialog} onClose={handleCloseBookAppointmentDialog}>
          <DialogTitle>Book New Appointment</DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField select fullWidth label="Select Patient" name="patientId" value={newAppointmentForm.patientId} onChange={handleNewAppointmentFormChange} margin="normal" required>
                {patients.map((p) => (<MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>))}
              </TextField>
              <TextField margin="normal" fullWidth label="Date" name="date" type="date" value={newAppointmentForm.date} onChange={handleNewAppointmentFormChange} required InputLabelProps={{ shrink: true }} />
              <TextField margin="normal" fullWidth label="Time" name="time" type="time" value={newAppointmentForm.time} onChange={handleNewAppointmentFormChange} required InputLabelProps={{ shrink: true }} />
              <TextField margin="normal" fullWidth label="Reason for Appointment" name="reason" value={newAppointmentForm.reason} onChange={handleNewAppointmentFormChange} required />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBookAppointmentDialog}>Cancel</Button>
            <Button onClick={handleBookAppointment} variant="contained" disabled={!newAppointmentForm.patientId || !newAppointmentForm.date || !newAppointmentForm.time}>Book</Button>
          </DialogActions>
        </Dialog>

        {/* Add Medical Report Dialog */}
        <Dialog open={openReportDialog} onClose={handleCloseReportDialog}>
          <DialogTitle>Add Medical Report</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleReportSubmit} noValidate sx={{ mt: 1 }}>
              <TextField select fullWidth label="Select Patient" name="patientId" value={reportForm.patientId} onChange={handleReportFormChange} margin="normal" required>
                {patients.map((p) => (<MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>))}
              </TextField>
              <TextField select fullWidth label="Report Type" name="reportType" value={reportForm.reportType} onChange={handleReportFormChange} margin="normal" required>
                {reportTypes.map((type) => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
              </TextField>
              <TextField fullWidth multiline rows={4} label="Notes or Observations" name="notes" value={reportForm.notes} onChange={handleReportFormChange} margin="normal" />
              <Button variant="contained" component="label" startIcon={<UploadFileIcon />} sx={{ mt: 2 }}>
                Upload Attachment<input type="file" hidden onChange={handleFileChange} />
              </Button>
              {reportForm.file && (<Typography variant="body2" sx={{ mt: 1 }}>File selected: {reportForm.file.name}</Typography>)}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReportDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!reportForm.patientId || !reportForm.reportType}>Submit</Button>
          </DialogActions>
        </Dialog>

        {/* Add Prescription Dialog */}
        <Dialog open={openPrescriptionDialog} onClose={handleClosePrescriptionDialog}>
          <DialogTitle>Prescribe Medicine</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handlePrescriptionSubmit} noValidate sx={{ mt: 1 }}>
              <TextField select fullWidth label="Select Patient" name="patientId" value={prescriptionForm.patientId} onChange={handlePrescriptionFormChange} margin="normal" required>
                {patients.map((p) => (<MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>))}
              </TextField>
              <TextField margin="normal" fullWidth label="Diagnosis" name="diagnosis" value={prescriptionForm.diagnosis} onChange={handlePrescriptionFormChange} multiline rows={2} required />
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Select Medicines</Typography>
              <Grid container spacing={1}>
                {medicineOptions.map((medicine) => (
                  <Grid item xs={6} key={medicine}>
                    <FormControlLabel
                      control={<Checkbox checked={prescriptionForm.medicines.includes(medicine)} onChange={handleMedicineChange} value={medicine} />}
                      label={medicine}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePrescriptionDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!prescriptionForm.patientId || !prescriptionForm.diagnosis || prescriptionForm.medicines.length === 0}>Submit Prescription</Button>
          </DialogActions>
        </Dialog>

        {/* Patient Details Dialog with ECG Chart */}
        <Dialog open={openPatientDetailsDialog} onClose={handleClosePatientDetailsDialog} maxWidth="md" fullWidth>
          <DialogTitle>Patient Details: {selectedPatient?.name}</DialogTitle>
          <DialogContent dividers>
            {selectedPatient && (
              <Box>
                {/* Basic Info and Vitals */}
                <Grid container spacing={4} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    <Typography variant="body1"><strong>Age:</strong> {selectedPatient.age}</Typography>
                    <Typography variant="body1"><strong>Gender:</strong> {selectedPatient.gender}</Typography>
                    <Typography variant="body1"><strong>Medical History:</strong> {selectedPatient.medicalHistory}</Typography>
                    <Typography variant="body1"><strong>Notes:</strong> {selectedPatient.notes}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>Current Vitals</Typography>
                    <Typography variant="body1"><strong>Heart Rate:</strong> {selectedPatient.vitals.heartRate} bpm</Typography>
                    <Typography variant="body1"><strong>SpO2:</strong> {selectedPatient.vitals.spO2}%</Typography>
                  </Grid>
                </Grid>

                {/* ECG Graph Section */}
                <Box>
                  <Typography variant="h6" gutterBottom>ECG Readings</Typography>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={selectedPatient.ecgData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'Voltage (mV)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePatientDetailsDialog}>Close</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
};

export default DoctorDashboard;
