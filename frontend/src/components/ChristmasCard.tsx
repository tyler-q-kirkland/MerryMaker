import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCardByToken } from '../services/api';
import './ChristmasCard.css';

const ChristmasCard: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [canInteract, setCanInteract] = useState(false);

  useEffect(() => {
    loadCard();
  }, [token]);

  const loadCard = async () => {
    if (!token) return;
    
    try {
      const data = await getCardByToken(token);
      setCard(data.card);
      // Show card to trigger animation - set at 0s so animation-delay controls timing
      setTimeout(() => setShowCard(true), 0);
      // Enable interaction after card slide completes
      // Card slide starts at 2.5s + 3s duration = 5.5s total
      setTimeout(() => setCanInteract(true), 5600); // 5.5s + 100ms buffer
    } catch (err) {
      setError('Card not found or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (canInteract) {
      setIsOpen(!isOpen);
    }
  };

  if (loading) {
    return (
      <div className="card-loading">
        <div className="loading-spinner">🎄</div>
        <p>Loading your Christmas card...</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="card-error">
        <h1>❌ Oops!</h1>
        <p>{error || 'Card not found'}</p>
      </div>
    );
  }

  return (
    <div className="christmas-card-container">
      <div className="envelope-container">
        <div className="envelope">
          <div className="envelope-flap"></div>
          <div className="envelope-body"></div>
          
          <div className={`card-wrapper ${showCard ? 'show' : ''}`}>
            <div className={`greeting-card ${isOpen ? 'open' : ''} ${canInteract ? 'can-interact' : ''}`} onClick={handleCardClick}>
              {/* Base/Inside Page - Always visible underneath */}
              <div className="card-base">
                <div className="card-inside-content">
                  <div className="card-header-text">
                    <h1>Season's Greetings!</h1>
                    <p className="card-to">Dear {card.recipient},</p>
                  </div>

                  <div className="card-message-content">
                    {card.message && (
                      <p className="message-text">{card.message}</p>
                    )}
                  </div>

                  <div className="card-signature">
                    <p>With warm wishes,</p>
                    <p className="signature-name">{card.sender}</p>
                    <p className="card-date">
                      {new Date(card.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="card-footer-decoration">
                    <span>❄️</span>
                    <span>🎄</span>
                    <span>⭐</span>
                    <span>🎄</span>
                    <span>❄️</span>
                  </div>
                </div>
              </div>

              {/* Front Cover - Flips up to reveal inside */}
              <div className="card-cover">
                <div className="card-cover-content">
                  {card.festiveImageUrl && (
                    <img 
                      src={`${process.env.REACT_APP_API_URL}${card.festiveImageUrl}`} 
                      alt="Festive greeting" 
                    />
                  )}
                  <div className="card-front-title">
                    <h1>🎄 Merry Christmas 🎄</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Click instruction - outside the card */}
            {canInteract && (
              <div className="click-instruction fade-in">
                {isOpen ? 'Click to close ↓' : 'Click to open ↑'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="snowflakes" aria-hidden="true">
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
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

export default ChristmasCard;
