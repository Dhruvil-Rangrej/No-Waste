import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/auth/login`,
        { email, password }
      );
      // Use the login function from auth context
      login(data);
      // Redirect based on role
      if (data.role === "donor") {
        navigate("/donor/dashboard");
      } else if (data.role === "ngo") {
        navigate("/ngo/dashboard");
      } else if (data.role === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setError(error.response?.data.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>Welcome</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button className="login-button" type="submit">
          Sign In
        </button>
      </form>
      
      <p className="signup-prompt">
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
};

export default Login;