import api from './api';

export interface AgoraTokenResponse {
  success: boolean;
  data: {
    appId: string;
    channelName: string;
    uid: number;
    token: string;
    expireAt: number;
    isMock?: boolean; 
  };
}

export const videoService = {
  async getToken(params: {
    channelName: string;
    uid?: string | number;
    role?: 'publisher' | 'subscriber';
    expireSeconds?: number;
  }): Promise<AgoraTokenResponse> {
    const response = await api.post('/video/token', params);
    return response.data;
  }
};


