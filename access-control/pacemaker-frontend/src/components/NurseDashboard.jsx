// src/components/NurseDashboard.jsx
// NurseDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  TextField,
  Chip,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Favorite as HeartIcon,
  Group as UsersIcon,
  Warning as AlertTriangleIcon,
  LocalPharmacy as PillIcon,
  ListAlt as ClipboardListIcon,
  ChatBubble as MessageCircleIcon,
  LocalHospital as StethoscopeIcon,
  MenuBook as BookOpenIcon,
  Phone as PhoneCallIcon,
  Timeline as ActivityIcon,
  MonitorHeart as HeartPulseIcon,
  ExpandMore as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  EditNote as ClipboardPenIcon,
  Description as FileTextIcon,
  Logout as LogOutIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
// --- MODIFIED: ADDED useNavigate for redirection ---
import { useNavigate } from 'react-router-dom';

// New color theme based on user request, converted for MUI's ThemeProvider
const themeColors = {
  // --- MODIFIED: Implemented the new purple-based color theme ---
  background: '#F7F4FA', // Off-White Lilac
  cardBackground: '#FFFFFF', // Keeping cards white for contrast
  textPrimary: '#3E3B5A', // Dark Slate Blue
  textSecondary: '#6A4C93', // Primary Purple for secondary text
  primary: '#6A4C93', // Primary Purple for main actions
  secondary: '#BFA5D9', // Soft Lavender for secondary actions
  accent: '#F28E7B', // Soft Coral for highlights and high priority
  danger: '#D63031', // Retained a distinct red for critical alerts
  success: '#4CAF50', // Standard green for success
  info: '#2196F3', // Standard blue for information
  shadow: 'rgba(0, 0, 0, 0.05)',
};

const theme = createTheme({
  palette: {
    primary: {
      main: themeColors.primary,
    },
    secondary: {
      main: themeColors.secondary,
    },
    error: {
      main: themeColors.danger,
    },
    info: {
      main: themeColors.info,
    },
    background: {
      default: themeColors.background,
      paper: themeColors.cardBackground,
    },
    text: {
      primary: themeColors.textPrimary,
      secondary: themeColors.textSecondary,
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: `0 4px 6px -1px ${themeColors.shadow}`,
          borderTop: `4px solid`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: 'white',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          boxShadow: `0 4px 6px -1px ${themeColors.shadow}`,
          borderTop: `4px solid`,
          backgroundColor: themeColors.cardBackground,
        },
      },
    },
  },
});

// Mock data and API simulation
const initialMockData = {
  pacemakerData: { heartRate: 72, batteryStatus: 95, pacingMode: 'DDD', leadStatus: 'Normal' },
  patients: [
    { id: 'PAT-101', name: 'John Doe', pacemakerId: 'PMC-2345', history: 'Post-op 2 days', lastCheckup: '2025-08-01' },
    { id: 'PAT-102', name: 'Jane Smith', pacemakerId: 'PMC-8765', history: 'Routine Checkup', lastCheckup: '2025-07-28' },
    { id: 'PAT-103', name: 'Peter Jones', pacemakerId: 'PMC-3456', history: 'Pre-op assessment', lastCheckup: '2025-08-05' },
    { id: 'PAT-104', name: 'Mary Williams', pacemakerId: 'PMC-7890', history: 'Post-op 1 week', lastCheckup: '2025-07-30' },
  ],
  medications: [
    { id: 'med-1', patientId: 'PAT-101', name: 'Metoprolol', dose: '50mg', time: '09:00 AM', status: 'pending' },
    { id: 'med-2', patientId: 'PAT-102', name: 'Aspirin', dose: '81mg', time: '10:00 AM', status: 'pending' },
    { id: 'med-3', patientId: 'PAT-101', name: 'Lisinopril', dose: '10mg', time: '11:00 AM', status: 'pending' },
    { id: 'med-4', patientId: 'PAT-103', name: 'Warfarin', dose: '5mg', time: '08:00 AM', status: 'pending' },
  ],
  tasks: [
    { id: 'task-1', text: "Check Patient 101's lead impedance", patientId: 'PAT-101', complete: false, priority: 'critical' },
    { id: 'task-2', text: "Prepare Patient 102 for discharge", patientId: 'PAT-102', complete: false, priority: 'high' },
    { id: 'task-3', text: "Document Patient 103's vitals", patientId: 'PAT-103', complete: false, priority: 'normal' },
    { id: 'task-4', text: "Clean Patient 104's wound", patientId: 'PAT-104', complete: true, priority: 'low' },
  ],
  criticalAlerts: [{ id: 'alert-1', patientId: 'PAT-101', message: 'Heart Rate Spike detected in Patient 101!', timestamp: new Date() }],
  notes: { 'PAT-101': [{ text: 'Patient resting comfortably.', timestamp: new Date() }] },
  chatMessages: [{ id: 'chat-1', sender: 'Cardiologist', message: 'The patient is stable, keep monitoring.', timestamp: new Date() }],
  deviceStatus: { model: 'CardioMax-200', firmware: 'v1.5.2', lastUpdate: '2025-06-15', nextMaintenance: '2026-06-15' },
};

