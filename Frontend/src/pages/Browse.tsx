import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService, Teacher, TeacherFilters } from "../services/user";
import SessionBooking from "../components/SessionBooking";

function Browse() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<TeacherFilters>({
    skill: '',
    rating: '',
    availability: '',
    limit: 20,
    page: 1
  });
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [showBooking, setShowBooking] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);


  const skills = [
    "React", "JavaScript", "Python", "Spanish", "Guitar", 
    "Data Science", "Node.js", "Machine Learning", "Java", "C++"
  ];

  useEffect(() => {
    loadTeachers();
  }, [filters]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await userService.getTeachers(filters);
      setTeachers(response.data);
      setTotal(response.total);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to load teachers');
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TeacherFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      skill: searchQuery,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      skill: '',
      rating: '',
      availability: '',
      limit: 20,
      page: 1
    });
    setSearchQuery('');
  };

  const handleBookSession = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowBooking(true);
  };

  const handleBookingClose = () => {
    setShowBooking(false);
    setSelectedTeacher(null);
  };

  const handleBookingSuccess = () => {
    // Redirect to dashboard where user can see their newly booked session
    navigate('/dashboard');
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Teacher</h1>
        <p className="text-gray-600">Browse through our community of expert teachers and book your next learning session</p>
      </div>
      

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search teachers or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill</label>
            <select
              value={filters.skill || ''}
              onChange={(e) => handleFilterChange('skill', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Skills</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <select
              value={filters.availability || ''}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any Time</option>
              <option value="available">Available Now</option>
            </select>
          </div>
        </div>
        
        {(filters.skill || filters.rating || filters.availability) && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Active filters:</span>
              {filters.skill && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Skill: {filters.skill}</span>}
              {filters.rating && <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Rating: {filters.rating}+</span>}
              {filters.availability && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Available</span>}
            </div>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-8">
          {error}
        </div>
      )}

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {loading ? 'Loading...' : `Found ${total} teacher${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Teacher Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {teacher.avatar || teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  {teacher.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm font-medium text-gray-700">{teacher.stats.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({teacher.stats.totalReviews})</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {teacher.teachingSkills.length > 0 ? `$${teacher.teachingSkills[0].hourlyRate}` : '$25'}
                </p>
                <p className="text-xs text-gray-500">per hour</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {teacher.teachingSkills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {skill.skill}
                  </span>
                ))}
                {teacher.teachingSkills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{teacher.teachingSkills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {teacher.bio || 'Experienced teacher ready to help you learn.'}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {teacher.stats.totalSessions > 10 && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Experienced
                </span>
              )}
              {teacher.stats.averageRating >= 4.5 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                  Top Rated
                </span>
              )}
              {teacher.isOnline && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  Online Now
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Link 
                to={`/chat?teacher=${teacher._id}`}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
              >
                Message
              </Link>
              <button 
              onClick={() => handleBookSession(teacher)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {showBooking && selectedTeacher && (
    <SessionBooking
      teacher={selectedTeacher}
      onClose={handleBookingClose}
      onBookingSuccess={handleBookingSuccess}
    />
  )}

      {/* No Results */}
      {!loading && teachers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
          <button
            onClick={clearFilters}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Load More - Placeholder for pagination */}
      {teachers.length > 0 && total > teachers.length && (
        <div className="text-center mt-8">
          <button 
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
          >
            Load More Teachers
          </button>
        </div>
      )}
    </div>
  );
}

export default Browse;
