import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser, User } from './services/api';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import CEODashboard from './components/CEODashboard';
import ChristmasCard from './components/ChristmasCard';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCEO, setIsCEO] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      // Check if user is CEO (this will be validated on backend too)
      setIsCEO(currentUser.email === process.env.REACT_APP_CEO_EMAIL);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🎄</div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route
          path="/dashboard"
          element={
            user ? (
              isCEO ? (
                <CEODashboard user={user} onLogout={() => setUser(null)} />
              ) : (
                <UserDashboard user={user} onLogout={() => setUser(null)} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/card/:token" element={<ChristmasCard />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
