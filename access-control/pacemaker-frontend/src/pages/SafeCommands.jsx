// src/pages/SafeCommands.jsx
import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, Button, TextField, Typography, Table, TableBody,
  TableCell, TableHead, TableRow, Alert, CircularProgress, Chip, Box,
} from '@mui/material';

const BACKEND_URL = 'http://localhost:5000';

const SafeCommands = () => {
  const [allowedCommands, setAllowedCommands] = useState([]);
  const [testCommand, setTestCommand] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllowedCommands = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/allowed-commands`);
      const data = await res.json();
      setAllowedCommands(data.commands || []);
    } catch (err) {
      setError(`Could not load allowed commands: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllowedCommands(); }, []);

  const handleTest = async () => {
    if (!testCommand.trim()) return;
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/validate-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: testCommand.trim() }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ accepted: false, reason: `Backend error: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Safe Commands</Typography>

      {/* Test a command */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Test a Command (via CommandValidator contract)" />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Submits a command through your deployed CommandValidator smart contract to check if it's accepted or rejected (malicious pattern detection, rate limiting, etc.)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField fullWidth label="Command to test" value={testCommand} onChange={e => setTestCommand(e.target.value)} placeholder="e.g. start, stop, status | rm -rf /" />
            <Button variant="contained" onClick={handleTest} disabled={testing} sx={{ minWidth: 100 }}>
              {testing ? <CircularProgress size={20} /> : 'Test'}
            </Button>
          </Box>
          {testResult && (
            <Alert severity={testResult.accepted ? 'success' : 'error'}>
              {testResult.accepted
                ? `✅ Command ACCEPTED by contract (block ${testResult.blockNumber})`
                : `🛑 Command REJECTED: ${testResult.reason}`}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Allowed commands from contract */}
      <Card>
        <CardHeader title="Allowed Commands (from CommandValidator contract)" action={<Button size="small" onClick={fetchAllowedCommands}>Refresh</Button>} />
        <CardContent>
          {loading && <CircularProgress size={24} />}
          {error && <Alert severity="warning">{error}</Alert>}
          {!loading && !error && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Command</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allowedCommands.map((cmd, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{cmd}</TableCell>
                    <TableCell><Chip label="Allowed" color="success" size="small" /></TableCell>
                  </TableRow>
                ))}
                {allowedCommands.length === 0 && (
                  <TableRow><TableCell colSpan={3} align="center">No allowed commands found in contract</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SafeCommands;