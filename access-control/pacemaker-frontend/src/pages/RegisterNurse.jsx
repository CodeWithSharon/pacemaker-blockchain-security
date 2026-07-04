// src/pages/RegisterNurse.jsx
import React, { useState } from 'react';

const RegisterNurse = () => {
  // State to hold the form data
  const [formData, setFormData] = useState({
    name: '',
    nurseId: '',
    department: '',
    email: '',
    phone: '',
    shift: '', // The value will now come from the dropdown
    password: '',
  });

  // State to manage UI feedback
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Handles changes to form inputs and updates the state
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handles the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Simulate an asynchronous API call with a 2-second delay
    // In a real application, you would replace this with a fetch() call
    setTimeout(() => {
      try {
        // Log the collected data to the console
        console.log('Register Nurse Data (Simulated):', formData);

        // Simulate a successful response
        setSuccess(true);

        // Reset the form fields after a "successful" submission
        setFormData({
          name: '',
          nurseId: '',
          department: '',
          email: '',
          phone: '',
          shift: '',
          password: '',
        });
      } catch (err) {
        // This catch block would handle actual fetch errors
        setError('A simulated error occurred.');
        console.error(err);
      } finally {
        // This block ensures loading is always set to false
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register Nurse</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} style={styles.input} required />
        <input name="nurseId" placeholder="Nurse ID" value={formData.nurseId} onChange={handleChange} style={styles.input} required />
        <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} style={styles.input} required />
        <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} style={styles.input} required />
        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} style={styles.input} required />

        {/* Dropdown box for shift */}
        <select
          name="shift"
          value={formData.shift}
          onChange={handleChange}
          style={styles.input}
          required
        >
          <option value="">Select Shift</option>
          <option value="Day">Day</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Night">Night</option>
        </select>

        <input name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} style={styles.input} required />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Registering...' : 'Register Nurse'}
        </button>
      </form>
      {/* Conditionally render success or error messages */}
      {success && <p style={styles.successMessage}>Registration successful! ✅</p>}
      {error && <p style={styles.errorMessage}>Error: {error} ❌</p>}
    </div>
  );
};

const styles = {
  container: { padding: '2rem' },
  title: { fontSize: '1.5rem', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '1000px' },
  input: { padding: '0.8rem', borderRadius: '20px', border: '1px solid #ccc' },
  button: {
    padding: '0.8rem',
    backgroundColor: '#1862abff',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    opacity: '1'
  },
  successMessage: { color: 'green', marginTop: '1rem' },
  errorMessage: { color: 'red', marginTop: '1rem' },
};

export default RegisterNurse;
