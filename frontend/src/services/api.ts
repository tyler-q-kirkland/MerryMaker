import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface User {
  id: number;
  email: string;
  name: string;
  picture_url?: string;
  word?: string;
  card_sent_this_season?: boolean;
}

export interface UserStats {
  total: number;
  readyToReceive: number;
  receivedCards: number;
  notReady: number;
}

export interface ChristmasCard {
  id: number;
  sender_id: number;
  recipient_id: number;
  ceo_message: string;
  ai_generated_message?: string;
  festive_image_url?: string;
  card_token: string;
  viewed: boolean;
  created_at: string;
}

// Auth
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const loginWithGoogle = (): void => {
  window.location.href = `${API_URL}/auth/google`;
};

// Users
export const getUserProfile = async (): Promise<User> => {
  const response = await api.get('/api/users/profile');
  return response.data;
};

export const updateWord = async (word: string): Promise<void> => {
  await api.put('/api/users/word', { word });
};

export const uploadPicture = async (file: File): Promise<{ pictureUrl: string }> => {
  const formData = new FormData();
  formData.append('picture', file);
  const response = await api.post('/api/users/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAllUsers = async (showSent: boolean = false): Promise<User[]> => {
  const response = await api.get('/api/users/all', {
    params: { showSent: showSent ? 'true' : 'false' }
  });
  return response.data;
};

// Cards
export interface CardPreview {
  recipientId: number;
  recipientName: string;
  recipientEmail: string;
  ceoMessage: string;
  aiGeneratedMessage: string;
  festiveImageUrl: string;
  usedFallback?: boolean;
}

export const previewChristmasCard = async (
  recipientId: number,
  ceoMessage: string
): Promise<CardPreview> => {
  const response = await api.post('/api/cards/preview', {
    recipientId,
    ceoMessage,
  });
  return response.data.preview;
};

export const confirmChristmasCard = async (
  recipientId: number,
  ceoMessage: string,
  finalMessage: string,
  festiveImageUrl: string
): Promise<ChristmasCard> => {
  const response = await api.post('/api/cards/confirm', {
    recipientId,
    ceoMessage,
    finalMessage,
    festiveImageUrl,
  });
  return response.data.card;
};

export const getCardByToken = async (token: string): Promise<any> => {
  const response = await api.get(`/api/cards/${token}`);
  return response.data;
};

export const getSentCards = async (): Promise<ChristmasCard[]> => {
  const response = await api.get('/api/cards/sent/all');
  return response.data;
};

export const getUserStats = async (): Promise<UserStats> => {
  const response = await api.get('/api/users/stats');
  return response.data;
};

export const resetCardSeason = async (): Promise<void> => {
  await api.post('/api/cards/reset-season');
};

export default api;
