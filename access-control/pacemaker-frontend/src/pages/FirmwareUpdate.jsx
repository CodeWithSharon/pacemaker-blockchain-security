//src/pages/FirmwareUpdate.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';

const BACKEND_URL = 'http://localhost:5000';

const FirmwareUpdate = () => {
  const [deviceId, setDeviceId] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState('');
  const [firmwareHash, setFirmwareHash] = useState('');
  const [updateStatus, setUpdateStatus] = useState('Idle');
  const [updateHistory, setUpdateHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BACKEND_URL}/api/firmware-updates`);
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      setUpdateHistory(data.updates || []);
    } catch (err) {
      setError(`Could not reach backend: ${err.message}. Make sure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpdate = async () => {
    if (!deviceId || !firmwareVersion || !firmwareHash) {
      setSubmitError('Please fill in Device ID, Firmware Version, and Firmware Hash.');
      return;
    }

    setSubmitError(null);
    setUpdateStatus('Updating...');

    try {
      const res = await fetch(`${BACKEND_URL}/api/firmware-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, firmwareVersion, firmwareHash }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Update rejected by contract');
      }

      setUpdateStatus('Completed');
      setDeviceId('');
      setFirmwareVersion('');
      setFirmwareHash('');
      await fetchHistory();
    } catch (err) {
      setUpdateStatus('Failed');
      setSubmitError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Updating...':
        return 'warning';
      case 'Failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const isUpdating = updateStatus === 'Updating...';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Firmware Update
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardHeader title="Log a New Firmware Update (on-chain)" />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              disabled={isUpdating}
              placeholder="e.g. PM-001"
              fullWidth
            />
            <TextField
              label="Firmware Version"
              value={firmwareVersion}
              onChange={(e) => setFirmwareVersion(e.target.value)}
              disabled={isUpdating}
              placeholder="e.g. v2.1"
              fullWidth
            />
            <TextField
              label="Firmware Hash"
              value={firmwareHash}
              onChange={(e) => setFirmwareHash(e.target.value)}
              disabled={isUpdating}
              placeholder="e.g. sha256 hash of the firmware binary"
              fullWidth
            />

            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              disabled={isUpdating}
              fullWidth
            >
              {isUpdating ? 'Submitting to blockchain...' : 'Log Firmware Update'}
            </Button>

            <Box mt={1}>
              <Typography>Status: <Chip label={updateStatus} color={getStatusColor(updateStatus)} /></Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Update History (from blockchain)" action={
          <Button size="small" onClick={fetchHistory}>Refresh</Button>
        } />
        <CardContent>
          {loading && updateHistory.length === 0 && (
            <Box sx={{ textAlign: 'center', p: 2 }}><CircularProgress size={24} /></Box>
          )}
          {error && <Alert severity="warning">{error}</Alert>}
          {!loading && !error && updateHistory.length === 0 && (
            <Alert severity="info">No firmware updates logged yet.</Alert>
          )}
          {updateHistory.length > 0 && (
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Device ID</TableCell>
                    <TableCell>Firmware Version</TableCell>
                    <TableCell>Firmware Hash</TableCell>
                    <TableCell>Updated By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {updateHistory.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(row.timestamp * 1000).toLocaleString()}</TableCell>
                      <TableCell>{row.deviceId}</TableCell>
                      <TableCell>{row.firmwareVersion}</TableCell>
                      <TableCell>{row.firmwareHash}</TableCell>
                      <TableCell>{row.updatedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FirmwareUpdate;