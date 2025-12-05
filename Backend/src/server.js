import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import http from 'http';



// Import configurations
import connectDB from './config/database.js';

// Import models
import Message from './models/Message.js';
import User from './models/User.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import sessionRoutes from './routes/sessions.js';
import messageRoutes from './routes/messages.js';
import videoRoutes from './routes/video.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ["GET", "POST"]
  }
});



// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
// app.use(morgan('combined')); // Logging
app.use(limiter); // Rate limiting
app.use(cors({
  origin: '*',
  // origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions',sessionRoutes);
app.use('/api/messages',messageRoutes);
app.use('/api/video', videoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PeerLearn API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT,  () => {
  console.log(`server running on port ${PORT}`);
  // console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});


// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected to socket:', socket.id);

  // Join user's room for private messages
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👥 User ${userId} joined room (socket: ${socket.id})`);
  });

  // Handle private messages
  socket.on('private_message', async (data) => {
    console.log('📨 Received private message:', data);
    try {
      const { senderId, receiverId, content } = data;
      
      // Save message to database
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content
      });
      console.log('💾 Message saved to DB:', message._id);

      // Populate sender and receiver data
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email avatar')
        .populate('receiver', 'name email avatar');

      console.log('📤 Sending message to receiver room:', receiverId);
      // Send to receiver's room
      socket.to(receiverId).emit('receive_message', {
        id: populatedMessage._id,
        sender: {
          _id: populatedMessage.sender._id,
          name: populatedMessage.sender.name,
          avatar: populatedMessage.sender.avatar
        },
        receiver: {
          _id: populatedMessage.receiver._id,
          name: populatedMessage.receiver.name,
          avatar: populatedMessage.receiver.avatar
        },
        content: populatedMessage.content,
        createdAt: populatedMessage.createdAt,
        isRead: false
      });

      // Confirm to sender
      socket.emit('message_sent', { messageId: populatedMessage._id });
      console.log('✅ Message sent confirmation to sender');
      
    } catch (error) {
      console.error('❌ Message error:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('mark_read', async (data) => {
    console.log('👁️ Mark as read:', data);
    try {
      const { senderId, receiverId } = data;
      await Message.updateMany(
        { sender: senderId, receiver: receiverId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    } catch (error) {
      console.error('❌ Mark read error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

export default app;
