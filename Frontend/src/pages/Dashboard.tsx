import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/user";

interface DashboardData {
  user: {
    name: string;
    avatar: string;
  };
  upcomingSessions: Array<{
    id: string;
    type: string;
    skill: string;
    teacher?: string;
    student?: string;
    date: string;
    time: string;
    status: string;
    avatar: string;
  }>;
  recentMessages: Array<{
    id: string;
    name: string;
    message: string;
    time: string;
    unread: boolean;
    avatar: string;
  }>;
  stats: {
    coinBalance: number;
    sessionsThisMonth: number;
    studentsTaught: number;
    averageRating: number;
  };
  quickActions: Array<{
    id: string;
    icon: string;
    label: string;
    link: string;
  }>;
  hasActivity: boolean; // Add this field
}

function Dashboard() {
  const { user: currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await userService.getDashboard();
      setDashboardData(response.data);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Failed to load dashboard</p>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, quickActions } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {dashboardData.user.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          {dashboardData.hasActivity 
            ? "Here's what's happening with your learning journey"
            : "Ready to start your learning journey?"
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coin Balance</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.coinBalance}</p>
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
              <p className="text-2xl font-bold text-blue-600">{stats.sessionsThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {currentUser?.role === 'teacher' ? 'Students Taught' : 'Teachers Learned From'}
              </p>
              <p className="text-2xl font-bold text-green-600">{stats.studentsTaught}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">
                {currentUser?.role === 'teacher' ? '👨‍🏫' : '🎓'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-purple-600">{stats.averageRating.toFixed(1)}</p>
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

            {dashboardData.upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingSessions.map((session) => (
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
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
                <p className="text-gray-600 mb-4">
                  {currentUser?.role === 'teacher' 
                    ? "Start offering your expertise to students"
                    : "Book your first learning session to get started"
                  }
                </p>
                <Link 
                  to="/browse" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  {currentUser?.role === 'teacher' ? 'Update Your Profile' : 'Find Teachers'}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Messages & Quick Actions */}
        <div className="space-y-6">
          {/* Recent Messages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              {dashboardData.recentMessages.length > 0 && (
                <Link to="/chat" className="text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </Link>
              )}
            </div>

            {dashboardData.recentMessages.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentMessages.map((message) => (
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
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">💬</span>
                </div>
                <p className="text-gray-500 text-sm">No messages yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  {currentUser?.role === 'teacher' 
                    ? "Students will message you here"
                    : "Connect with teachers to start chatting"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link 
                  key={action.id}
                  to={action.link}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="font-medium text-gray-700">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;