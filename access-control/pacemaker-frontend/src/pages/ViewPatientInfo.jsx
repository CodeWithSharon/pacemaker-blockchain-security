// src/pages/ViewPatientInfo.jsx
import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Grid, Box, Divider, Alert, CircularProgress } from '@mui/material';

const BACKEND_URL = 'http://localhost:5000';

const ViewPatientInfo = () => {
  const [patientAddress, setPatientAddress] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!patientAddress.trim()) { setError('Please enter a patient wallet address.'); return; }
    setLoading(true); setError(null); setPatientData(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/patients/${patientAddress.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Patient not found');
      setPatientData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>View Patient Info</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Looks up a patient record stored on the smart contract by their wallet address.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField fullWidth label="Patient Wallet Address (0x...)" value={patientAddress} onChange={e => setPatientAddress(e.target.value)} placeholder="0x..." />
            <Button variant="contained" onClick={handleSearch} disabled={loading} sx={{ minWidth: 100 }}>
              {loading ? <CircularProgress size={20} /> : 'Search'}
            </Button>
          </Box>

          {error && <Alert severity="warning">{error}</Alert>}

          {patientData && (
            <Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>Patient Record (on-chain)</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography>{patientData.name || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Age</Typography>
                  <Typography>{patientData.age || '—'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Medical History</Typography>
                  <Typography>{patientData.medicalHistory || '—'}</Typography>
                </Grid>
                {patientData.checkupHistory && patientData.checkupHistory.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Checkup History</Typography>
                    {patientData.checkupHistory.map((entry, i) => (
                      <Typography key={i} variant="body2">• {entry}</Typography>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewPatientInfo;