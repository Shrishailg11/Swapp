import { useState } from "react";
import { Link } from "react-router-dom";

function Browse() {
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for teachers
  const teachers = [
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "SC",
      skills: ["React", "JavaScript", "Node.js"],
      rating: 4.9,
      reviews: 127,
      hourlyRate: 25,
      bio: "Full-stack developer with 5+ years experience. Love teaching React and modern web development.",
      availability: "Available now",
      isOnline: true,
      badges: ["Top Teacher", "Quick Responder"]
    },
    {
      id: 2,
      name: "Alex Rivera",
      avatar: "AR",
      skills: ["Guitar", "Music Theory", "Songwriting"],
      rating: 4.8,
      reviews: 89,
      hourlyRate: 20,
      bio: "Professional musician and guitar instructor. Specializing in acoustic and electric guitar.",
      availability: "Available today",
      isOnline: false,
      badges: ["Verified Expert"]
    },
    {
      id: 3,
      name: "Maria Santos",
      avatar: "MS",
      skills: ["Spanish", "Portuguese", "Language Exchange"],
      rating: 5.0,
      reviews: 203,
      hourlyRate: 18,
      bio: "Native Spanish speaker from Mexico. Certified language teacher with 8 years experience.",
      availability: "Available tomorrow",
      isOnline: true,
      badges: ["Top Teacher", "Native Speaker"]
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "DK",
      skills: ["Python", "Data Science", "Machine Learning"],
      rating: 4.7,
      reviews: 156,
      hourlyRate: 30,
      bio: "Data scientist at tech company. Passionate about teaching Python and ML concepts.",
      availability: "Available this week",
      isOnline: true,
      badges: ["Industry Expert"]
    }
  ];

  const skills = ["React", "JavaScript", "Python", "Spanish", "Guitar", "Data Science", "Node.js", "Machine Learning"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Teacher</h1>
        <p className="text-gray-600">Browse through our community of expert teachers and book your next learning session</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search teachers or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
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
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
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
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Any Time</option>
              <option value="now">Available Now</option>
              <option value="today">Available Today</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Teacher Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {teacher.avatar}
                  </div>
                  {teacher.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm font-medium text-gray-700">{teacher.rating}</span>
                    <span className="text-sm text-gray-500">({teacher.reviews})</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{teacher.hourlyRate} coins</p>
                <p className="text-xs text-gray-500">per hour</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {teacher.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{teacher.bio}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {teacher.badges.map((badge) => (
                <span key={badge} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  {badge}
                </span>
              ))}
            </div>

            {/* Availability */}
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Availability:</span> {teacher.availability}
            </p>

            {/* Actions */}
            <div className="flex space-x-2">
              <Link 
                to="/chat"
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
              >
                Message
              </Link>
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
          Load More Teachers
        </button>
      </div>
    </div>
  );
}

export default Browse;