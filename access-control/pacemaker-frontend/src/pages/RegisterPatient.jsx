// src/pages/RegisterPatient.jsx
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, CircularProgress, Grid } from '@mui/material';

const BACKEND_URL = 'http://localhost:5000';
const DOCTOR_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

const RegisterPatient = () => {
  const [form, setForm] = useState({ patientAddress: '', name: '', age: '', medicalHistory: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.patientAddress.trim() || !form.name.trim()) { setError('Patient address and name are required.'); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, age: Number(form.age) || 0, doctorAddress: DOCTOR_ADDRESS }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed');
      setSuccess(`Patient registered on-chain. TX: ${data.txHash}`);
      setForm({ patientAddress: '', name: '', age: '', medicalHistory: '' });
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
          <Typography variant="h5" gutterBottom>Register Patient</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Registers a patient under the doctor account on the smart contract.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Patient Wallet Address (0x...)" name="patientAddress" value={form.patientAddress} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Patient Name" name="name" value={form.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Age" name="age" type="number" value={form.age} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Medical History" name="medicalHistory" value={form.medicalHistory} onChange={handleChange} multiline rows={3} />
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Register Patient on Blockchain'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPatient;