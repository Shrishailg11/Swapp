import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  
  connect(userId: string) {
    console.log('🔌 Creating socket connection...');
    this.socket = io('http://localhost:5000');
    
    this.socket.on('connect', () => {
      console.log('✅ Socket connected, joining room:', userId);
      this.socket?.emit('join', userId);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      console.log('🔌 Manually disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  sendMessage(data: { senderId: string; receiverId: string; content: string }) {
    if (this.socket?.connected) {
      console.log('📤 Sending message via socket:', data);
      this.socket.emit('private_message', data);
    } else {
      console.error('❌ Cannot send message: socket not connected');
    }
  }
  
  onReceiveMessage(callback: (message: any) => void) {
    if (this.socket) {
      console.log('👂 Setting up message receiver callback');
      this.socket.on('receive_message', (message) => {
        console.log('📨 Socket received message:', message);
        callback(message);
      });
    }
  }
  
  onMessageSent(callback: (data: { messageId: string }) => void) {
    if (this.socket) {
      this.socket.on('message_sent', callback);
    }
  }
  
  markAsRead(data: { senderId: string; receiverId: string }) {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', data);
    }
  }
  
  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();