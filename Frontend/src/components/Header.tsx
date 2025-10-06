import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PL</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PeerLearn</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/browse" className="text-gray-600 hover:text-gray-900 font-medium">
              Find Teachers
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                  Dashboard
                </Link>
                <Link to="/wallet" className="text-gray-600 hover:text-gray-900 font-medium">
                  Wallet
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                  Login
                </Link>
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* User actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Coin balance */}
                <div className="hidden md:flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full">
                  <span className="text-yellow-600 text-sm">💰</span>
                  <span className="text-yellow-700 font-medium text-sm">
                    {user.wallet?.balance || 0} coins
                  </span>
                </div>

                {/* User avatar */}
                <Link 
                  to="/profile" 
                  className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <span className="text-white text-sm font-medium">
                    {user.avatar || user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="md:hidden flex space-x-2">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
                  Login
                </Link>
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;