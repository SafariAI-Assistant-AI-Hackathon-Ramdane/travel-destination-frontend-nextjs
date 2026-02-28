import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './Login.css'; // Shared styles

function Register() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Sending registration request:", formData);
      await authService.register(formData);
      setSuccess(true);
      // Redirect to onboarding for new users
      setTimeout(() => navigate('/onboarding'), 2000);
    } catch (err: any) {
      console.error("Registration full error:", err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      const statusText = err.response?.statusText;
      const statusCode = err.response?.status;
      
      let displayError = 'Registration failed. Please try again.';
      if (backendMessage) {
        displayError = backendMessage;
      } else if (statusCode) {
        displayError = `Registration failed (Status ${statusCode}: ${statusText || 'Unknown'}).`;
      } else if (err.message) {
        displayError = `Connection Error: ${err.message}`;
      }
      
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card success-card">
          <div className="auth-header">
            <div className="success-icon">✨</div>
            <h2>Bienvenue !</h2>
            <p>Votre compte a été créé avec succès. Nous allons personnaliser votre expérience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join MarrakechTrips today</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstname">First Name</label>
            <input
              type="text"
              id="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              id="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              minLength={8}
            />
          </div>
          
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
          <Link to="/" className="back-home">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
