import { AppRole } from '../types';
import { API_BASE_URL } from '../config';

export const chatbotService = {
  sendMessage: async (
    userId: string,
    role: AppRole,
    message: string
  ): Promise<string> => {
    const res = await fetch(`${API_BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role, message })
    });

    if (!res.ok) {
      throw new Error('Failed to send message to Hope');
    }

    const data = await res.json();
    return data.response;
  }
};