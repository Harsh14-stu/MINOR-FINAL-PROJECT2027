import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './AnimatedLogin.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords don't match");
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful!');
      login(res.data);
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(`/${res.data.user.role}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error resetting password. Link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animated-login-wrapper">
      <div className="container">
        <div className="login-box" style={{ width: '100%', maxWidth: '420px', zIndex: 20 }}>
          <h2>Reset Password</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input 
                type="password" 
                placeholder="New Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isLoading}
              />
              <span className="input-icon"><i className="fa-solid fa-lock" style={{color: '#ffffff'}}></i></span>
            </div>

            <div className="input-group">
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                disabled={isLoading}
              />
              <span className="input-icon"><i className="fa-solid fa-lock" style={{color: '#ffffff'}}></i></span>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'SAVE NEW PASSWORD'}
            </button>
          </form>

          <div className="signup-link" style={{ marginTop: '20px' }}>
            <Link to="/">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
