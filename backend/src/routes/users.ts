import express from 'express';
import multer from 'multer';
import db from '../db';
import { processAndSaveImage } from '../services/imageService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Get current user profile
router.get('/profile', requireAuth, async (req: any, res: any) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user's word
router.put('/word', requireAuth, async (req: any, res: any) => {
  try {
    const { word } = req.body;
    
    if (!word || word.trim().length === 0) {
      return res.status(400).json({ error: 'Word is required' });
    }

    await db('users')
      .where({ id: req.user.id })
      .update({ word: word.trim() });

    res.json({ message: 'Word updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update word' });
  }
});

// Upload user's picture
router.post('/picture', requireAuth, upload.single('picture'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pictureUrl = await processAndSaveImage(req.file, req.user.id);

    await db('users')
      .where({ id: req.user.id })
      .update({ picture_url: pictureUrl });

    res.json({ message: 'Picture uploaded successfully', pictureUrl });
  } catch (error) {
    console.error('Error uploading picture:', error);
    res.status(500).json({ error: 'Failed to upload picture' });
  }
});

// Get all users (for CEO to see who can receive cards)
router.get('/all', requireAuth, async (req: any, res: any) => {
  try {
    // Check if user is CEO
    if (req.user.email !== process.env.CEO_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Filter by card_sent_this_season status (default to showing those who haven't received)
    const showSent = req.query.showSent === 'true';
    
    let query = db('users')
      .select('id', 'email', 'name', 'picture_url', 'word', 'card_sent_this_season')
      .whereNot({ id: req.user.id });
    
    if (!showSent) {
      // Show only users who haven't received a card this season
      query = query.where({ card_sent_this_season: false });
    }
    
    const users = await query.orderBy('name');

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user statistics (CEO only)
router.get('/stats', requireAuth, async (req: any, res: any) => {
  try {
    // Check if user is CEO
    if (req.user.email !== process.env.CEO_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const totalUsers = await db('users')
      .whereNot({ id: req.user.id })
      .count('* as count')
      .first();

    const readyToReceive = await db('users')
      .whereNot({ id: req.user.id })
      .where({ card_sent_this_season: false })
      .whereNotNull('picture_url')
      .whereNotNull('word')
      .count('* as count')
      .first();

    const receivedCards = await db('users')
      .whereNot({ id: req.user.id })
      .where({ card_sent_this_season: true })
      .count('* as count')
      .first();

    const notReady = await db('users')
      .whereNot({ id: req.user.id })
      .where({ card_sent_this_season: false })
      .where(function() {
        this.whereNull('picture_url').orWhereNull('word');
      })
      .count('* as count')
      .first();

    res.json({
      total: parseInt(totalUsers?.count as string || '0'),
      readyToReceive: parseInt(readyToReceive?.count as string || '0'),
      receivedCards: parseInt(receivedCards?.count as string || '0'),
      notReady: parseInt(notReady?.count as string || '0'),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
