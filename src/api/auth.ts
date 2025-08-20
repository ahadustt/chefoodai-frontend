import { apiClient, tokenManager, RegisterData, LoginData, AuthResponse, User, ChangePasswordRequest, DeleteAccountRequest, UserDataExport } from './client';

export const authAPI = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/login', data);
    const { access_token, refresh_token } = response.data;
    tokenManager.setTokens(access_token, refresh_token);
    return response.data;
  },

  logout: () => {
    tokenManager.clearTokens();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/v1/users/me');
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.put('/api/v1/users/change-password', data);
    return response.data;
  },

  exportUserData: async (): Promise<UserDataExport> => {
    const response = await apiClient.get('/api/v1/users/export-data');
    return response.data;
  },

  deleteAccount: async (data: DeleteAccountRequest): Promise<{ message: string }> => {
    const response = await apiClient.delete('/api/v1/users/account', { data });
    tokenManager.clearTokens(); // Clear tokens after account deletion
    return response.data;
  },

  updateNotificationSettings: async (settings: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    marketing?: boolean;
    recipes?: boolean;
    mealPlans?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    frequency?: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.put('/api/v1/users/notification-settings', settings);
    return response.data;
  },

  updatePrivacySettings: async (settings: {
    profileVisibility?: 'public' | 'private' | 'friends';
    dataSharing?: boolean;
    analytics?: boolean;
    thirdParty?: boolean;
  }): Promise<{ message: string }> => {
    const response = await apiClient.put('/api/v1/users/privacy-settings', settings);
    return response.data;
  },

  getNotificationSettings: async (): Promise<{
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    recipes: boolean;
    mealPlans: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    frequency: string;
  }> => {
    const response = await apiClient.get('/api/v1/users/notification-settings');
    return response.data;
  },

  getPrivacySettings: async (): Promise<{
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
    analytics: boolean;
    thirdParty: boolean;
  }> => {
    const response = await apiClient.get('/api/v1/users/privacy-settings');
    return response.data;
  },
};