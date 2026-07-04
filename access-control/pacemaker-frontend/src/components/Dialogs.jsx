//src/components/Dialogs.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem,
  Box, Typography, FormControlLabel, Checkbox,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const mockVitalsData = [
  { name: 'Day 1', heartRate: 75, spO2: 98 }, { name: 'Day 2', heartRate: 78, spO2: 99 },
  { name: 'Day 3', heartRate: 85, spO2: 97 }, { name: 'Day 4', heartRate: 80, spO2: 98 },
  { name: 'Day 5', heartRate: 79, spO2: 98 }, { name: 'Day 6', heartRate: 82, spO2: 99 },
  { name: 'Day 7', heartRate: 80, spO2: 98 },
];

const reportTypes = ['Lab Report', 'X-Ray', 'ECG', 'Blood Test', 'Other'];
const medicineOptions = ['Aspirin', 'Metoprolol', 'Lisinopril', 'Simvastatin'];

const Dialogs = ({
  openAddPatientDialog, handleCloseAddPatientDialog, newPatientForm, handleNewPatientFormChange, handleAddPatient,
  openUpdatePatientDialog, handleCloseUpdatePatientDialog, updatePatientForm, handleUpdatePatientFormChange, handleUpdatePatient,
  openReportDialog, setOpenReportDialog, patients, showSnackbar,
  openPrescriptionDialog, setOpenPrescriptionDialog, patients: patientListForRx,
  openPatientDetailsDialog, handleClosePatientDetailsDialog, selectedPatient,
  openBookAppointmentDialog, handleCloseBookAppointmentDialog, newAppointmentForm, handleNewAppointmentFormChange, handleBookAppointment
}) => {
  // Report Dialog State and Handlers
  const [reportForm, setReportForm] = useState({ patientId: '', reportType: '', notes: '', file: null });
  const handleReportFormChange = (e) => setReportForm({ ...reportForm, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setReportForm({ ...reportForm, file: e.target.files[0] });
  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportForm.patientId || !reportForm.reportType) {
      showSnackbar('Please select a patient and report type.', 'warning');
      return;
    }
    showSnackbar(`Report submitted for patient: ${patients.find(p => p.id === reportForm.patientId)?.name}`, 'success');
    setOpenReportDialog(false);
    setReportForm({ patientId: '', reportType: '', notes: '', file: null });
  };
  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
    setReportForm({ patientId: '', reportType: '', notes: '', file: null });
  };

  // Prescription Dialog State and Handlers
  const [prescriptionForm, setPrescriptionForm] = useState({ patientId: '', diagnosis: '', medicines: [] });
  const handlePrescriptionFormChange = (e) => setPrescriptionForm({ ...prescriptionForm, [e.target.name]: e.target.value });
  const handleMedicineChange = (e) => {
    const { value, checked } = e.target;
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: checked ? [...prev.medicines, value] : prev.medicines.filter(m => m !== value)
    }));
  };
  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    if (!prescriptionForm.patientId || !prescriptionForm.diagnosis || prescriptionForm.medicines.length === 0) {
      showSnackbar('Please fill all required fields for prescription.', 'warning');
      return;
    }
    showSnackbar(`Prescription submitted for patient: ${patientListForRx.find(p => p.id === prescriptionForm.patientId)?.name}`, 'success');
    setOpenPrescriptionDialog(false);
    setPrescriptionForm({ patientId: '', diagnosis: '', medicines: [] });
  };
  const handleClosePrescriptionDialog = () => {
    setOpenPrescriptionDialog(false);
    setPrescriptionForm({ patientId: '', diagnosis: '', medicines: [] });
  };
  
  return (
    <>
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
          <Button onClick={handleReportSubmit} variant="contained" disabled={!reportForm.patientId || !reportForm.reportType}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Prescribe Medicines Dialog */}
      <Dialog open={openPrescriptionDialog} onClose={handleClosePrescriptionDialog}>
        <DialogTitle>Prescribe Medicines</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handlePrescriptionSubmit} noValidate sx={{ mt: 1 }}>
            <TextField select fullWidth label="Select Patient" name="patientId" value={prescriptionForm.patientId} onChange={handlePrescriptionFormChange} margin="normal" required>
              {patientListForRx.map((p) => (<MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>))}
            </TextField>
            <TextField fullWidth label="Diagnosis" name="diagnosis" value={prescriptionForm.diagnosis} onChange={handlePrescriptionFormChange} margin="normal" required />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Medicine List</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
              {medicineOptions.map(medicine => (
                <FormControlLabel key={medicine} control={<Checkbox checked={prescriptionForm.medicines.includes(medicine)} onChange={handleMedicineChange} value={medicine} />} label={medicine} />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrescriptionDialog}>Cancel</Button>
          <Button onClick={handlePrescriptionSubmit} variant="contained" disabled={!prescriptionForm.patientId || !prescriptionForm.diagnosis || prescriptionForm.medicines.length === 0}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Patient Details Dialog */}
      <Dialog open={openPatientDetailsDialog} onClose={handleClosePatientDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedPatient?.name}'s Dashboard</DialogTitle>
        <DialogContent dividers>
          {selectedPatient && (
            <Box>
              <Typography variant="h6" gutterBottom>Patient Information</Typography>
              <Typography><strong>User ID:</strong> {selectedPatient.id}</Typography>
              <Typography><strong>Age:</strong> {selectedPatient.age}</Typography>
              <Typography><strong>Gender:</strong> {selectedPatient.gender}</Typography>
              <Typography><strong>Condition:</strong> {selectedPatient.medicalHistory}</Typography>
              <Typography><strong>Notes:</strong> {selectedPatient.notes}</Typography>
              <Typography><strong>Heart Rate:</strong> {selectedPatient.vitals?.heartRate || 'N/A'} BPM</Typography>
              <Typography><strong>SpO2:</strong> {selectedPatient.vitals?.spO2 || 'N/A'}%</Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Vitals Trends (Last 7 Days)</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockVitalsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="heartRate" stroke="#8884d8" name="Heart Rate (BPM)" />
                  <Line type="monotone" dataKey="spO2" stroke="#82ca9d" name="SpO2 (%)" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePatientDetailsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dialogs;