import api from './api';

export interface Message {
  id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  userId: string;
  user: {
    name: string;
    avatar?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export const messageService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/messages');
    return response.data.data.conversations;
  },
  
  async getMessagesWithUser(userId: string): Promise<Message[]> {
    const response = await api.get(`/messages/${userId}`);
    return response.data.data.messages;
  }
};