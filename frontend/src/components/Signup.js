import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async(e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/signup', { name, email, password, role });
      login(data);
      if (data.role === 'donor') {
        navigate('/donor/dashboard');
      } else {
        navigate('/ngo/dashboard');
      }
    } catch (error) {
      setError(error.response?.data.message || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <h2>Create a New Account</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="signup-form" onSubmit={handleSignup}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email address"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Create a password"
            required
          />
        </div>
        
        <div className="form-group">
          <label>I am a</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="role-selector"
          >
            <option value="donor">Food Donor</option>
            <option value="ngo">NGO/Receiver</option>
          </select>
        </div>
        
        <button className="signup-button" type="submit">
          Create Account
        </button>
      </form>
      
      <p className="login-prompt">
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  );
};

export default Signup;