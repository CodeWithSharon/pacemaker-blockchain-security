//src/pages/Appointments.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";

const BACKEND_URL = 'http://localhost:5000';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BACKEND_URL}/api/appointments`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Backend returned ${res.status}`);
      }
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(`Could not load appointments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAdd = async () => {
    if (!date || !reason) {
      setSubmitError("Please fill in both Date and Reason.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add appointment');
      }
      setDate("");
      setReason("");
      await fetchAppointments();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 900, margin: "auto", mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Appointment Scheduler (on-chain)
      </Typography>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Routine pacemaker checkup"
            />
          </Grid>
        </Grid>

        {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleAdd}
          disabled={submitting}
        >
          {submitting ? 'Submitting to blockchain...' : 'Add Appointment'}
        </Button>

        <Typography variant="h6" sx={{ mt: 4 }}>
          Scheduled Appointments (recorded by your doctor account on-chain)
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Note: Blockchain records are append-only by design — appointments can't be edited
          or deleted once logged, which preserves an audit trail.
        </Typography>

        {loading && <Box sx={{ textAlign: 'center', p: 2 }}><CircularProgress size={24} /></Box>}
        {error && <Alert severity="warning">{error}</Alert>}

        {!loading && !error && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appt, index) => (
                <TableRow key={index}>
                  <TableCell>{appt.date}</TableCell>
                  <TableCell>{appt.reason}</TableCell>
                </TableRow>
              ))}
              {appointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">No appointments logged yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default Appointments;