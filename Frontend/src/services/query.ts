import api from './api';

export interface Query {
  _id: string;
  title: string;
  description: string;
  category: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  responses: Array<{
    responder: {
      _id: string;
      name: string;
      avatar?: string;
    };
    message: string;
    timestamp: string;
  }>;
  helpers: Array<{
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface QueryFilters {
  category?: string;
  status?: string;
  limit?: number;
  page?: number;
}

export interface CreateQueryData {
  title: string;
  description: string;
  category: string;
}

// Validate ObjectId format
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper function to extract error message from axios error
const extractErrorMessage = (error: any): string => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || 'An unexpected error occurred';
};

export const queryService = {
  // Get all queries with filters
  getAllQueries: async (filters: QueryFilters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.page) params.append('page', filters.page.toString());

    try {
      const response = await api.get(`/queries?${params}`);
      return response.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Get single query by ID
  getQueryById: async (id: string) => {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid query ID format');
    }
    try {
      const response = await api.get(`/queries/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Create a new query
  createQuery: async (data: CreateQueryData) => {
    try {
      const response = await api.post('/queries', data);
      return response.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Update query status
  updateQueryStatus: async (id: string, status: string) => {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid query ID format');
    }
    try {
      const response = await api.put(`/queries/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Delete a query
  deleteQuery: async (id: string) => {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid query ID format');
    }
    try {
      const response = await api.delete(`/queries/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Express interest in helping
  helpWithQuery: async (id: string) => {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid query ID format');
    }
    try {
      const response = await api.post(`/queries/${id}/help`);
      return response.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  }
};