// src/components/TechnicianDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, TextField, List, ListItem,
  ListItemText, Chip, Tabs, Tab, Alert, Paper, FormControl, InputLabel,
  Select, MenuItem, Slider, IconButton, ListSubheader, Collapse, Dialog, DialogTitle, DialogContent, DialogActions,
  Drawer, Badge, AppBar, Toolbar, LinearProgress, CircularProgress, Snackbar, Tooltip,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  DevicesOther as DevicesIcon, SystemUpdateAlt as FirmwareIcon, Science as DiagnosticsIcon,
  Tune as CalibrationIcon, Description as ReportsIcon, Error as ErrorIcon,
  Group as PatientsIcon, CloudUpload as UploadIcon, Search as SearchIcon,
  Schedule as ScheduleIcon, History as HistoryIcon, PlayArrow as PlayIcon,
  Visibility as VisibilityIcon, Assignment as AssignIcon, Dvr as DvrIcon, 
  Logout as LogoutIcon, ArrowForwardIos as ExpandMoreIcon, Notifications as NotificationsIcon, 
  Update as UpdateIcon, Replay as ReplayIcon, Assessment as AssessmentIcon, 
  LocalHospital as LocalHospitalIcon, Terminal as TerminalIcon, FileDownload as FileDownloadIcon,
  Description as DescriptionIcon, Science as ScienceIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';


// --- Mock data for the dashboard. This simulates a backend data source. ---
const BACKEND_URL = 'http://localhost:5000';

