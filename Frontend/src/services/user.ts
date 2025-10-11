import api from './api';

export interface TeacherFilters {
  skill?: string;
  rating?: string;
  availability?: string;
  limit?: number;
  page?: number;
}

export interface Teacher {
  _id: string;
  name: string;
  avatar?: string;
  bio: string;
  location: string;
  role: string;
  teachingSkills: Array<{
    skill: string;
    level: string;
    hourlyRate: number;
    sessions: number;
    rating: number;
  }>;
  stats: {
    totalSessions: number;
    averageRating: number;
    totalReviews: number;
  };
  memberSince: string;
  isOnline: boolean;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio: string;
  location: string;
  memberSince: string;
  teachingSkills: Array<{
    skill: string;
    level: string;
    hourlyRate: number;
    sessions: number;
    rating: number;
  }>;
  learningSkills: Array<{
    skill: string;
    level: string;
    progress: number;
  }>;
  availability: {
    monday: { available: boolean; hours: string };
    tuesday: { available: boolean; hours: string };
    wednesday: { available: boolean; hours: string };
    thursday: { available: boolean; hours: string };
    friday: { available: boolean; hours: string };
    saturday: { available: boolean; hours: string };
    sunday: { available: boolean; hours: string };
  };
  stats: {
    totalSessions: number;
    averageRating: number;
    totalReviews: number;
  };
  wallet: {
    balance: number;
  };
}

export const userService = {
  // Get all teachers with filters
  getTeachers: async (filters: TeacherFilters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.rating) params.append('rating', filters.rating);
    if (filters.availability) params.append('availability', filters.availability);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const response = await api.get(`/users/teachers?${params}`);
    return response.data;
  },

  // Get current user profile
  getCurrentProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data.data.user;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<UserProfile>) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  getDashboard: async () => {
    const response = await api.get('/users/dashboard');
    return response.data;
  },

  // Get user wallet data
  getWallet: async () => {
    const response = await api.get('/users/wallet');
    return response.data;
  },
};