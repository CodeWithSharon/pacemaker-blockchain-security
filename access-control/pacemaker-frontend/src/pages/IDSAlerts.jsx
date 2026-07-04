// src/pages/IDSAlerts.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Backend URL — change this if your backend runs on a different host/port
const BACKEND_URL = 'http://localhost:5000';

// Softer, modern color palette
const COLORS = ['#4DB6AC', '#FF8A65', '#FFD54F', '#9575CD', '#E57373', '#64B5F6'];

const getAlertsDataForChart = (alerts) => {
  const alertCounts = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(alertCounts).map((type) => ({
    name: type,
    count: alertCounts[type],
  }));
};

// Group alerts into rough time buckets (by minute) for the line chart,
// counting how many of each attack type occurred in each bucket.
const getAlertsOverTime = (alerts) => {
  const buckets = {};
  alerts.forEach((alert) => {
    const date = new Date(alert.timestamp * 1000);
    const key = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!buckets[key]) buckets[key] = { time: key };
    buckets[key][alert.type] = (buckets[key][alert.type] || 0) + 1;
  });
  return Object.values(buckets).sort((a, b) => (a.time > b.time ? 1 : -1));
};

const IDSAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [openModal, setOpenModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BACKEND_URL}/api/ids-alerts`);
      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }
      const data = await res.json();

      // Map backend shape -> the shape this UI already expects
      const mapped = (data.alerts || []).map((a) => ({
        id: a.id,
        type: a.attackType || 'unknown',
        patientId: a.patientId,
        timestamp: a.timestamp, // unix seconds, kept raw for chart bucketing
        timestampDisplay: new Date(a.timestamp * 1000).toLocaleString(),
        notes: a.patientDetails || `Severity: ${a.severity || 'N/A'} | Source: ${a.source || 'N/A'}`,
        severity: a.severity,
        source: a.source,
      }));

      setAlerts(mapped);
    } catch (err) {
      setError(
        `Could not reach backend at ${BACKEND_URL}. Make sure the backend server is running ` +
        `(cd Backend && node index.js) and contracts are deployed. (${err.message})`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll every 10s so new alerts logged elsewhere (e.g. via curl/Postman or another
    // part of the system) show up here without a manual refresh.
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const chartData = getAlertsDataForChart(alerts);
  const alertsOverTime = getAlertsOverTime(alerts);

  const alertTypes = ['All', ...new Set(alerts.map((a) => a.type))];

  const filteredAlerts = alerts.filter(alert =>
    filterType === 'All' || alert.type === filterType
  );

  const handleRowClick = (alert) => {
    setSelectedAlert(alert);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAlert(null);
  };

  if (loading && alerts.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading IDS alerts from blockchain...</Typography>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Intrusion Detection System Alerts
        </Typography>
        <Button variant="outlined" size="small" onClick={fetchAlerts}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!error && alerts.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No IDS alerts logged yet. Alerts will appear here as soon as they're recorded on-chain
          via the PacemakerIDSLogger contract.
        </Alert>
      )}

      {alerts.length > 0 && (
        <Grid container spacing={3} mb={4}>
          {/* Bar Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Alerts by Type (Bar)</Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Alerts">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Alerts by Type (Pie)</Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Line Chart */}
          <Grid item xs={12}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Alerts Over Time</Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={alertsOverTime} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="time" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {Object.keys(chartData.reduce((acc, c) => ({ ...acc, [c.name]: true }), {})).map((type, idx) => (
                      <Line
                        key={type}
                        type="monotone"
                        dataKey={type}
                        stroke={COLORS[idx % COLORS.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Alerts Table */}
      {alerts.length > 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Alerts ({filteredAlerts.length})</Typography>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                label="Filter by Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                {alertTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Patient ID</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow
                    key={alert.id}
                    onClick={() => handleRowClick(alert)}
                    sx={{ '&:hover': { cursor: 'pointer', backgroundColor: '#f5f5f5' } }}
                  >
                    <TableCell>{alert.id}</TableCell>
                    <TableCell>{alert.type}</TableCell>
                    <TableCell>{alert.patientId}</TableCell>
                    <TableCell>{alert.severity}</TableCell>
                    <TableCell>{alert.timestampDisplay}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Alert Details Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Typography><strong>ID:</strong> {selectedAlert.id}</Typography>
              <Typography><strong>Type:</strong> {selectedAlert.type}</Typography>
              <Typography><strong>Patient ID:</strong> {selectedAlert.patientId}</Typography>
              <Typography><strong>Severity:</strong> {selectedAlert.severity}</Typography>
              <Typography><strong>Source:</strong> {selectedAlert.source}</Typography>
              <Typography><strong>Timestamp:</strong> {selectedAlert.timestampDisplay}</Typography>
              <Typography sx={{ mt: 2 }}><strong>Notes:</strong> {selectedAlert.notes}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IDSAlerts;