import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { generateChristmasMessage, generateFestiveImage } from '../services/aiService';
import { composeFestiveImage } from '../services/imageService';
import { sendChristmasCardEmail } from '../services/emailService';

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Middleware to check if user is CEO
const requireCEO = (req: any, res: any, next: any) => {
  if (req.user.email !== process.env.CEO_EMAIL) {
    return res.status(403).json({ error: 'Only CEO can send Christmas cards' });
  }
  next();
};

// Preview a Christmas card (CEO only) - generates but doesn't save or send
router.post('/preview', requireAuth, requireCEO, async (req: any, res: any) => {
  try {
    const { recipientId, ceoMessage } = req.body;

    if (!recipientId || !ceoMessage) {
      return res.status(400).json({ error: 'Recipient ID and message are required' });
    }

    // Get recipient details
    const recipient = await db('users').where({ id: recipientId }).first();
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (!recipient.word) {
      return res.status(400).json({ error: 'Recipient has not set their word yet' });
    }

    if (!recipient.picture_url) {
      return res.status(400).json({ error: 'Recipient has not uploaded their picture yet' });
    }

    // Get CEO details
    const ceo = await db('users').where({ id: req.user.id }).first();
    if (!ceo.picture_url) {
      return res.status(400).json({ error: 'CEO has not uploaded their picture yet' });
    }

    // Generate AI composite message that combines CEO's message with recipient's word
    const compositeMessage = await generateChristmasMessage(ceoMessage, recipient.word);

    // Generate AI festive image showing both people celebrating Christmas
    const aiGeneratedImageUrl = await generateFestiveImage(
      ceo.picture_url,
      recipient.picture_url,
      ceo.name,
      recipient.name
    );

    // Download and save the AI-generated image, or compose with actual photos as fallback
    const festiveImageUrl = await composeFestiveImage(
      ceo.picture_url,
      recipient.picture_url,
      aiGeneratedImageUrl
    );

    // Return preview data without saving to database
    res.json({
      preview: {
        recipientId,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        ceoMessage,
        aiGeneratedMessage: compositeMessage,
        festiveImageUrl,
      },
    });
  } catch (error) {
    console.error('Error generating card preview:', error);
    res.status(500).json({ error: 'Failed to generate card preview' });
  }
});

// Confirm and send a Christmas card (CEO only) - saves and sends the card
router.post('/confirm', requireAuth, requireCEO, async (req: any, res: any) => {
  try {
    const { recipientId, ceoMessage, finalMessage, festiveImageUrl } = req.body;

    if (!recipientId || !ceoMessage || !finalMessage || !festiveImageUrl) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get recipient details
    const recipient = await db('users').where({ id: recipientId }).first();
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Create unique token for the card
    const cardToken = uuidv4();

    // Save card to database
    const [card] = await db('christmas_cards')
      .insert({
        sender_id: req.user.id,
        recipient_id: recipientId,
        ceo_message: ceoMessage, // Keep original for reference
        ai_generated_message: finalMessage, // This is the final (possibly edited) message
        festive_image_url: festiveImageUrl,
        card_token: cardToken,
      })
      .returning('*');

    // Mark recipient as having received a card this season
    await db('users')
      .where({ id: recipientId })
      .update({ card_sent_this_season: true });

    // Send email to recipient
    await sendChristmasCardEmail(recipient.email, recipient.name, cardToken);

    res.json({
      message: 'Christmas card sent successfully',
      card,
    });
  } catch (error) {
    console.error('Error sending Christmas card:', error);
    res.status(500).json({ error: 'Failed to send Christmas card' });
  }
});

// Get a Christmas card by token (public route)
router.get('/:token', async (req: any, res: any) => {
  try {
    const { token } = req.params;

    const card = await db('christmas_cards')
      .where({ card_token: token })
      .first();

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Get sender and recipient details
    const sender = await db('users')
      .select('name', 'picture_url')
      .where({ id: card.sender_id })
      .first();

    const recipient = await db('users')
      .select('name', 'picture_url')
      .where({ id: card.recipient_id })
      .first();

    // Mark card as viewed if not already
    if (!card.viewed) {
      await db('christmas_cards')
        .where({ id: card.id })
        .update({
          viewed: true,
          viewed_at: new Date(),
        });
    }

    res.json({
      card: {
        message: card.ai_generated_message, // Only send the composite AI message
        festiveImageUrl: card.festive_image_url,
        sender: sender.name,
        recipient: recipient.name,
        createdAt: card.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Get all sent cards (CEO only)
router.get('/sent/all', requireAuth, requireCEO, async (req: any, res: any) => {
  try {
    const cards = await db('christmas_cards')
      .select(
        'christmas_cards.*',
        'users.name as recipient_name',
        'users.email as recipient_email'
      )
      .join('users', 'christmas_cards.recipient_id', 'users.id')
      .where({ sender_id: req.user.id })
      .orderBy('christmas_cards.created_at', 'desc');

    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sent cards' });
  }
});

// Reset card sent status for all users (CEO only)
router.post('/reset-season', requireAuth, requireCEO, async (req: any, res: any) => {
  try {
    // Reset all users' card_sent_this_season to false
    await db('users')
      .update({ card_sent_this_season: false });

    res.json({
      message: 'Card sent status reset for all users',
    });
  } catch (error) {
    console.error('Error resetting season:', error);
    res.status(500).json({ error: 'Failed to reset season' });
  }
});

export default router;
