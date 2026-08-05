import { UserProfile } from '../types';
import { API_BASE_URL } from '../config';

const SESSION_KEY = 'feedhope_session';

export const authService = {
  getCurrentUser: async (): Promise<UserProfile | null> => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      if (!res.ok) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return await res.json();
    } catch (error) {
      return null;
    }
  },

  login: async ({ email, password, fullName }: { email: string; password?: string; fullName?: string }): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName })
    });
    if (!res.ok) {
      let errMsg = 'Failed to login/register user';
      try {
        const errJson = await res.json();
        if (errJson && errJson.error) {
          errMsg = errJson.error;
        }
      } catch (_) { }
      throw new Error(errMsg);
    }

    const user: UserProfile = await res.json();
    localStorage.setItem(SESSION_KEY, user.user_id);
    return user;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
  },

  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    let currentUser = await authService.getCurrentUser();

    if (!currentUser) {
      // Create a default session user if user onboarded directly without prior login
      const guestId = `user-${Date.now()}`;
      currentUser = {
        user_id: guestId,
        email: `user_${guestId.slice(-6)}@feedhope.org`,
        full_name: 'FeedHope User',
        app_role: 'citizen'
      };
    }

    const updatedUser = { ...currentUser, ...updates };

    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    });
    if (!res.ok) {
      let errMsg = 'Failed to update profile';
      try {
        const errJson = await res.json();
        if (errJson && errJson.error) errMsg = errJson.error;
      } catch (_) { }
      throw new Error(errMsg);
    }

    const saved: UserProfile = await res.json();
    localStorage.setItem(SESSION_KEY, saved.user_id);
    return saved;
  }
};