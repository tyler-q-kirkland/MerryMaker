import React from 'react';
import { loginWithGoogle } from '../services/api';
import './Login.css';

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">🎄 MerryMaker 🎄</h1>
        <p className="login-subtitle">Christmas Card Generator</p>
        <p className="login-description">
          Create and send personalized AI-generated Christmas cards
        </p>
        <button className="google-login-btn" onClick={loginWithGoogle}>
          <span className="google-icon">G</span>
          Sign in with Google
        </button>
      </div>
      <div className="snowflakes" aria-hidden="true">
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
      </div>
    </div>
  );
};

export default Login;
