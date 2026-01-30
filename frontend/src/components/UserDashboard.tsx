import React, { useState, useEffect } from 'react';
import { User, getUserProfile, updateWord, uploadPicture, logout } from '../services/api';
import './UserDashboard.css';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
  const [profile, setProfile] = useState<User>(user);
  const [word, setWord] = useState(user.word || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
      setWord(data.word || '');
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleWordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateWord(word);
      setMessage('Word updated successfully! ✨');
      await loadProfile();
    } catch (error) {
      setMessage('Failed to update word. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePictureUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setMessage('');
    try {
      await uploadPicture(selectedFile);
      setMessage('Picture uploaded successfully! 📸');
      setSelectedFile(null);
      await loadProfile();
    } catch (error) {
      setMessage('Failed to upload picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🎄 MerryMaker Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {profile.name}! 🎅</h2>
          <p>Set up your profile to receive personalized Christmas cards</p>
        </div>

        <div className="profile-section">
          <div className="profile-card">
            <h3>Your Picture</h3>
            {profile.picture_url ? (
              <div className="picture-preview">
                <img src={`${process.env.REACT_APP_API_URL}${profile.picture_url}`} alt="Your profile" />
              </div>
            ) : (
              <p className="no-picture">No picture uploaded yet</p>
            )}
            <form onSubmit={handlePictureUpload} className="upload-form">
              <input
                type="file"
                id="user-picture-upload"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                style={{ display: 'none' }}
              />
              <label htmlFor="user-picture-upload" className={`file-input-label ${loading ? 'disabled' : ''}`}>
                📁 {selectedFile ? selectedFile.name : 'Choose Picture'}
              </label>
              <button type="submit" disabled={!selectedFile || loading}>
                {loading ? 'Uploading...' : 'Upload Picture'}
              </button>
            </form>
          </div>

          <div className="profile-card">
            <h3>Your Word</h3>
            <p className="word-description">
              Choose a word that represents you this holiday season. 
              It will be used to personalize your Christmas card!
            </p>
            {profile.word && (
              <div className="current-word">
                Current word: <strong>{profile.word}</strong>
              </div>
            )}
            <form onSubmit={handleWordUpdate}>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g., Joy, Peace, Love, Gratitude"
                maxLength={50}
                disabled={loading}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Word'}
              </button>
            </form>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="info-section">
          <h3>ℹ️ How it works</h3>
          <ol>
            <li>Upload a picture of yourself</li>
            <li>Choose your special word</li>
            <li>Wait for a personalized Christmas card from the CEO!</li>
            <li>You'll receive an email when your card is ready</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
