// src/pages/RegisterDoctor.jsx
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';

const BACKEND_URL = 'http://localhost:5000';

const RegisterDoctor = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!address.trim()) { setError('Wallet address is required.'); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed');
      setSuccess(`Doctor registered on-chain. TX: ${data.txHash}`);
      setAddress('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Register Doctor</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Registers a wallet address as an authorized doctor on the UnauthorizedAccessControl smart contract.
          </Typography>
          <TextField fullWidth label="Doctor Wallet Address (0x...)" value={address} onChange={e => setAddress(e.target.value)} placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8" sx={{ mb: 2 }} />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Register Doctor on Blockchain'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterDoctor;