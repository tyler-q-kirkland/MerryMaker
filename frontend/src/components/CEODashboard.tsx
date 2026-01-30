import React, { useState, useEffect } from 'react';
import { User, UserStats, getAllUsers, previewChristmasCard, confirmChristmasCard, uploadPicture, logout, getUserProfile, getUserStats, resetCardSeason, CardPreview } from '../services/api';
import './CEODashboard.css';

interface CEODashboardProps {
  user: User;
  onLogout: () => void;
}

const CEODashboard: React.FC<CEODashboardProps> = ({ user, onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [profile, setProfile] = useState<User>(user);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const messageTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ready' | 'received' | 'notReady'>('all');
  
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [cardPreview, setCardPreview] = useState<CardPreview | null>(null);
  const [editedMessage, setEditedMessage] = useState('');

  const loadingMessages = [
    'Licking envelopes...',
    'Buying stamps...',
    'Stuffing stockings...',
    'Addressing packages...',
    'Loading the sleigh...',
    'Mapping rooftop routes...',
    'Baking cookies...',
    'Burning cookies...',
    'Refilling the cocoa...',
    'Syncing with the North Pole...',
    'Optimizing sleigh route...',
    'Patching elf firmware...',
    'Initializing jingle bells...',
    'Adding sparkle…',
    'Making it festive…',
    'Unwrapping magic…',
    'Checking the list (twice)...',
    'Consulting the naughty list...',
    'Waking the elves...',
    'Herding reindeer...',
    'Untangling tinsel...',
    'Deploying elves...',
  ];

  useEffect(() => {
    loadUsers();
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // Fetch all users including those who received cards
      const data = await getAllUsers(true);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleResetSeason = async () => {
    if (!window.confirm('Are you sure you want to reset the card sent status for all users? This will allow you to send cards to everyone again.')) {
      return;
    }

    setLoading(true);
    setStatusMessage('');
    try {
      await resetCardSeason();
      setStatusMessage('Card season reset successfully! All users can now receive cards again. 🔄');
      await loadUsers();
      await loadStats();
    } catch (error) {
      setStatusMessage('Failed to reset season. Please try again.');
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
    setStatusMessage('');
    try {
      await uploadPicture(selectedFile);
      setStatusMessage('Picture uploaded successfully! 📸');
      setSelectedFile(null);
      await loadProfile();
    } catch (error) {
      setStatusMessage('Failed to upload picture. Please try again.');
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

  // Calculate eligible and ineligible users
  const eligibleUsers = users.filter(u => u.picture_url && u.word && !u.card_sent_this_season);
  const ineligibleUsers = users.filter(u => !u.picture_url || !u.word);
  
  // Filter users based on active filter
  const readyUsers = users.filter(u => u.picture_url && u.word && !u.card_sent_this_season);
  const receivedUsers = users.filter(u => u.card_sent_this_season === true);
  const notReadyUsers = users.filter(u => !u.picture_url || !u.word); // Show all users missing picture/word regardless of card status
  
  const getFilteredUsers = () => {
    switch (activeFilter) {
      case 'ready':
        return readyUsers;
      case 'received':
        return receivedUsers;
      case 'notReady':
        return notReadyUsers;
      default:
        return users;
    }
  };
  
  const filteredUsers = getFilteredUsers();

  const handleGeneratePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !message) return;

    setLoading(true);
    setShowLoadingDialog(true);
    setStatusMessage('');
    
    // Start rotating loading messages
    const messageInterval = setInterval(() => {
      const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      setLoadingMessage(randomMessage);
    }, 1000 * (0.7 + Math.random() * 0.6)); // Random interval between 700ms and 1300ms
    
    // Set initial message
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    
    try {
      const preview = await previewChristmasCard(selectedUser.id, message);
      setCardPreview(preview);
      setEditedMessage(preview.aiGeneratedMessage);
      setShowPreview(true);
    } catch (error: any) {
      setStatusMessage(error.response?.data?.error || 'Failed to generate card. Please try again.');
    } finally {
      clearInterval(messageInterval);
      setShowLoadingDialog(false);
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setCardPreview(null);
    setEditedMessage('');
    // Don't clear message or selectedUser - return to dashboard as-is
  };

  const handleConfirmSend = async () => {
    if (!cardPreview) return;

    setLoading(true);
    setStatusMessage('');
    
    try {
      await confirmChristmasCard(
        cardPreview.recipientId,
        cardPreview.ceoMessage,
        editedMessage,
        cardPreview.festiveImageUrl
      );
      
      setStatusMessage(`Christmas card sent to ${cardPreview.recipientName}! 🎄`);
      setMessage('');
      setShowPreview(false);
      setCardPreview(null);
      setEditedMessage('');
      
      // Store current index before reload
      const currentIndex = eligibleUsers.findIndex(u => u.id === selectedUser?.id);
      const nextIndex = currentIndex + 1;
      
      // Reload users and stats to reflect the sent card
      await loadUsers();
      await loadStats();
      
      // Wait for users to reload, then select next user and focus textarea
      setTimeout(() => {
        const updatedEligibleUsers = users.filter(u => u.picture_url && u.word && !u.card_sent_this_season);
        if (updatedEligibleUsers.length > 0) {
          let nextUser;
          
          // Try to go to next user
          if (nextIndex < updatedEligibleUsers.length) {
            nextUser = updatedEligibleUsers[nextIndex];
          } 
          // If no next user, try to go backwards
          else if (currentIndex > 0 && updatedEligibleUsers.length > 0) {
            nextUser = updatedEligibleUsers[Math.min(currentIndex - 1, updatedEligibleUsers.length - 1)];
          }
          // Otherwise just select the first available
          else {
            nextUser = updatedEligibleUsers[0];
          }
          
          setSelectedUser(nextUser);
          
          // Focus the textarea after a short delay
          setTimeout(() => {
            messageTextareaRef.current?.focus();
          }, 100);
        } else {
          setSelectedUser(null);
        }
      }, 500);
    } catch (error: any) {
      setStatusMessage(error.response?.data?.error || 'Failed to send card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextUser = () => {
    if (!selectedUser) {
      if (eligibleUsers.length > 0) {
        setSelectedUser(eligibleUsers[0]);
      }
      return;
    }
    
    const currentIndex = eligibleUsers.findIndex(u => u.id === selectedUser.id);
    if (currentIndex < eligibleUsers.length - 1) {
      setSelectedUser(eligibleUsers[currentIndex + 1]);
    }
  };

  const handlePreviousUser = () => {
    if (!selectedUser) return;
    
    const currentIndex = eligibleUsers.findIndex(u => u.id === selectedUser.id);
    if (currentIndex > 0) {
      setSelectedUser(eligibleUsers[currentIndex - 1]);
    }
  };

  const canGoNext = selectedUser ? eligibleUsers.findIndex(u => u.id === selectedUser.id) < eligibleUsers.length - 1 : eligibleUsers.length > 0;
  const canGoPrevious = selectedUser ? eligibleUsers.findIndex(u => u.id === selectedUser.id) > 0 : false;

  return (
    <div className="ceo-dashboard-container">
      <header className="dashboard-header">
        <h1>🎅 CEO Dashboard - MerryMaker</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="ceo-dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {profile.name}! 🎄</h2>
          <p>Send personalized AI-generated Christmas cards to your team</p>
        </div>

        <div className="ceo-profile-section">
          <h3>Your Picture</h3>
          {profile.picture_url ? (
            <div className="picture-preview">
              <img src={`${process.env.REACT_APP_API_URL}${profile.picture_url}`} alt="CEO profile" />
            </div>
          ) : (
            <p className="no-picture">⚠️ Please upload your picture to send cards</p>
          )}
          <form onSubmit={handlePictureUpload} className="upload-form">
            <input
              type="file"
              id="picture-upload"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: 'none' }}
            />
            <label htmlFor="picture-upload" className={`file-input-label ${loading ? 'disabled' : ''}`}>
              📁 {selectedFile ? selectedFile.name : 'Choose Picture'}
            </label>
            <button type="submit" disabled={!selectedFile || loading}>
              {loading ? 'Uploading...' : 'Upload Picture'}
            </button>
          </form>
        </div>

        {statusMessage && (
          <div className={`message ${statusMessage.includes('Failed') || statusMessage.includes('⚠️') ? 'error' : 'success'}`}>
            {statusMessage}
          </div>
        )}

        <div className="send-card-section">
          <h3>Send Christmas Card</h3>
          {!profile.picture_url ? (
            <p className="warning">Please upload your picture before sending cards.</p>
          ) : eligibleUsers.length === 0 ? (
            <p className="warning">No users are ready to receive cards yet. Users need to upload their picture and set their word.</p>
          ) : (
            <form onSubmit={handleGeneratePreview}>
              <div className="form-group">
                <label>Select Recipient:</label>
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => {
                    const user = users.find(u => u.id === parseInt(e.target.value));
                    setSelectedUser(user || null);
                  }}
                  required
                  disabled={loading}
                >
                  <option value="">Choose a recipient...</option>
                  {eligibleUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) - Word: "{u.word}"
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <div className="message-header">
                  <label>Your Personal Message:</label>
                  <div className="navigation-buttons">
                    <button
                      type="button"
                      onClick={handlePreviousUser}
                      disabled={!canGoPrevious || loading}
                      className="nav-btn prev-btn"
                      title="Previous recipient"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextUser}
                      disabled={!canGoNext || loading}
                      className="nav-btn next-btn"
                      title="Next recipient"
                    >
                      Next →
                    </button>
                  </div>
                </div>
                <textarea
                  ref={messageTextareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a personal message for this team member..."
                  rows={4}
                  required
                  disabled={loading}
                />
                <small>AI will enhance this message with the recipient's word to create a festive greeting!</small>
              </div>

              <button type="submit" disabled={loading || !selectedUser}>
                {loading ? 'Generating Card...' : 'Generate Card 🎄'}
              </button>
            </form>
          )}
        </div>

        <div className="users-overview">
          <div className="overview-header">
            <h3>Team Overview</h3>
            <button 
              onClick={handleResetSeason} 
              disabled={loading}
              className="reset-btn"
              title="Reset card sent status for all users"
            >
              🔄 Reset Season
            </button>
          </div>
          
          {stats && (
            <div className="users-stats">
              <div 
                className={`stat-card ready ${activeFilter === 'ready' ? 'active' : ''}`}
                onClick={() => setActiveFilter(activeFilter === 'ready' ? 'all' : 'ready')}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-number">{stats.readyToReceive}</div>
                <div className="stat-label">Ready to Receive Cards</div>
                <div className="stat-description">Users who haven't received a card yet</div>
              </div>
              <div 
                className={`stat-card received ${activeFilter === 'received' ? 'active' : ''}`}
                onClick={() => setActiveFilter(activeFilter === 'received' ? 'all' : 'received')}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-number">{stats.receivedCards}</div>
                <div className="stat-label">Received Cards</div>
                <div className="stat-description">Users who have been sent a card</div>
              </div>
              <div 
                className={`stat-card not-ready ${activeFilter === 'notReady' ? 'active' : ''}`}
                onClick={() => setActiveFilter(activeFilter === 'notReady' ? 'all' : 'notReady')}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-number">{stats.notReady}</div>
                <div className="stat-label">Not Ready Yet</div>
                <div className="stat-description">Missing picture or word</div>
              </div>
            </div>
          )}

        </div>
      </div>

      {showLoadingDialog && (
        <div className="loading-dialog-overlay">
          <div className="loading-dialog">
            <div className="loading-spinner">🎄</div>
            <p className="loading-message">{loadingMessage}</p>
          </div>
        </div>
      )}

      {showPreview && cardPreview && (
        <div className="loading-dialog-overlay">
          <div className="preview-dialog">
            <div className="preview-header">
              <h2>Preview Christmas Card</h2>
              <p>To: {cardPreview.recipientName} ({cardPreview.recipientEmail})</p>
            </div>
            
            <div className="preview-content">
              <div className="preview-image">
                <img 
                  src={`${process.env.REACT_APP_API_URL}${cardPreview.festiveImageUrl}`} 
                  alt="Christmas card" 
                />
              </div>
              
              <div className="preview-message">
                <label>Message:</label>
                <textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  rows={6}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="preview-actions">
              <button 
                onClick={handleCancelPreview} 
                disabled={loading}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSend} 
                disabled={loading || !editedMessage.trim()}
                className="send-btn"
              >
                {loading ? 'Sending...' : 'Send Card 🎄'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeFilter !== 'all' && (
        <div className="loading-dialog-overlay" onClick={() => setActiveFilter('all')}>
          <div className="users-list-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>
                {activeFilter === 'ready' && '✅ Ready to Receive Cards'}
                {activeFilter === 'received' && '📬 Received Cards'}
                {activeFilter === 'notReady' && '⚠️ Not Ready Yet'}
              </h3>
              <button onClick={() => setActiveFilter('all')} className="close-dialog-btn">✕</button>
            </div>
            <div className="dialog-content">
              {filteredUsers.length > 0 ? (
                <ul>
                  {filteredUsers.map(u => (
                    <li key={u.id}>
                      <strong>{u.name}</strong> ({u.email})
                      {activeFilter === 'ready' && u.word && (
                        <span className="user-word"> - Word: "{u.word}"</span>
                      )}
                      {activeFilter === 'notReady' && (
                        <span className="user-missing"> - Missing: {!u.picture_url && 'Picture'}{!u.picture_url && !u.word && ' & '}{!u.word && 'Word'}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-users">No users in this category</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CEODashboard;
