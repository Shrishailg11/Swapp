import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useNavigate, Link } from "react-router-dom"; // Add useNavigate and Link
import { socketService } from "../services/socket";
import { messageService, Message, Conversation } from "../services/message";
import { userService } from "../services/user";

function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Add navigate
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize component safely
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Check for teacher parameter in URL - only after component is initialized
  useEffect(() => {
    if (!initialized || !user?._id) return;

    const teacherId = searchParams.get('teacher');
    if (teacherId) {
      // Start conversation with this teacher
      handleStartConversation(teacherId).catch(err => {
        console.error('Error starting conversation:', err);
        setError('Failed to start conversation');
      });
    }
  }, [searchParams, user?._id, initialized]);

  // Connect to socket safely
  useEffect(() => {
    if (!initialized || !user?._id) return;

    let isMounted = true;

    const connectSocket = async () => {
      try {
        if (isMounted) {
          console.log('🔌 Connecting to socket for user:', user._id);
          socketService.connect(user._id);
          
          // Listen for incoming messages
          socketService.onReceiveMessage((message: Message) => {
            console.log('📨 Received message via socket:', message);
            if (isMounted) {
              setMessages(prev => {
                console.log('📝 Adding message to state, previous count:', prev.length);
                return [...prev, message];
              });
              
              // Update conversations list
              setConversations(prev => 
                prev.map(conv => 
                  conv.userId === message.sender._id 
                    ? { ...conv, lastMessage: message, unreadCount: conv.unreadCount + 1 }
                    : conv
                )
              );
            }
          });

          // Listen for message sent confirmation
          socketService.onMessageSent((data) => {
            console.log('✅ Message sent confirmation:', data);
          });

          // Listen for message errors
          // Note: This would need to be added to socket service
        }
      } catch (err) {
        console.error('❌ Socket connection error:', err);
        if (isMounted) {
          setError('Failed to connect to chat server');
        }
      }
    };

    // Small delay to ensure component is fully mounted
    setTimeout(connectSocket, 100);

    return () => {
      console.log('🔌 Disconnecting socket');
      isMounted = false;
      socketService.disconnect();
    };
  }, [user?._id, initialized]);

  // Load conversations safely
  useEffect(() => {
    if (!initialized || !user?._id) return;

    const loadConversationsSafe = async () => {
      try {
        console.log('📚 Loading conversations for user:', user._id);
        const data = await messageService.getConversations();
        console.log('📚 Loaded conversations:', data?.length || 0, 'conversations');
        
        if (data && data.length > 0) {
          setConversations(data);
          console.log('📚 Set conversations in state');
          setError(null);
          
          // If no teacher param and we have conversations, select the first one
          if (!searchParams.get('teacher') && !selectedConversation) {
            const firstConversation = data[0];
            console.log('🎯 Auto-selecting first conversation:', firstConversation.userId);
            setSelectedConversation(firstConversation.userId);
            setSelectedUser(firstConversation.user);
          }
        } else {
          console.log('📚 No conversations found');
        }
      } catch (err) {
        console.error('❌ Error loading conversations:', err);
      }
    };

    loadConversationsSafe();
  }, [user?._id, initialized, searchParams]);

  // Load messages and user details when conversation is selected
  useEffect(() => {
    if (!initialized || !selectedConversation || !user?._id) return;

    const loadConversationData = async () => {
      try {
        // Load messages
        setLoading(true);
        console.log('Loading messages for conversation:', selectedConversation); // Debug log
        const messagesData = await messageService.getMessagesWithUser(selectedConversation);
        console.log('Loaded messages:', messagesData); // Debug log
        if (messagesData) {
          setMessages(messagesData);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
        setMessages([]); // Set empty array on error
      } finally {
        setLoading(false);
      }

      try {
        // Load user details
        setLoadingUser(true);
        const teacher = await userService.getUserById(selectedConversation);
        if (teacher) {
          setSelectedUser(teacher);
          
          // Update the conversation with real user data
          setConversations(prev => 
            prev.map(conv => 
              conv.userId === selectedConversation 
                ? { ...conv, user: { name: teacher.name, avatar: teacher.avatar } }
                : conv
            )
          );
        }
      } catch (err) {
        console.error('Error loading user details:', err);
        // Set fallback user data
        setSelectedUser({
          _id: selectedConversation,
          name: 'Teacher',
          avatar: undefined
        });
      } finally {
        setLoadingUser(false);
      }

      // Mark messages as read (don't fail if this doesn't work)
      try {
        socketService.markAsRead({ 
          senderId: selectedConversation, 
          receiverId: user._id 
        });
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    };

    loadConversationData();
  }, [selectedConversation, user?._id, initialized]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleStartConversation = async (teacherId: string) => {
    try {
      console.log('Starting conversation with teacher:', teacherId); // Debug log
      setSelectedConversation(teacherId);
      
      // Add to conversations list immediately
      const newConversation: Conversation = {
        userId: teacherId,
        user: {
          name: 'Loading...',
          avatar: undefined
        },
        lastMessage: {
          id: '',
          sender: { _id: '', name: '', avatar: undefined },
          receiver: { _id: '', name: '', avatar: undefined },
          content: '',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        unreadCount: 0
      };
      
      setConversations(prev => [newConversation, ...prev.filter(c => c.userId !== teacherId)]);
      setError(null);
    } catch (err) {
      console.error('Error starting conversation:', err);
      throw err;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !user?._id) {
      console.log('❌ Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        selectedConversation, 
        userId: user?._id 
      });
      return;
    }

    try {
      console.log('📤 Sending message to:', selectedConversation);
      const messageData = {
        senderId: user._id,
        receiverId: selectedConversation,
        content: newMessage.trim()
      };

      // Send via socket
      socketService.sendMessage(messageData);
      
      // Optimistically add to UI
      const optimisticMessage: Message = {
        id: Date.now().toString(),
        sender: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        },
        receiver: {
          _id: selectedConversation,
          name: selectedUser?.name || "",
          avatar: selectedUser?.avatar
        },
        content: newMessage.trim(),
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      console.log('⚡ Adding optimistic message to UI');
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage("");
      setError(null);
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch {
      return '';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Show chat interface if we have a selected conversation
  const showChatInterface = !!selectedConversation;

  // Don't render anything until component is initialized
  if (!initialized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">❌</span>
            <div>
              <h3 className="font-medium text-red-900 mb-2">Chat Error</h3>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && !selectedConversation ? (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Find teachers and start chatting!</p>
                <Link 
                  to="/browse" 
                  className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Teachers
                </Link>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() => {
                    setSelectedConversation(conversation.userId);
                    setError(null);
                    // Update URL without teacher param when selecting existing conversation
                    navigate('/chat', { replace: true });
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.userId ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {conversation.user.avatar ? (
                          <img 
                            src={conversation.user.avatar} 
                            alt={conversation.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              // Hide broken images
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          getInitials(conversation.user.name)
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">{conversation.user.name}</p>
                        <div className="flex items-center space-x-2">
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {conversation.lastMessage.createdAt && conversation.lastMessage.createdAt !== new Date().toISOString() ? formatTime(conversation.lastMessage.createdAt) : ''}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content || 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {showChatInterface ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {loadingUser ? (
                        '...'
                      ) : selectedUser?.avatar ? (
                        <img 
                          src={selectedUser.avatar} 
                          alt={selectedUser?.name || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            // Hide broken images
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        getInitials(selectedUser?.name || 'User')
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {loadingUser ? 'Loading...' : selectedUser?.name || 'User'}
                    </h3>
                    <p className="text-sm text-gray-600">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-xl">📞</span>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-xl">📹</span>
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Book Session
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isMe = message.sender._id === user?._id;
                    return (
                      <div
                        key={message.id || message.id || `msg-${index}`} // More reliable key
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isMe 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isMe ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="text-gray-600">Select a conversation to start chatting</p>
                <p className="text-sm text-gray-500 mt-2">Or find teachers in the browse page</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Booking Modal would appear here when "Book Session" is clicked */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Ready to book a session?</h3>
            <p className="text-blue-700 text-sm mb-3">
              After confirming details through chat, you can book a video session with your teacher. 
              Sessions include screen sharing, real-time collaboration, and session recordings.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Learn More About Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;