import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">Swapp</span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link to="/browse" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Find Teachers
              </Link>
              <Link to="/queries" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Community Help
              </Link>
              <Link to="/chat" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Messages
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center">
                <div className="hidden md:block">
                  <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link to="/wallet" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                      Wallet
                    </Link>
                  </div>
                </div>
                
                <div className="ml-4 relative">
                  <div className="flex items-center space-x-3">
                    <Link to="/profile" className="flex text-sm rounded-full focus:outline-none">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {user.avatar || user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/browse" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
              Find Teachers
            </Link>
            <Link to="/queries" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
              Community Help
            </Link>
            <Link to="/chat" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
              Messages
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
                  Dashboard
                </Link>
                <Link to="/wallet" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
                  Wallet
                </Link>
                <Link to="/profile" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
                  Sign in
                </Link>
                <Link to="/signup" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;