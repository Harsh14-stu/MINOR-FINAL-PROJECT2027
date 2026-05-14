import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './AnimatedLogin.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'Password reset link sent to your email.');
      toast.success('Reset link sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animated-login-wrapper">
      <div className="container">
        <div className="login-box" style={{ width: '100%', maxWidth: '420px', zIndex: 20 }}>
          <h2>Forgot Password</h2>
          
          {message ? (
            <div style={{ textAlign: 'center', color: '#34d399', marginBottom: '20px' }}>
              <p>{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input 
                  type="email" 
                  placeholder="Enter your registered email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  disabled={isLoading}
                />
                <span className="input-icon"><i className="fa-solid fa-envelope" style={{color: '#ffffff'}}></i></span>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'SEND RESET LINK'}
              </button>
            </form>
          )}

          <div className="signup-link" style={{ marginTop: '20px' }}>
            <Link to="/">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
