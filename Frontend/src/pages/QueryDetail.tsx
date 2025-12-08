import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { queryService, Query } from "../services/query";

function QueryDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState<Query | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadQuery();
    }
  }, [id]);

  const loadQuery = async () => {
    try {
      setLoading(true);
      const response = await queryService.getQueryById(id!);
      setQuery(response.data.query);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to load query');
      console.error('Error loading query:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this query?')) {
      return;
    }

    try {
      await queryService.deleteQuery(id!);
      navigate('/queries');
    } catch (error: any) {
      alert(error.message || 'Failed to delete query');
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const response = await queryService.updateQueryStatus(id!, status);
      setQuery(response.data.query);
    } catch (error: any) {
      alert(error.message || 'Failed to update query status');
    }
  };

  const handleHelp = async () => {
    try {
      const response = await queryService.helpWithQuery(id!);
      setQuery(response.data.query);
      // Redirect to chat with the query author
      // You might want to implement a more specific chat initiation
      alert('Your interest in helping has been recorded! You can now message the author directly.');
    } catch (error: any) {
      // Check if it's the "already helping" error
      if (error.message && error.message.includes('already expressed interest')) {
        alert('You have already offered to help with this query.');
      } else {
        alert(error.message || 'Failed to record help interest');
      }
    }
  };

  // Safe function to get initials from name
  const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Safe function to get avatar or initials
  const getAvatarOrInitials = (avatar: string | undefined, name: string | undefined): string => {
    if (avatar) return avatar;
    return getInitials(name);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !query) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Query not found'}
        </div>
        <div className="mt-4">
          <Link 
            to="/queries" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to queries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/queries" 
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to queries
        </Link>
      </div>

      {/* Query Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
              {getAvatarOrInitials(query.author.avatar, query.author.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{query.title}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-gray-600">{query.author.name}</p>
                <span className="text-gray-400">•</span>
                <p className="text-gray-500 text-sm">
                  {new Date(query.createdAt).toLocaleDateString()} at {new Date(query.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-sm rounded-full ${
              query.status === 'open' ? 'bg-green-100 text-green-700' :
              query.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
              query.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {query.status.charAt(0).toUpperCase() + query.status.slice(1).replace('-', ' ')}
            </span>
            {user && user._id === query.author._id && (
              <>
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full mb-4">
            {query.category.charAt(0).toUpperCase() + query.category.slice(1)}
          </div>
          <p className="text-gray-700 whitespace-pre-line">{query.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span>{query.helpers.length} people offered to help</span>
            </div>
          </div>

          <div className="flex space-x-3">
            {user && user._id === query.author._id ? (
              <>
                {query.status === 'open' && (
                  <select
                    value={query.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                )}
                {query.status === 'in-progress' && (
                  <button
                    onClick={() => handleStatusChange('resolved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                )}
              </>
            ) : (
              <>
                {query.status === 'open' && (
                  <button
                    onClick={handleHelp}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    I Can Help
                  </button>
                )}
                <Link
                  to={`/chat?user=${query.author._id}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Message Author
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Helpers List */}
      {query.helpers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">People Offering to Help</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {query.helpers.map((helper) => (
              <div key={helper.user._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {getAvatarOrInitials(helper.user.avatar, helper.user.name)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{helper.user.name || 'Unknown User'}</p>
                  <p className="text-gray-500 text-xs">
                    Offered on {new Date(helper.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Timeline</h3>
        <div className="space-y-4">
          <div className="flex">
            <div className="flex flex-col items-center mr-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
            </div>
            <div className="pb-4">
              <p className="font-medium text-gray-900">Query Posted</p>
              <p className="text-gray-600 text-sm">
                {new Date(query.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          {query.status !== 'open' && (
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
              </div>
              <div className="pb-4">
                <p className="font-medium text-gray-900">
                  {query.status === 'in-progress' ? 'Work Started' : 
                   query.status === 'resolved' ? 'Marked as Resolved' : 
                   'Query Closed'}
                </p>
                <p className="text-gray-600 text-sm">
                  Status changed to {query.status.replace('-', ' ')}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex">
            <div className="flex flex-col items-center mr-4">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {query.status === 'open' ? 'Waiting for Responses' : 
                 query.status === 'in-progress' ? 'In Progress' : 
                 query.status === 'resolved' ? 'Completed' : 
                 'Query Closed'}
              </p>
              <p className="text-gray-600 text-sm">
                {query.status === 'open' ? 'Others can offer to help' : 
                 query.status === 'in-progress' ? 'Someone is working on this' : 
                 query.status === 'resolved' ? 'Issue has been resolved' : 
                 'This query is closed'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueryDetail;