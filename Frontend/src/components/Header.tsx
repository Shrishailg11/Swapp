import { Link } from "react-router-dom";

function Header() {
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
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
            <Link to="/wallet" className="text-gray-600 hover:text-gray-900 font-medium">
              Wallet
            </Link>
          </nav>

          {/* User actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full">
              <span className="text-yellow-600 text-sm">💰</span>
              <span className="text-yellow-700 font-medium text-sm">250 coins</span>
            </div>
            <Link 
              to="/profile" 
              className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-sm font-medium">JD</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;