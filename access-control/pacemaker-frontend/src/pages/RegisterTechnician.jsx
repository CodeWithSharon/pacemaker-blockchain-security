// src/pages/RegisterTechnician.jsx
import React, { useState } from 'react';

const RegisterTechnician = () => {
  const [formData, setFormData] = useState({
    name: '',
    technicianId: '',
    specialization: '',
    email: '',
    phone: '',
    password: '',
  });

  // State to manage UI feedback
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    // Simulate an API call with a 2-second delay
    setTimeout(() => {
      try {
        console.log('Register Technician Data (Simulated):', formData);

        // Simulate a successful registration
        setSuccess(true);
        
        // Reset the form after success
        setFormData({
          name: '',
          technicianId: '',
          specialization: '',
          email: '',
          phone: '',
          password: '',
        });

      } catch (err) {
        // Simulate an error if needed
        setError('A simulated error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register Technician</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} style={styles.input} required />
        <input name="technicianId" placeholder="Technician ID" value={formData.technicianId} onChange={handleChange} style={styles.input} required />
        <input name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} style={styles.input} required />
        <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} style={styles.input} required />
        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} style={styles.input} required />
        <input name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} style={styles.input} required />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Registering...' : 'Register Technician'}
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
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' },
  button: { 
    padding: '0.8rem', 
    backgroundColor: '#c8407bff', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: '1'
  },
  successMessage: { color: 'green', marginTop: '1rem' },
  errorMessage: { color: 'red', marginTop: '1rem' },
};

export default RegisterTechnician;