const mockData = {
  devices: [
    { id: 'S/N-PMC-001', model: 'CardioPulse X', patientId: 'PAT-101', status: 'Active', health: 'good', lat: 34.0522, lng: -118.2437 },
    { id: 'S/N-PMC-002', model: 'BioSync 5000', patientId: 'PAT-102', status: 'Needs Attention', health: 'warning', lat: 40.7128, lng: -74.0060 },
    { id: 'S/N-PMC-003', model: 'CardioPulse X', patientId: 'PAT-103', status: 'Offline', health: 'critical', lat: 38.9072, lng: -77.0369 },
  ],
  firmwareUpdates: [], // loaded from blockchain — see useEffect below
  diagnosticResults: [],
  errorLogs: [
    { id: 1, type: 'Hardware Malfunction', message: 'Lead-II impedance out of range.', deviceId: 'S/N-PMC-002', timestamp: '2023-04-22T10:30:00Z' },
    { id: 2, type: 'Connectivity Failure', message: 'Device connection lost for 5 minutes.', deviceId: 'S/N-PMC-003', timestamp: '2023-04-22T09:15:00Z' },
  ],
  securityLogs: [
    { id: 1, user: 'John Doe', action: 'Accessed Diagnostics', deviceId: 'S/N-PMC-001', timestamp: '2023-04-22T10:45:00Z' },
    { id: 2, user: 'Technician A', action: 'Attempted to change patient settings (blocked)', deviceId: 'S/N-PMC-001', timestamp: '2023-04-22T10:40:00Z' },
  ],
  reports: [
    { id: 1, name: 'Monthly Health Report - PMC-001', date: '2023-04-01', type: 'system' },
    { id: 2, name: 'Service Log - Hospital Visit', date: '2023-03-25', type: 'system' },
  ],
  patients: [
    { id: 'PAT-101', name: 'Alice Smith', deviceId: 'S/N-PMC-001', history: 'Diagnosed with Bradycardia, received pacemaker implant on 03/20/2023. No prior complications.', notes: 'Patient has a history of mild hypertension. Ensure regular check-ins.' },
    { id: 'PAT-102', name: 'Bob Johnson', deviceId: 'S/N-PMC-002', history: 'Ventricular fibrillation. Implanted with BioSync 5000 on 05/10/2022.', notes: 'Requires careful monitoring. Device flagged for recent voltage fluctuations.' },
    { id: 'PAT-103', name: 'Charlie Brown', deviceId: 'S/N-PMC-003', history: 'Atrial flutter, pacemaker implant on 01/05/2023.', notes: 'Device is currently offline; troubleshooting is required.' },
  ],
  predictiveAlerts: [
    { id: 1, deviceId: 'S/N-PMC-002', message: 'Low battery usage trending abnormally. Expected battery failure within 90 days.', type: 'Battery Degradation' }
  ]
};

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && (<Box sx={{ p: 3 }}>{children}</Box>)}
    </div>
  );
}

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [firmwareFile, setFirmwareFile] = useState(null);
  const [firmwareScheduleTime, setFirmwareScheduleTime] = useState('');
  const [calibrationValues, setCalibrationValues] = useState({ sensitivity: 50, amplitude: 5.0, width: 0.5 });
  const [liveTelemetry, setLiveTelemetry] = useState(null);
  // Removed the unused 'telemetryData' state variable
  const [telemetryInterval, setTelemetryInterval] = useState(null);
  const [currentHeartRate, setCurrentHeartRate] = useState(72);
  const [signalQuality, setSignalQuality] = useState('Stable');
  const [expandedDiagnostics, setExpandedDiagnostics] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(mockData.diagnosticResults);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alerts] = useState([
    { id: 1, text: 'Low battery on device S/N-PMC-001', severity: 'warning' },
    { id: 2, text: 'Signal abnormal on device S/N-PMC-002', severity: 'error' },
  ]);
  const [deviceStatus, setDeviceStatus] = useState({
    signal: 85,
    battery: 65,
    lastSync: new Date().toLocaleTimeString(),
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(mockData.devices[0].id);
  const [selectedPatient, setSelectedPatient] = useState(mockData.patients[0].id);
  const [deviceAssignments, setDeviceAssignments] = useState(
    mockData.devices.reduce((acc, device) => {
      acc[device.id] = device.patientId;
      return acc;
    }, {})
  );
  const [lastAssignedDevice, setLastAssignedDevice] = useState(null);
  const [lastCommandStatus, setLastCommandStatus] = useState(null);
  const [testPulseStatus, setTestPulseStatus] = useState(null);
  const [testPulseDevice, setTestPulseDevice] = useState(mockData.devices[0].id);
  const [calibrationDevice, setCalibrationDevice] = useState(mockData.devices[0].id);
  const [dynamicReports, setDynamicReports] = useState([]);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportFilter, setReportFilter] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [firmwareUpdateOutput, setFirmwareUpdateOutput] = useState(null);
  const [firmwareUpdates, setFirmwareUpdates] = useState([]);

  useEffect(() => {
    const fetchFirmware = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/firmware-updates`);
        const data = await res.json();
        setFirmwareUpdates(data.updates || []);
      } catch (err) {
        console.warn('Could not load firmware updates from backend:', err.message);
      }
    };
    fetchFirmware();
  }, []);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

  const theme = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceStatus({
        signal: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
        battery: Math.floor(Math.random() * (90 - 40 + 1)) + 40,
        lastSync: new Date().toLocaleTimeString(),
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const allReports = [...mockData.reports, ...dynamicReports].sort((a, b) => new Date(b.date) - new Date(a.date));
    const filtered = allReports.filter(report =>
      report.name.toLowerCase().includes(reportFilter.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [reportFilter, dynamicReports]);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleTabChange = (event, newValue) => { setTab(newValue); };
  const handleFileUpload = (event) => { setFirmwareFile(event.target.files[0]); };
  const handleCalibrationChange = (prop) => (event, newValue) => { setCalibrationValues({ ...calibrationValues, [prop]: newValue }); };
  
  const handleRunDiagnostics = () => {
    showSnackbar('Diagnostic tests initiated.');
    setDiagnosticResults(null);
    setTimeout(() => {
      setDiagnosticResults([
        { test: 'Voltage Level Check', status: 'Pass' },
        { test: 'Electrode Connectivity', status: 'Pass' },
        { test: 'Device Responsiveness', status: 'Pass', details: 'Ping time 25ms' },
      ]);
      showSnackbar('Diagnostic tests completed successfully.');
    }, 2000);
  };

  const handleStartTelemetry = () => {
    showSnackbar('Live telemetry started.');
    setLiveTelemetry(true);
    const intervalId = setInterval(() => {
      const newRate = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
      setCurrentHeartRate(newRate);
      setSignalQuality(newRate > 85 ? 'Warning' : 'Stable');
      // Removed telemetryData state update as it's no longer used
    }, 1000);
    setTelemetryInterval(intervalId);
  };
  
  const handleStopTelemetry = () => {
    showSnackbar('Live telemetry stopped.');
    setLiveTelemetry(false);
    clearInterval(telemetryInterval);
    setTelemetryInterval(null);
  };
  
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const handleExecuteCommand = (commandName) => {
    setLastCommandStatus({ name: commandName, status: 'executing' });
    console.log(`Executing command: ${commandName}`);
    setTimeout(() => {
      setLastCommandStatus({ name: commandName, status: 'success' });
      setTimeout(() => {
        setLastCommandStatus(null);
      }, 5000);
    }, 2000);
  };

  const handleApplyCalibration = (deviceId) => {
    showSnackbar(`Calibration settings for **${deviceId}** applied successfully!`);
    console.log(`Applied calibration values for device ${deviceId}:`, calibrationValues);
    setDynamicReports(prevReports => [
      ...prevReports,
      {
        id: Date.now(),
        name: `Calibration applied for ${deviceId}`,
        date: new Date().toISOString().split('T')[0],
        type: 'calibration',
        details: calibrationValues
      }
    ]);
  };

  const handleSubmitManualReport = () => {
    showSnackbar('Manual report submitted successfully!');
    setDynamicReports(prevReports => [
      ...prevReports,
      {
        id: Date.now(),
        name: `Manual report submitted`,
        date: new Date().toISOString().split('T')[0],
        type: 'manual',
        details: { message: 'A manual report was submitted by the technician.' }
      }
    ]);
  };
  
  const handleSendTestPulse = (deviceId) => {
    setTestPulseStatus('sending');
    console.log(`Sending test pulse to device: ${deviceId}...`);
    setTimeout(() => {
      setTestPulseStatus('received');
      setTimeout(() => {
        setTestPulseStatus(null);
      }, 4000);
    }, 2000);
  };
  
  const handleScheduleFirmwareUpdate = () => {
    if (firmwareFile && firmwareScheduleTime) {
      setIsUpdating(true);
      setFirmwareUpdateOutput(null);
      setTimeout(() => {
        setIsUpdating(false);
        const outputMessage = `Firmware update for file "${firmwareFile.name}" scheduled for ${firmwareScheduleTime}.`;
        showSnackbar(outputMessage);
        setFirmwareUpdateOutput({
          message: outputMessage,
          file: firmwareFile.name,
          time: firmwareScheduleTime,
          device: selectedDevice
        });
        setDynamicReports(prevReports => [
          ...prevReports,
          {
            id: Date.now(),
            name: `Firmware update scheduled for ${selectedDevice}`,
            date: new Date().toISOString().split('T')[0],
            type: 'firmware',
            details: { file: firmwareFile.name, time: firmwareScheduleTime }
          }
        ]);
      }, 3000);
    } else {
      showSnackbar('Please select a file and a time to schedule the update.');
    }
  };

  const handleAssignDevice = () => {
    const newAssignments = { ...deviceAssignments, [selectedDevice]: selectedPatient };
    setDeviceAssignments(newAssignments);
    setLastAssignedDevice({
      deviceId: selectedDevice,
      patientId: selectedPatient,
      patientName: mockData.patients.find(p => p.id === selectedPatient).name
    });
    showSnackbar(`Device ${selectedDevice} successfully assigned to patient ${selectedPatient}.`);
  };

  const handleViewReportDetails = (report) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  const handleCloseReportDetails = () => {
    setShowReportDetails(false);
    setSelectedReport(null);
  };

  const handleExportReports = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredReports, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "technician_reports.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showSnackbar('Reports exported successfully!');
  };

  const handleViewPatientDetails = (patient) => {
    setSelectedPatientDetails(patient);
    setShowPatientDetails(true);
  };

  const handleClosePatientDetails = () => {
    setShowPatientDetails(false);
    setSelectedPatientDetails(null);
  };


  return (
    <Box sx={{ flexGrow: 1, bgcolor: theme.palette.background.default, p: 3, pt: 10 }}>
      <AppBar position="fixed" color="primary" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 2 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Pacemaker Technician Dashboard
          </Typography>
          <Tooltip title="Update All Devices"><IconButton color="inherit" onClick={() => showSnackbar('Updating all devices...')}>
            <UpdateIcon />
          </IconButton></Tooltip>
          <Tooltip title="Restart System"><IconButton color="inherit" onClick={() => showSnackbar('Restarting system...')}>
            <ReplayIcon />
          </IconButton></Tooltip>
          <Tooltip title="Run Diagnostics"><IconButton color="inherit" onClick={() => showSnackbar('Running diagnostics...')}>
            <AssessmentIcon />
          </IconButton></Tooltip>
          <Tooltip title="View Alerts"><IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
            <Badge badgeContent={alerts.length + mockData.predictiveAlerts.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton></Tooltip>
          <Tooltip title="Logout"><IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton></Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 300 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Alerts</Typography>
          <List>
            {mockData.predictiveAlerts && mockData.predictiveAlerts.map(alert => (
                <ListItem key={`predictive-${alert.id}`} divider>
                    <Alert severity="warning" sx={{ width: '100%' }}>
                        <Typography variant="subtitle2">**Predictive Maintenance Alert**</Typography>
                        <Typography variant="body2">{alert.message}</Typography>
                    </Alert>
                </ListItem>
            ))}
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <ListItem key={`device-alert-${alert.id}`} divider>
                  <Alert severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.text}
                  </Alert>
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No new alerts.</Typography>
            )}
          </List>
        </Box>
      </Drawer>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="h6">Critical Alert: Lead-II impedance out of range on device **S/N-PMC-002**</Typography>
        <Typography variant="body2">Check the Error & Alert Logs for more details.</Typography>
      </Alert>

      {mockData.predictiveAlerts.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="h6">Predictive Maintenance Alert</Typography>
              <Typography variant="body1">{mockData.predictiveAlerts[0].message}</Typography>
          </Alert>
      )}

      <Paper sx={{ mb: 3 }} elevation={3}>
        <Tabs value={tab} onChange={handleTabChange} aria-label="Technician dashboard tabs" centered>
          <Tab icon={<DevicesIcon />} label="Devices" />
          <Tab icon={<FirmwareIcon />} label="Firmware" />
          <Tab icon={<DiagnosticsIcon />} label="Diagnostics" />
          <Tab icon={<CalibrationIcon />} label="Calibration" />
          <Tab icon={<ReportsIcon />} label="Reports" />
          <Tab icon={<PatientsIcon />} label="Patients" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        <CustomTabPanel value={tab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><LocalHospitalIcon sx={{ mr: 1 }} /><Typography variant="h6">Live Pacemaker Status</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ minWidth: 150 }}>Signal Strength:</Typography>
                  <LinearProgress variant="determinate" value={deviceStatus.signal} sx={{ flexGrow: 1, mr: 2 }} />
                  <Typography>{deviceStatus.signal}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ minWidth: 150 }}>Battery Status:</Typography>
                  <CircularProgress variant="determinate" value={deviceStatus.battery} sx={{ mr: 2 }} />
                  <Typography>{deviceStatus.battery}%</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Last Synced: {deviceStatus.lastSync}</Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><LocalHospitalIcon sx={{ mr: 1 }} /><Typography variant="h6">Device Health Map</Typography></Box>
                <Box sx={{ height: 250, bgcolor: theme.palette.grey[200], display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    Interactive Map Coming Soon...
                  </Typography>
                </Box>
                <List subheader={<ListSubheader>All Pacemaker Devices</ListSubheader>}>
                  {mockData.devices.map(device => (
                    <ListItem key={device.id}>
                      <ListItemText primary={`${device.id} - ${device.model}`} secondary={`Status: ${device.status}`} />
                      <Chip label={device.health} color={device.health === 'good' ? 'success' : device.health === 'warning' ? 'warning' : 'error'} size="small" />
                    </ListItem>
                  ))}
                </List>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><DevicesIcon sx={{ mr: 1 }} /><Typography variant="h6">Device Management</Typography></Box>
                <TextField fullWidth variant="outlined" placeholder="Search by Serial Number or QR Code..." sx={{ mb: 2 }} InputProps={{ endAdornment: <SearchIcon /> }} />
              </CardContent></Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><PatientsIcon sx={{ mr: 1 }} /><Typography variant="h6">Patient-Device Association</Typography></Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Device</InputLabel>
                  <Select value={selectedDevice} label="Select Device" onChange={(e) => setSelectedDevice(e.target.value)}>
                    {mockData.devices.map(device => (<MenuItem key={device.id} value={device.id}>{device.id} - {device.model}</MenuItem>))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Patient</InputLabel>
                  <Select value={selectedPatient} label="Select Patient" onChange={(e) => setSelectedPatient(e.target.value)}>
                    {mockData.patients && mockData.patients.map(patient => (<MenuItem key={patient.id} value={patient.id}>{patient.name} ({patient.id})</MenuItem>))}
                  </Select>
                </FormControl>

                <Button variant="contained" fullWidth startIcon={<AssignIcon />} onClick={handleAssignDevice}>Assign Device</Button>

                {lastAssignedDevice && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Device **{lastAssignedDevice.deviceId}** is now assigned to **{lastAssignedDevice.patientName}**.
                    </Alert>
                )}
              </CardContent></Card>
            </Grid>
          </Grid>
        </CustomTabPanel>

        <CustomTabPanel value={tab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><ScheduleIcon sx={{ mr: 1 }} /><Typography variant="h6">Firmware Update Scheduler</Typography></Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Device</InputLabel>
                  <Select label="Select Device" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
                    {mockData.devices.map(device => (<MenuItem key={device.id} value={device.id}>{device.id}</MenuItem>))}
                  </Select>
                </FormControl>
                <Button variant="outlined" component="label" fullWidth startIcon={<UploadIcon />}>
                  Upload Firmware File
                  <input type="file" hidden onChange={handleFileUpload} />
                </Button>
                {firmwareFile && <Alert severity="info" sx={{ mt: 2 }}>File selected: **{firmwareFile.name}**</Alert>}
                <TextField 
                  label="Schedule Update Time" 
                  type="datetime-local" 
                  InputLabelProps={{ shrink: true }}
                  fullWidth 
                  sx={{ mt: 2 }}
                  value={firmwareScheduleTime}
                  onChange={(e) => setFirmwareScheduleTime(e.target.value)}
                />
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2 }} 
                  startIcon={<ScheduleIcon />} 
                  disabled={!firmwareFile || !firmwareScheduleTime || isUpdating} 
                  onClick={handleScheduleFirmwareUpdate}
                >
                  {isUpdating ? 'Scheduling...' : 'Schedule Update'}
                </Button>
                {isUpdating && <LinearProgress sx={{ mt: 2 }} />}
                {firmwareUpdateOutput && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        <Typography variant="body1">**Update Scheduled!**</Typography>
                        <Typography variant="body2">**Device:** {firmwareUpdateOutput.device}</Typography>
                        <Typography variant="body2">**File:** {firmwareUpdateOutput.file}</Typography>
                        <Typography variant="body2">**Time:** {firmwareUpdateOutput.time}</Typography>
                    </Alert>
                )}
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><HistoryIcon sx={{ mr: 1 }} /><Typography variant="h6">Update History</Typography></Box>
                <List>
                  {firmwareUpdates.map((update, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={`Device: ${update.deviceId} — Version: ${update.firmwareVersion}`}
                        secondary={`Updated by: ${update.updatedBy?.slice(0, 16)}... | ${new Date(update.timestamp * 1000).toLocaleString()}`}
                      />
                      <Chip label="Success" color="success" size="small" />
                    </ListItem>
                  ))}
                </List>
              </CardContent></Card>
            </Grid>
          </Grid>
        </CustomTabPanel>

        <CustomTabPanel value={tab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><DiagnosticsIcon sx={{ mr: 1 }} /><Typography variant="h6">Diagnostics</Typography></Box>
                <Button variant="contained" fullWidth sx={{ mb: 2 }} startIcon={<PlayIcon />} onClick={handleRunDiagnostics}>Run Diagnostic Tests</Button>
                
                {diagnosticResults === null && (
                  <Box sx={{ mt: 2 }}><LinearProgress /></Box>
                )}
                {diagnosticResults && diagnosticResults.length > 0 && (
                  <Alert severity="success">
                    <Typography variant="body1">Diagnostic tests completed successfully.</Typography>
                    <List dense>
                      {diagnosticResults.map((result, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={result.test} secondary={result.details} />
                          <Chip label={result.status} color="success" size="small" />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}

                <Button variant="outlined" fullWidth onClick={() => setExpandedDiagnostics(!expandedDiagnostics)}>
                  View Detailed Logs
                  <ExpandMoreIcon sx={{ transform: expandedDiagnostics ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </Button>
                <Collapse in={expandedDiagnostics} timeout="auto" unmountOnExit>
                  <Paper sx={{ mt: 2, p: 2, bgcolor: theme.palette.grey[200] }}>
                    <Typography variant="body2">**Voltage Level Check:** Pass</Typography>
                    <Typography variant="body2">**Electrode Connectivity:** Pass</Typography>
                    <Typography variant="body2">**Device Responsiveness:** Ping time 25ms</Typography>
                  </Paper>
                </Collapse>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><TerminalIcon sx={{ mr: 1 }} /><Typography variant="h6">Command Execution Panel</Typography></Box>
                <List disablePadding>
                  {['Restart Device', 'Run Diagnostics', 'Reset Network'].map((command, index) => (
                    <Paper key={index} sx={{ mb: 1, overflow: 'hidden' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, '&:hover': { bgcolor: theme.palette.grey[50] } }}>
                        <ListItemText primary={command} />
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => handleExecuteCommand(command)}
                        >
                          Execute
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </List>
                {lastCommandStatus && (
                  <Box sx={{ mt: 2 }}>
                    {lastCommandStatus.status === 'executing' && (
                      <Alert severity="info" icon={false}>
                        <Typography variant="body2">Executing command: **{lastCommandStatus.name}**</Typography>
                        <LinearProgress sx={{ mt: 1 }} />
                      </Alert>
                    )}
                    {lastCommandStatus.status === 'success' && (
                      <Alert severity="success">
                        Command **{lastCommandStatus.name}** executed successfully.
                      </Alert>
                    )}
                  </Box>
                )}
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><DvrIcon sx={{ mr: 1 }} /><Typography variant="h6">Live Telemetry</Typography></Box>
                {liveTelemetry ? (
                  <Button variant="outlined" fullWidth color="error" onClick={handleStopTelemetry}>
                    Stop Telemetry
                  </Button>
                ) : (
                  <Button variant="contained" fullWidth onClick={handleStartTelemetry}>
                    Start Telemetry
                  </Button>
                )}
                {liveTelemetry && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      **Current Heart Rate:** {currentHeartRate} bpm
                    </Typography>
                    <Typography variant="body1">
                      **Signal Quality:** {signalQuality}
                    </Typography>
                  </Box>
                )}
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card><CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><ErrorIcon sx={{ mr: 1 }} /><Typography variant="h6">Error & Alert Logs</Typography></Box>
                    <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {mockData.errorLogs.map(log => (
                            <ListItem key={log.id} disablePadding sx={{ mb: 1, borderLeft: `4px solid ${theme.palette.error.main}`, pl: 1 }}>
                                <ListItemText 
                                    primary={log.type} 
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="text.primary">
                                                {log.message}
                                            </Typography>
                                            <br />
                                            <Typography component="span" variant="caption" color="text.secondary">
                                                Device: {log.deviceId} - Time: {new Date(log.timestamp).toLocaleString()}
                                            </Typography>
                                        </>
                                    } 
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent></Card>
            </Grid>
          </Grid>
        </CustomTabPanel>
        
        <CustomTabPanel value={tab} index={3}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card><CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><CalibrationIcon sx={{ mr: 1 }} /><Typography variant="h6">Pacing Parameter Calibration</Typography></Box>
                        
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Device for Calibration</InputLabel>
                            <Select value={calibrationDevice} label="Select Device for Calibration" onChange={(e) => setCalibrationDevice(e.target.value)}>
                                {mockData.devices.map(device => (<MenuItem key={device.id} value={device.id}>{device.id}</MenuItem>))}
                            </Select>
                        </FormControl>

                        <Typography gutterBottom>Pacing Sensitivity ({calibrationValues.sensitivity}%)</Typography>
                        <Slider 
                            value={calibrationValues.sensitivity} 
                            onChange={handleCalibrationChange('sensitivity')} 
                            aria-labelledby="sensitivity-slider" 
                            valueLabelDisplay="auto" 
                            min={0} max={100} step={1}
                        />

                        <Typography gutterBottom>Amplitude ({calibrationValues.amplitude}V)</Typography>
                        <Slider 
                            value={calibrationValues.amplitude} 
                            onChange={handleCalibrationChange('amplitude')} 
                            aria-labelledby="amplitude-slider" 
                            valueLabelDisplay="auto" 
                            min={0.1} max={10.0} step={0.1}
                        />

                        <Typography gutterBottom>Pulse Width ({calibrationValues.width}ms)</Typography>
                        <Slider 
                            value={calibrationValues.width} 
                            onChange={handleCalibrationChange('width')} 
                            aria-labelledby="width-slider" 
                            valueLabelDisplay="auto" 
                            min={0.1} max={2.0} step={0.1}
                        />
                        
                        <Button variant="contained" fullWidth onClick={() => handleApplyCalibration(calibrationDevice)} sx={{ mt: 2 }}>
                            Apply Calibration to Device
                        </Button>
                    </CardContent></Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card><CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><ScienceIcon sx={{ mr: 1 }} /><Typography variant="h6">Test Pulse</Typography></Box>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Device for Test</InputLabel>
                            <Select value={testPulseDevice} label="Select Device for Test" onChange={(e) => setTestPulseDevice(e.target.value)}>
                                {mockData.devices.map(device => (<MenuItem key={device.id} value={device.id}>{device.id}</MenuItem>))}
                            </Select>
                        </FormControl>
                        <Button variant="outlined" fullWidth onClick={() => handleSendTestPulse(testPulseDevice)} disabled={testPulseStatus === 'sending'}>
                            {testPulseStatus === 'sending' ? 'Sending...' : 'Send Test Pulse'}
                        </Button>
                        {testPulseStatus && (
                            <Alert severity={testPulseStatus === 'received' ? 'success' : 'info'} sx={{ mt: 2 }}>
                                {testPulseStatus === 'sending' ? `Sending test pulse to ${testPulseDevice}...` : `Test pulse received from ${testPulseDevice}.`}
                            </Alert>
                        )}
                        <Divider sx={{ my: 2 }}/>
                        <Button variant="contained" fullWidth startIcon={<DescriptionIcon />} onClick={handleSubmitManualReport}>
                            Submit Manual Report
                        </Button>
                    </CardContent></Card>
                </Grid>
            </Grid>
        </CustomTabPanel>
        
        <CustomTabPanel value={tab} index={4}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ReportsIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6">Reports & History</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        size="small"
                                        placeholder="Filter reports..."
                                        value={reportFilter}
                                        onChange={(e) => setReportFilter(e.target.value)}
                                        InputProps={{
                                            startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1 }} />
                                        }}
                                    />
                                    <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={handleExportReports}>
                                        Export
                                    </Button>
                                </Box>
                            </Box>
                            <List>
                                {filteredReports.length > 0 ? (
                                    filteredReports.map(report => (
                                        <ListItem 
                                            key={report.id} 
                                            secondaryAction={
                                                <Button onClick={() => handleViewReportDetails(report)} startIcon={<VisibilityIcon />} size="small">
                                                    View
                                                </Button>
                                            }
                                        >
                                            <ListItemText 
                                                primary={report.name} 
                                                secondary={`Type: ${report.type} - Date: ${report.date}`} 
                                            />
                                            <Chip 
                                                label={report.type} 
                                                color={report.type === 'system' ? 'primary' : report.type === 'manual' ? 'secondary' : 'default'} 
                                                size="small" 
                                                sx={{ ml: 2 }}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No reports found matching your criteria." />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </CustomTabPanel>

        <CustomTabPanel value={tab} index={5}>
          <Grid container spacing={3}>
            {mockData.patients.map((patient) => (
              <Grid item xs={12} md={6} key={patient.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalHospitalIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">{patient.name}</Typography>
                      <Chip label={patient.deviceId} sx={{ ml: 'auto' }} />
                    </Box>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      **Patient ID:** {patient.id}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                      **History:** {patient.history}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
                      **Notes:** {patient.notes}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      onClick={() => handleViewPatientDetails(patient)}
                      startIcon={<VisibilityIcon />}
                    >
                      View Full Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CustomTabPanel>
      </Grid>
      
      <Dialog open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
          <Button onClick={confirmLogout} color="error" variant="contained">Logout</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={showReportDetails} onClose={handleCloseReportDetails} fullWidth maxWidth="sm">
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Box>
              <Typography variant="h6">{selectedReport.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Type: {selectedReport.type} | Date: {selectedReport.date}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {selectedReport.details ? (
                Object.entries(selectedReport.details).map(([key, value]) => (
                  <Typography key={key} variant="body2" sx={{ mb: 1 }}>
                    **{key}:** {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2">No detailed information available for this report.</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDetails}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={showPatientDetails} onClose={handleClosePatientDetails} fullWidth maxWidth="sm">
        <DialogTitle>Patient Details</DialogTitle>
        <DialogContent dividers>
          {selectedPatientDetails && (
            <Box>
              <Typography variant="h6">{selectedPatientDetails.name} ({selectedPatientDetails.id})</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" gutterBottom>
                **Device:** {selectedPatientDetails.deviceId}
              </Typography>
              <Typography variant="body1" gutterBottom>
                **Medical History:** {selectedPatientDetails.history}
              </Typography>
              <Typography variant="body1">
                **Technician Notes:** {selectedPatientDetails.notes}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePatientDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
            <ErrorIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default TechnicianDashboard;