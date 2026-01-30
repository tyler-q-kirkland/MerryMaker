import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCardByToken } from '../services/api';
import './ChristmasCard.css';

const ChristmasCard: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCard();
  }, [token]);

  const loadCard = async () => {
    if (!token) return;
    
    try {
      const data = await getCardByToken(token);
      setCard(data.card);
    } catch (err) {
      setError('Card not found or has expired.');
    } finally {
      setLoading(false);
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
          
          <div className="card-content">
            <div className="christmas-card">
              <div className="card-header">
                <h1>🎄 Merry Christmas! 🎄</h1>
                <p className="card-from">From: {card.sender}</p>
                <p className="card-to">To: {card.recipient}</p>
              </div>

              {card.festiveImageUrl && (
                <div className="card-image">
                  <img 
                    src={`${process.env.REACT_APP_API_URL}${card.festiveImageUrl}`} 
                    alt="Festive greeting" 
                  />
                </div>
              )}

              <div className="card-message">
                {card.message && (
                  <div className="message">
                    <h3>✨ Holiday Message:</h3>
                    <p>{card.message}</p>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <p>🎅 Sent with love from MerryMaker 🎅</p>
                <p className="card-date">
                  {new Date(card.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
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