// Simulate a backend API call with a delay
const mockApiCall = (data, delay = 500) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

// Generate a random vital sign within a realistic range
const generateRandomVitals = () => {
  const heartRate = 60 + Math.floor(Math.random() * 30); // 60-90 bpm
  const spO2 = 95 + Math.floor(Math.random() * 5); // 95-99%
  const temperature = (36.5 + Math.random() * 1).toFixed(1); // 36.5-37.5°C
  const systolic = 110 + Math.floor(Math.random() * 20); // 110-130
  const diastolic = 70 + Math.floor(Math.random() * 20); // 70-90
  return { heartRate, bloodPressure: `${systolic}/${diastolic}`, spO2, temperature };
};

// --- Main Nurse Dashboard Component ---
const App = () => {
  // --- MODIFIED: Hook for navigation ---
  const navigate = useNavigate();

  const [pacemakerData, setPacemakerData] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [notes, setNotes] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [medicationSearchTerm, setMedicationSearchTerm] = useState('');
  const [collapsibleStates, setCollapsibleStates] = useState({
    patientHub: true,
    medicationSchedule: true,
    tasks: true,
    notes: true,
    chat: true,
    deviceStatus: true,
    educationHub: true,
  });

  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [selectedPatientForNote, setSelectedPatientForNote] = useState(null);
  const [addNoteText, setAddNoteText] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');

  // --- NEW STATE FOR EDUCATION HUB ---
  const [selectedEducationDescription, setSelectedEducationDescription] = useState(null);

  const chatInputRef = useRef();
  const chatMessagesEndRef = useRef();

  const handleAlertClick = (patientId) => {
    const patientElement = document.getElementById(`patient-${patientId}`);
    if (patientElement) {
      patientElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- MODIFIED: Updated handleLogout function ---
  const handleLogout = () => {
    // Clear any authentication tokens and user info from storage
    // These keys match what you set in LoginPage.jsx
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberRole');
    localStorage.removeItem('rememberUser');

    // Show a toast message for a better user experience
    setToastMessage('You have been logged out successfully.');
    setToastSeverity('info');
    setToastOpen(true);
    
    // Redirect to the login page after a short delay so the toast can be seen
    setTimeout(() => {
      navigate('/login');
    }, 500); 
  };

  const showToast = (message, severity = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          fetchedPacemakerData,
          fetchedPatients,
          fetchedMedications,
          fetchedTasks,
          fetchedAlerts,
          fetchedNotes,
          fetchedChat,
          fetchedDevice,
        ] = await Promise.all([
          mockApiCall(initialMockData.pacemakerData, 1000),
          mockApiCall(initialMockData.patients, 1000),
          mockApiCall(initialMockData.medications, 1000),
          mockApiCall(initialMockData.tasks, 1000),
          mockApiCall(initialMockData.criticalAlerts, 1000),
          mockApiCall(initialMockData.notes, 1000),
          mockApiCall(initialMockData.chatMessages, 1000),
          mockApiCall(initialMockData.deviceStatus, 1000),
        ]);
        setPacemakerData(fetchedPacemakerData);
        setPatients(fetchedPatients);
        setMedications(fetchedMedications);
        setTasks(fetchedTasks);
        setCriticalAlerts(fetchedAlerts);
        setNotes(fetchedNotes);
        setChatMessages(fetchedChat);
        setDeviceStatus(fetchedDevice);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const vitalsInterval = setInterval(() => {
        const newVitals = generateRandomVitals();
        const now = new Date();
        setVitals(newVitals);
        setVitalsHistory((prevHistory) => {
          const newHistory = [...prevHistory, { ...newVitals, time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}` }];
          if (newHistory.length > 20) {
            return newHistory.slice(1);
          }
          return newHistory;
        });
      }, 3000);

      const clockInterval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => {
        clearInterval(vitalsInterval);
        clearInterval(clockInterval);
      };
    }
  }, [loading]);
  
  useEffect(() => {
    if (chatMessagesEndRef.current) {
        chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleMedicationAdministered = (id, medicationName, patientId) => {
    setMedications(meds => meds.map(m => m.id === id ? { ...m, status: 'administered' } : m));
    showToast(`'${medicationName}' administered to Patient '${patientId}'`);
  };
  
  const handleTaskToggle = (id, complete) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, complete: !complete } : t));
    showToast(`Task ${complete ? 'marked as incomplete' : 'marked as complete'}.`);
  };

  const handleAddNote = () => {
    if (!addNoteText.trim() || !selectedPatientForNote) return;
    const noteEntry = { text: addNoteText, timestamp: new Date() };
    setNotes(prevNotes => ({
      ...prevNotes,
      [selectedPatientForNote.id]: prevNotes[selectedPatientForNote.id] ? [...prevNotes[selectedPatientForNote.id], noteEntry] : [noteEntry]
    }));
    showToast(`Note added for Patient ${selectedPatientForNote.id}.`);
    setIsAddNoteDialogOpen(false);
    setAddNoteText('');
  };
  
  const handleSendMessage = (event) => {
    event.preventDefault();
    const message = chatInputRef.current.value;
    if (message.trim()) {
      const newMessage = { id: Date.now(), sender: 'Nurse', message: message, timestamp: new Date() };
      setChatMessages(prevMessages => [...prevMessages, newMessage]);
      chatInputRef.current.value = '';
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );
  
  const filteredMedications = medications.filter(m =>
    m.name.toLowerCase().includes(medicationSearchTerm.toLowerCase()) ||
    m.patientId.toLowerCase().includes(medicationSearchTerm.toLowerCase())
  );

  const getTaskPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return themeColors.danger;
      case 'high':
        return themeColors.accent;
      case 'normal':
        return themeColors.secondary;
      default:
        return themeColors.textSecondary;
    }
  };
  
  const renderPatientNoteDialog = () => (
    <Dialog open={isAddNoteDialogOpen} onClose={() => setIsAddNoteDialogOpen(false)}>
      <DialogTitle>Add Note for {selectedPatientForNote?.name}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="New Note"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={addNoteText}
          onChange={(e) => setAddNoteText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsAddNoteDialogOpen(false)} color="secondary">Cancel</Button>
        <Button onClick={handleAddNote} color="primary" variant="contained">Add Note</Button>
      </DialogActions>
    </Dialog>
  );

  // --- NEW DATA AND HANDLER FOR EDUCATION HUB ---
  const educationTopics = [
    {
      id: 1,
      title: 'Medication Administration',
      description: 'Review the latest protocols for safe and effective medication administration, including best practices for patient identification, dosage calculation, and documentation. This module covers different routes and potential side effects.',
    },
    {
      id: 2,
      title: 'Wound Care Techniques',
      description: 'Explore modern wound care techniques, from basic cleaning to advanced dressing applications. This guide includes information on different types of wounds, infection control, and patient education on home care.',
    },
    {
      id: 3,
      title: 'Infection Control',
      description: 'Learn about the critical importance of infection control in a clinical setting. Topics include proper hand hygiene, use of personal protective equipment (PPE), and sterilization procedures to prevent the spread of pathogens.',
    },
    {
      id: 4,
      title: 'Patient Safety Protocols',
      description: 'Understand key patient safety protocols designed to minimize risks and errors. This includes fall prevention, surgical safety checklists, and effective communication strategies to ensure a safe environment for all patients.',
    },
  ];

  // Handler to set the description for the selected education topic
  const handleEducationItemClick = (description) => {
    setSelectedEducationDescription(description);
  };
  
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: themeColors.background,
        color: themeColors.textPrimary,
      }}>
        <CircularProgress sx={{ color: themeColors.primary }} />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: themeColors.background }}>
        <Snackbar
          open={toastOpen}
          autoHideDuration={6000}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
            {toastMessage}
          </Alert>
        </Snackbar>
        {renderPatientNoteDialog()}
        
        {/* Emergency Call Dialog */}
        <Dialog open={isEmergencyDialogOpen} onClose={() => setIsEmergencyDialogOpen(false)}>
          <DialogTitle>Emergency Call</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to initiate an emergency call?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEmergencyDialogOpen(false)} color="secondary">Cancel</Button>
            <Button onClick={() => { setIsEmergencyDialogOpen(false); showToast('Emergency call initiated.', 'error'); }} color="error" variant="contained">Confirm Call</Button>
          </DialogActions>
        </Dialog>

        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h1" component="h1">Nurse Dashboard</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium', color: themeColors.textSecondary }}>{currentTime.toLocaleString()}</Typography>
            <Button
              variant="contained"
              color="error"
              size="large"
              sx={{ boxShadow: '0 4px 6px rgba(214, 48, 49, 0.2)', fontWeight: 600 }}
              onClick={() => setIsEmergencyDialogOpen(true)}
              startIcon={<PhoneCallIcon />}
            >
              Emergency Call
            </Button>
            {/* The Logout button now uses the updated handleLogout function */}
            <Button
              variant="outlined"
              size="large"
              sx={{ color: themeColors.textSecondary, borderColor: themeColors.textSecondary, fontWeight: 600 }}
              onClick={handleLogout}
              startIcon={<LogOutIcon />}
            >
              Logout
            </Button>
          </Box>
        </Box>
        <Grid container spacing={4}>
          {/* 1. Real-Time Pacemaker Monitoring */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ borderTopColor: themeColors.danger }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HeartIcon sx={{ color: themeColors.danger }} />
                    <Typography variant="h4">Pacemaker Monitoring</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Heart Rate</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <HeartPulseIcon sx={{ color: themeColors.textSecondary }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{pacemakerData.heartRate}</Typography>
                      <Typography variant="body2" color="text.secondary">bpm</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Battery Status</Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mt: 2 }}>
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        sx={{ color: '#E2E8F0', position: 'absolute' }}
                        size={80}
                        thickness={4}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={pacemakerData.batteryStatus}
                        sx={{ color: themeColors.primary }}
                        size={80}
                        thickness={4}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                          {pacemakerData.batteryStatus}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Pacing Mode</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{pacemakerData.pacingMode}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Lead Status</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{pacemakerData.leadStatus}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {/* 2. Real-Time Vitals Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderTopColor: themeColors.secondary }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ActivityIcon sx={{ color: themeColors.secondary }} />
                    <Typography variant="h4">Real-Time Vitals</Typography>
                    {vitals && (
                      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2, typography: 'body2', color: themeColors.textSecondary }}>
                        <Typography component="span" sx={{ color: vitals.heartRate > 90 ? themeColors.danger : themeColors.success }}>
                          HR: <Box component="span" sx={{ fontWeight: 'bold' }}>{vitals.heartRate}</Box> bpm
                        </Typography>
                        <Typography component="span" sx={{ color: parseInt(vitals.bloodPressure.split('/')[0]) > 130 || parseInt(vitals.bloodPressure.split('/')[1]) > 90 ? themeColors.danger : themeColors.success }}>
                          BP: <Box component="span" sx={{ fontWeight: 'bold' }}>{vitals.bloodPressure}</Box>
                        </Typography>
                        <Typography component="span" sx={{ color: vitals.spO2 < 95 ? themeColors.danger : themeColors.success }}>
                          SpO2: <Box component="span" sx={{ fontWeight: 'bold' }}>{vitals.spO2}%</Box>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
              />
              <CardContent sx={{ height: 250, p: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsHistory} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
                    <XAxis dataKey="time" stroke={themeColors.textSecondary} />
                    <YAxis stroke={themeColors.textSecondary} />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartRate" stroke={themeColors.danger} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          {/* 3. Patient Overview Panel - Collapsible */}
          <Grid item xs={12} md={6} lg={4}>
            <Accordion expanded={collapsibleStates.patientHub} onChange={() => setCollapsibleStates(s => ({ ...s, patientHub: !s.patientHub }))} sx={{ borderTopColor: themeColors.info }}>
              <AccordionSummary expandIcon={<ChevronDownIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UsersIcon sx={{ color: themeColors.info }} />
                  <Typography variant="h4">Assigned Patients</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search patients..."
                    value={patientSearchTerm}
                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                  />
                  <Box sx={{ height: 200, overflowY: 'auto', pr: 1 }}>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p) => (
                        <Box key={p.id} id={`patient-${p.id}`} sx={{ p: 2, mb: 2, borderRadius: 1, '&:hover': { backgroundColor: 'action.hover' } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{p.name} - ({p.id})</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedPatientForNote(p);
                                  setIsAddNoteDialogOpen(true);
                                }}
                                sx={{ color: themeColors.info, border: `1px solid ${themeColors.info}` }}
                              >
                                <ClipboardPenIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton size="small" sx={{ color: themeColors.primary, border: `1px solid ${themeColors.primary}` }}><PhoneCallIcon sx={{ fontSize: 16 }} /></IconButton>
                              <IconButton size="small" sx={{ color: themeColors.textSecondary, border: `1px solid ${themeColors.textSecondary}` }}><FileTextIcon sx={{ fontSize: 16 }} /></IconButton>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">Pacemaker: {p.pacemakerId}</Typography>
                          <Typography variant="body2" color="text.secondary">History: {p.history}</Typography>
                          <Divider sx={{ my: 1, backgroundColor: '#E2E8F0' }}/>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>No patients found.</Typography>
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
          {/* 4. Critical Alerts */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ borderTopColor: themeColors.danger }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertTriangleIcon sx={{ color: themeColors.danger }} />
                    <Typography variant="h4">Critical Alerts</Typography>
                  </Box>
                }
              />
              <CardContent>
                {criticalAlerts.length > 0 ? (
                  criticalAlerts.map(alert => (
                    <Box key={alert.id} onClick={() => handleAlertClick(alert.patientId)} sx={{ p: 2, borderLeft: `4px solid ${themeColors.danger}`, borderRadius: 1, mb: 1, cursor: 'pointer', backgroundColor: 'rgba(214, 48, 49, 0.1)', color: themeColors.danger }}>
                      <Typography variant="body2">{alert.message}</Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 2, borderLeft: `4px solid ${themeColors.success}`, borderRadius: 1, backgroundColor: 'rgba(76, 175, 80, 0.1)', color: themeColors.success }}>
                    <Typography variant="body2">No critical alerts detected.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* 5. Medication & Care Schedule - Collapsible */}
          <Grid item xs={12} md={6} lg={4}>
            <Accordion expanded={collapsibleStates.medicationSchedule} onChange={() => setCollapsibleStates(s => ({ ...s, medicationSchedule: !s.medicationSchedule }))} sx={{ borderTopColor: themeColors.primary }}>
              <AccordionSummary expandIcon={<ChevronDownIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PillIcon sx={{ color: themeColors.primary }} />
                  <Typography variant="h4">Medication Schedule</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search medications..."
                    value={medicationSearchTerm}
                    onChange={(e) => setMedicationSearchTerm(e.target.value)}
                  />
                  <Box sx={{ height: 200, overflowY: 'auto', pr: 1 }}>
                    {filteredMedications.length > 0 ? (
                      filteredMedications.map(m => (
                        <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{m.name} ({m.dose})</Typography>
                            <Typography variant="body2" color="text.secondary">Patient: {m.patientId} - Due: {m.time}</Typography>
                          </Box>
                          <Button
                            variant={m.status === 'administered' ? 'outlined' : 'contained'}
                            onClick={() => handleMedicationAdministered(m.id, m.name, m.patientId)}
                            disabled={m.status === 'administered'}
                            color={m.status === 'administered' ? 'secondary' : 'primary'}
                            size="small"
                          >
                            {m.status === 'administered' ? 'Administered' : 'Administer'}
                          </Button>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>No medications found.</Typography>
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
          {/* 6. Nurse Task List */}
          <Grid item xs={12} md={6} lg={4}>
            <Accordion expanded={collapsibleStates.tasks} onChange={() => setCollapsibleStates(s => ({ ...s, tasks: !s.tasks }))} sx={{ borderTopColor: themeColors.accent }}>
              <AccordionSummary expandIcon={<ChevronDownIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ClipboardListIcon sx={{ color: themeColors.accent }} />
                  <Typography variant="h4">Daily Tasks</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ height: 250, overflowY: 'auto', pr: 1 }}>
                  {tasks.length > 0 ? (
                    tasks.map(task => (
                      <Box key={task.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, gap: 1 }}>
                        <Checkbox
                          checked={task.complete}
                          onChange={() => handleTaskToggle(task.id, task.complete)}
                          color="primary"
                          sx={{ p: 0 }}
                        />
                        <Box sx={{ flexGrow: 1, opacity: task.complete ? 0.6 : 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body1" sx={{ textDecoration: task.complete ? 'line-through' : 'none' }}>
                              {task.text}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Patient: {task.patientId}
                          </Typography>
                          <Chip
                            label={task.priority}
                            size="small"
                            sx={{
                              mt: 1,
                              backgroundColor: getTaskPriorityColor(task.priority),
                              color: 'white',
                              textTransform: 'capitalize'
                            }}
                          />
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>No tasks for today.</Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
          {/* 7. Chat with Doctors */}
          <Grid item xs={12} md={6} lg={4}>
            <Accordion expanded={collapsibleStates.chat} onChange={() => setCollapsibleStates(s => ({ ...s, chat: !s.chat }))} sx={{ borderTopColor: themeColors.primary }}>
              <AccordionSummary expandIcon={<ChevronDownIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageCircleIcon sx={{ color: themeColors.primary }} />
                  <Typography variant="h4">Team Chat</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', height: 300, p: 0 }}>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                  {chatMessages.map(msg => (
                    <Box key={msg.id} sx={{ textAlign: msg.sender === 'Nurse' ? 'right' : 'left', mb: 1 }}>
                      <Chip
                        label={msg.message}
                        size="small"
                        sx={{
                          backgroundColor: msg.sender === 'Nurse' ? themeColors.primary : themeColors.secondary,
                          color: 'white',
                          maxWidth: '80%',
                          height: 'auto',
                          py: 1,
                          whiteSpace: 'normal',
                        }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', color: themeColors.textSecondary }}>
                        {msg.timestamp.toLocaleTimeString()} - {msg.sender}
                      </Typography>
                    </Box>
                  ))}
                  <div ref={chatMessagesEndRef} />
                </Box>
                <Divider />
                <Box component="form" onSubmit={handleSendMessage} sx={{ p: 1, display: 'flex', gap: 1 }}>
                  <TextField fullWidth size="small" variant="outlined" placeholder="Type a message..." inputRef={chatInputRef} />
                  <Button type="submit" variant="contained" color="primary">Send</Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
          {/* 8. Education & Training Hub */}
          <Grid item xs={12} md={6} lg={8}>
            <Accordion expanded={collapsibleStates.educationHub} onChange={() => setCollapsibleStates(s => ({ ...s, educationHub: !s.educationHub }))} sx={{ borderTopColor: themeColors.info }}>
              <AccordionSummary expandIcon={<ChevronDownIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookOpenIcon sx={{ color: themeColors.info }} />
                  <Typography variant="h4">Education Hub</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Topics</Typography>
                    <Box sx={{ height: 250, overflowY: 'auto', pr: 1 }}>
                      {educationTopics.map(topic => (
                        <Box
                          key={topic.id}
                          onClick={() => handleEducationItemClick(topic.description)}
                          sx={{
                            p: 2,
                            mb: 1,
                            backgroundColor: selectedEducationDescription === topic.description ? 'action.selected' : 'transparent',
                            borderRadius: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">{topic.title}</Typography>
                            <ChevronRightIcon sx={{ color: 'action.active' }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Details</Typography>
                    <Card variant="outlined" sx={{ minHeight: 250, p: 2, border: `1px solid ${theme.palette.divider}` }}>
                      {selectedEducationDescription ? (
                        <Typography variant="body2">{selectedEducationDescription}</Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Select a topic to view its description.</Typography>
                      )}
                    </Card>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          {/* 9. Device Status */}
          <Grid item xs={12} md={6} lg={4}>
            <Accordion expanded={collapsibleStates.deviceStatus} onChange={() => setCollapsibleStates(s => ({ ...s, deviceStatus: !s.deviceStatus }))} sx={{ borderTopColor: themeColors.primary }}>
              <AccordionSummary expandIcon={<ChevronDownIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StethoscopeIcon sx={{ color: themeColors.primary }} />
                  <Typography variant="h4">Device Status</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body1"><strong>Model:</strong> {deviceStatus.model}</Typography>
                  <Typography variant="body1"><strong>Firmware:</strong> {deviceStatus.firmware}</Typography>
                  <Typography variant="body1"><strong>Last Update:</strong> {deviceStatus.lastUpdate}</Typography>
                  <Typography variant="body1"><strong>Next Maintenance:</strong> {deviceStatus.nextMaintenance}</Typography>
                </Card>
              </AccordionDetails>
            </Accordion>
          </Grid>
          {/* 10. Patient Notes */}
          <Grid item xs={12} md={6} lg={4}>
            <Accordion expanded={collapsibleStates.notes} onChange={() => setCollapsibleStates(s => ({ ...s, notes: !s.notes }))} sx={{ borderTopColor: themeColors.secondary }}>
              <AccordionSummary expandIcon={<ChevronDownIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ClipboardPenIcon sx={{ color: themeColors.secondary }} />
                  <Typography variant="h4">Patient Notes</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ height: 250, overflowY: 'auto', pr: 1 }}>
                  {Object.keys(notes).map(patientId => (
                    <Box key={patientId} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Patient {patientId}:</Typography>
                      {notes[patientId].map((note, index) => (
                        <Card key={index} variant="outlined" sx={{ p: 1, mb: 1, backgroundColor: 'background.default' }}>
                          <Typography variant="body2">{note.text}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
                            {note.timestamp.toLocaleString()}
                          </Typography>
                        </Card>
                      ))}
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default App;