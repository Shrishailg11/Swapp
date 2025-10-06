import { useState } from "react";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@email.com",
    avatar: "JD",
    bio: "Passionate learner and teacher. I love sharing my knowledge in web development and learning new languages. Always excited to connect with fellow learners!",
    location: "San Francisco, CA",
    memberSince: "January 2024",
    totalSessions: 45,
    rating: 4.8,
    reviews: 23,
    coins: 250,
    teachingSkills: [
      { skill: "JavaScript", level: "Expert", sessions: 15, rating: 4.9 },
      { skill: "React", level: "Advanced", sessions: 12, rating: 4.8 },
      { skill: "Node.js", level: "Intermediate", sessions: 8, rating: 4.7 }
    ],
    learningSkills: [
      { skill: "Spanish", level: "Beginner", progress: 30 },
      { skill: "Guitar", level: "Beginner", progress: 15 },
      { skill: "Data Science", level: "Intermediate", progress: 60 }
    ],
    availability: {
      monday: { available: true, hours: "9:00 AM - 5:00 PM" },
      tuesday: { available: true, hours: "9:00 AM - 5:00 PM" },
      wednesday: { available: false, hours: "" },
      thursday: { available: true, hours: "2:00 PM - 8:00 PM" },
      friday: { available: true, hours: "9:00 AM - 3:00 PM" },
      saturday: { available: true, hours: "10:00 AM - 2:00 PM" },
      sunday: { available: false, hours: "" }
    }
  };

  const reviews = [
    {
      id: 1,
      student: "Sarah M.",
      skill: "JavaScript",
      rating: 5,
      comment: "John is an excellent teacher! He explained complex concepts in a very clear way.",
      date: "2 days ago"
    },
    {
      id: 2,
      student: "Mike R.",
      skill: "React",
      rating: 5,
      comment: "Great session on React hooks. Very patient and knowledgeable.",
      date: "1 week ago"
    },
    {
      id: 3,
      student: "Emma L.",
      skill: "Node.js",
      rating: 4,
      comment: "Helpful session on backend development. Would recommend!",
      date: "2 weeks ago"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.avatar}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-gray-600 mb-2">{user.location}</p>
              <p className="text-sm text-gray-500">Member since {user.memberSince}</p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-medium text-gray-700">{user.rating}</span>
                  <span className="text-gray-500">({user.reviews} reviews)</span>
                </div>
                <div className="text-gray-500">•</div>
                <div className="text-gray-700">{user.totalSessions} sessions completed</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <div className="mt-6">
          <p className="text-gray-700">{user.bio}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coin Balance</p>
              <p className="text-2xl font-bold text-yellow-600">{user.coins}</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teaching Skills</p>
              <p className="text-2xl font-bold text-green-600">{user.teachingSkills.length}</p>
            </div>
            <span className="text-2xl">👨‍🏫</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Learning Skills</p>
              <p className="text-2xl font-bold text-blue-600">{user.learningSkills.length}</p>
            </div>
            <span className="text-2xl">📚</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-purple-600">{user.rating}</p>
            </div>
            <span className="text-2xl">⭐</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview" },
              { id: "teaching", label: "Teaching Skills" },
              { id: "learning", label: "Learning Goals" },
              { id: "availability", label: "Availability" },
              { id: "reviews", label: "Reviews" }
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
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
                <p className="text-gray-700">{user.bio}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{user.totalSessions}</div>
                    <div className="text-sm text-gray-600">Total Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{user.teachingSkills.length}</div>
                    <div className="text-sm text-gray-600">Skills I Teach</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{user.learningSkills.length}</div>
                    <div className="text-sm text-gray-600">Skills I'm Learning</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{user.rating}</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Teaching Skills Tab */}
          {activeTab === "teaching" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Skills I Teach</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Add New Skill
                </button>
              </div>
              <div className="space-y-4">
                {user.teachingSkills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{skill.skill}</h4>
                      <p className="text-sm text-gray-600">Level: {skill.level}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-medium">{skill.rating}</span>
                      </div>
                      <p className="text-sm text-gray-600">{skill.sessions} sessions taught</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Goals Tab */}
          {activeTab === "learning" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Skills I'm Learning</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Learning Goal
                </button>
              </div>
              <div className="space-y-4">
                {user.learningSkills.map((skill, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{skill.skill}</h4>
                      <span className="text-sm text-gray-600">{skill.level}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{skill.progress}% progress</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === "availability" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">My Availability</h3>
              <div className="space-y-3">
                {Object.entries(user.availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900 capitalize w-20">{day}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        schedule.available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {schedule.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      {schedule.available ? schedule.hours : 'Not available'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Reviews</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{review.student}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {review.skill}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;