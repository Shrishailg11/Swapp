import { useState } from "react";

function Wallet() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock wallet data
  const walletData = {
    balance: 250,
    totalEarned: 480,
    totalSpent: 230,
    pendingEarnings: 75
  };

  const transactions = [
    {
      id: 1,
      type: "earned",
      amount: 25,
      description: "React Development session with Mike Johnson",
      date: "Dec 26, 2024",
      time: "2:30 PM",
      status: "completed"
    },
    {
      id: 2,
      type: "spent",
      amount: -20,
      description: "Guitar lesson with Alex Rivera",
      date: "Dec 25, 2024",
      time: "4:00 PM",
      status: "completed"
    },
    {
      id: 3,
      type: "earned",
      amount: 30,
      description: "JavaScript tutoring with Sarah Chen",
      date: "Dec 24, 2024",
      time: "10:00 AM",
      status: "completed"
    },
    {
      id: 4,
      type: "spent",
      amount: -18,
      description: "Spanish conversation with Maria Santos",
      date: "Dec 23, 2024",
      time: "3:00 PM",
      status: "completed"
    },
    {
      id: 5,
      type: "purchased",
      amount: 100,
      description: "Coin purchase - Starter Pack",
      date: "Dec 22, 2024",
      time: "9:15 AM",
      status: "completed"
    },
    {
      id: 6,
      type: "earned",
      amount: 25,
      description: "Node.js session with Emma Davis",
      date: "Dec 21, 2024",
      time: "1:00 PM",
      status: "pending"
    }
  ];

  const coinPackages = [
    {
      id: 1,
      name: "Starter Pack",
      coins: 100,
      price: 9.99,
      bonus: 0,
      popular: false
    },
    {
      id: 2,
      name: "Learning Pack",
      coins: 250,
      price: 19.99,
      bonus: 25,
      popular: true
    },
    {
      id: 3,
      name: "Pro Pack",
      coins: 500,
      price: 34.99,
      bonus: 75,
      popular: false
    },
    {
      id: 4,
      name: "Master Pack",
      coins: 1000,
      price: 59.99,
      bonus: 200,
      popular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h1>
        <p className="text-gray-600">Manage your coins, track earnings, and purchase new coin packages</p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Current Balance</p>
              <p className="text-3xl font-bold">{walletData.balance}</p>
              <p className="text-yellow-100 text-sm">coins</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-green-600">{walletData.totalEarned}</p>
              <p className="text-xs text-gray-500">coins</p>
            </div>
            <span className="text-2xl">📈</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">{walletData.totalSpent}</p>
              <p className="text-xs text-gray-500">coins</p>
            </div>
            <span className="text-2xl">📉</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Earnings</p>
              <p className="text-2xl font-bold text-blue-600">{walletData.pendingEarnings}</p>
              <p className="text-xs text-gray-500">coins</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Transaction History" },
              { id: "buy", label: "Buy Coins" },
              { id: "earnings", label: "Earnings" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Transaction History Tab */}
          {activeTab === "overview" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Transactions</option>
                    <option>Earned</option>
                    <option>Spent</option>
                    <option>Purchased</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                    <option>Last 3 months</option>
                    <option>All time</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'earned' ? 'bg-green-100' :
                        transaction.type === 'spent' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <span className="text-lg">
                          {transaction.type === 'earned' ? '💰' :
                           transaction.type === 'spent' ? '📚' : '🛒'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.date} at {transaction.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} coins
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Load More Transactions
                </button>
              </div>
            </div>
          )}

          {/* Buy Coins Tab */}
          {activeTab === "buy" && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Coin Package</h3>
                <p className="text-gray-600">Select the perfect package for your learning journey</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {coinPackages.map((pkg) => (
                  <div key={pkg.id} className={`relative bg-white border-2 rounded-xl p-6 ${
                    pkg.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}>
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h4>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-yellow-600">{pkg.coins}</span>
                        {pkg.bonus > 0 && (
                          <span className="text-sm text-green-600 ml-1">+{pkg.bonus} bonus</span>
                        )}
                        <p className="text-sm text-gray-600">coins</p>
                      </div>
                      <div className="mb-6">
                        <span className="text-2xl font-bold text-gray-900">${pkg.price}</span>
                      </div>
                      <button className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        pkg.popular 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                        Purchase Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">How Coins Work</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Use coins to book learning sessions with teachers</li>
                      <li>• Earn coins by teaching others your skills</li>
                      <li>• Coins never expire and can be used anytime</li>
                      <li>• Get bonus coins with larger packages</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Teaching Earnings</h3>
                <p className="text-gray-600">Track your income from teaching sessions</p>
              </div>

              {/* Earnings Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">This Month</p>
                      <p className="text-2xl font-bold text-green-700">125 coins</p>
                    </div>
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">This Week</p>
                      <p className="text-2xl font-bold text-blue-700">55 coins</p>
                    </div>
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Average per Session</p>
                      <p className="text-2xl font-bold text-purple-700">25 coins</p>
                    </div>
                    <span className="text-2xl">💎</span>
                  </div>
                </div>
              </div>

              {/* Earnings by Skill */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-4">Earnings by Skill</h4>
                <div className="space-y-3">
                  {[
                    { skill: "JavaScript", sessions: 8, earnings: 200, rate: 25 },
                    { skill: "React", sessions: 6, earnings: 150, rate: 25 },
                    { skill: "Node.js", sessions: 4, earnings: 100, rate: 25 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{item.skill}</h5>
                        <p className="text-sm text-gray-600">{item.sessions} sessions taught</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{item.earnings} coins earned</p>
                        <p className="text-sm text-gray-600">{item.rate} coins/hour</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payout Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-2">Payout Information</h4>
                    <p className="text-yellow-700 text-sm mb-3">
                      Earnings are automatically added to your coin balance after each completed session. 
                      You can use earned coins immediately or convert them to cash.
                    </p>
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
                      Request Cash Payout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wallet;