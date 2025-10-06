import { useState } from "react";

function Chat() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState("");

  // Mock data for conversations
  const conversations = [
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "SC",
      lastMessage: "Looking forward to our React session today!",
      time: "10 min ago",
      unread: 2,
      isOnline: true,
      skill: "React Development"
    },
    {
      id: 2,
      name: "Mike Johnson",
      avatar: "MJ",
      lastMessage: "Can we reschedule tomorrow's Spanish lesson?",
      time: "1 hour ago",
      unread: 1,
      isOnline: false,
      skill: "Spanish Conversation"
    },
    {
      id: 3,
      name: "Emma Davis",
      avatar: "ED",
      lastMessage: "Thanks for the great Python session!",
      time: "2 hours ago",
      unread: 0,
      isOnline: true,
      skill: "Python Basics"
    },
    {
      id: 4,
      name: "Alex Rivera",
      avatar: "AR",
      lastMessage: "What time works best for guitar practice?",
      time: "1 day ago",
      unread: 0,
      isOnline: false,
      skill: "Guitar Lessons"
    }
  ];

  // Mock messages for selected conversation
  const messages = [
    {
      id: 1,
      sender: "Sarah Chen",
      message: "Hi John! I'm excited about our React session today. Do you have any specific topics you'd like to focus on?",
      time: "2:30 PM",
      isMe: false
    },
    {
      id: 2,
      sender: "You",
      message: "Hi Sarah! I'd love to learn more about React hooks, especially useEffect and custom hooks.",
      time: "2:32 PM",
      isMe: true
    },
    {
      id: 3,
      sender: "Sarah Chen",
      message: "Perfect! That's one of my favorite topics to teach. I'll prepare some practical examples we can work through together.",
      time: "2:33 PM",
      isMe: false
    },
    {
      id: 4,
      sender: "You",
      message: "That sounds great! Should I have any specific setup ready?",
      time: "2:35 PM",
      isMe: true
    },
    {
      id: 5,
      sender: "Sarah Chen",
      message: "Just make sure you have VS Code and Node.js installed. I'll share my screen and we can code together. Looking forward to our session today!",
      time: "2:36 PM",
      isMe: false
    }
  ];

  const currentChat = conversations.find(c => c.id === selectedChat);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {conversation.avatar}
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{conversation.name}</p>
                      <div className="flex items-center space-x-2">
                        {conversation.unread > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unread}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{conversation.time}</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mb-1">{conversation.skill}</p>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {currentChat.avatar}
                    </div>
                    {currentChat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{currentChat.name}</h3>
                    <p className="text-sm text-gray-600">{currentChat.skill}</p>
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
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isMe 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.isMe ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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