import { Link } from "react-router-dom";

function Dashboard() {
  // Mock data for demonstration
  const upcomingSessions = [
    {
      id: 1,
      type: "learning",
      skill: "React Development",
      teacher: "Sarah Chen",
      date: "Today",
      time: "2:00 PM",
      status: "confirmed",
      avatar: "SC"
    },
    {
      id: 2,
      type: "teaching",
      skill: "Spanish Conversation",
      student: "Mike Johnson",
      date: "Tomorrow",
      time: "10:00 AM",
      status: "pending",
      avatar: "MJ"
    },
    {
      id: 3,
      type: "learning",
      skill: "Guitar Basics",
      teacher: "Alex Rivera",
      date: "Dec 28",
      time: "4:00 PM",
      status: "confirmed",
      avatar: "AR"
    }
  ];

  const recentMessages = [
    {
      id: 1,
      name: "Sarah Chen",
      message: "Looking forward to our React session today!",
      time: "10 min ago",
      unread: true,
      avatar: "SC"
    },
    {
      id: 2,
      name: "Mike Johnson",
      message: "Can we reschedule tomorrow's Spanish lesson?",
      time: "1 hour ago",
      unread: true,
      avatar: "MJ"
    },
    {
      id: 3,
      name: "Emma Davis",
      message: "Thanks for the great Python session!",
      time: "2 hours ago",
      unread: false,
      avatar: "ED"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
        <p className="text-gray-600">Here's what's happening with your learning journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coin Balance</p>
              <p className="text-2xl font-bold text-yellow-600">250</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessions This Month</p>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Students Taught</p>
              <p className="text-2xl font-bold text-green-600">8</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👨‍🏫</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-purple-600">4.9</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
              <Link to="/browse" className="text-blue-600 hover:text-blue-700 font-medium">
                Book New Session
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                      session.type === 'learning' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {session.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{session.skill}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          session.type === 'learning' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {session.type === 'learning' ? 'Learning' : 'Teaching'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        with {session.type === 'learning' ? session.teacher : session.student}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{session.date}</p>
                    <p className="text-sm text-gray-600">{session.time}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      session.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {upcomingSessions.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-gray-600 mb-4">No upcoming sessions</p>
                <Link 
                  to="/browse" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Your First Session
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Messages & Notifications */}
        <div className="space-y-6">
          {/* Recent Messages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <Link to="/chat" className="text-blue-600 hover:text-blue-700 font-medium">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentMessages.map((message) => (
                <Link 
                  key={message.id} 
                  to="/chat"
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {message.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{message.name}</p>
                      {message.unread && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{message.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{message.time}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/browse" 
                className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-2xl">🔍</span>
                <span className="font-medium text-blue-700">Find Teachers</span>
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span className="text-2xl">👨‍🏫</span>
                <span className="font-medium text-green-700">Update Teaching Profile</span>
              </Link>
              <Link 
                to="/wallet" 
                className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <span className="text-2xl">💰</span>
                <span className="font-medium text-yellow-700">Buy Coins</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;