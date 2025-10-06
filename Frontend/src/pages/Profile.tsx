import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userService, UserProfile } from "../services/user";

function Profile() {
  const { updateProfile } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    role: 'learner',
    teachingSkills: [] as any[],
    learningSkills: [] as any[],
    availability: {
      monday: { available: false, hours: '' },
      tuesday: { available: false, hours: '' },
      wednesday: { available: false, hours: '' },
      thursday: { available: false, hours: '' },
      friday: { available: false, hours: '' },
      saturday: { available: false, hours: '' },
      sunday: { available: false, hours: '' }
    }
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await userService.getCurrentProfile();
      const userData = response.data.user;
      setUser(userData);
      
      // Initialize form data
      setFormData({
        name: userData.name || '',
        bio: userData.bio || '',
        location: userData.location || '',
        role: userData.role || 'learner',
        teachingSkills: userData.teachingSkills || [],
        learningSkills: userData.learningSkills || [],
        availability: userData.availability || formData.availability
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      await updateProfile(formData);
      await loadUserProfile(); // Reload data
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        role: user.role || 'learner',
        teachingSkills: user.teachingSkills || [],
        learningSkills: user.learningSkills || [],
        availability: user.availability || formData.availability
      });
    }
    setIsEditing(false);
    setError('');
  };

  const addTeachingSkill = () => {
    setFormData({
      ...formData,
      teachingSkills: [...formData.teachingSkills, { skill: '', level: 'beginner', hourlyRate: 25 }]
    });
  };

  const removeTeachingSkill = (index: number) => {
    setFormData({
      ...formData,
      teachingSkills: formData.teachingSkills.filter((_, i) => i !== index)
    });
  };

  const updateTeachingSkill = (index: number, field: string, value: any) => {
    const updatedSkills = [...formData.teachingSkills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setFormData({ ...formData, teachingSkills: updatedSkills });
  };

  const addLearningSkill = () => {
    setFormData({
      ...formData,
      learningSkills: [...formData.learningSkills, { skill: '', level: 'beginner', progress: 0 }]
    });
  };

  const removeLearningSkill = (index: number) => {
    setFormData({
      ...formData,
      learningSkills: formData.learningSkills.filter((_, i) => i !== index)
    });
  };

  const updateLearningSkill = (index: number, field: string, value: any) => {
    const updatedSkills = [...formData.learningSkills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setFormData({ ...formData, learningSkills: updatedSkills });
  };

  const updateAvailability = (day: string, field: string, value: any) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day as keyof typeof formData.availability],
          [field]: value
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.avatar || user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                ) : (
                  user.name
                )}
              </h1>
              <p className="text-gray-600 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Your location"
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                ) : (
                  user.location || 'No location set'
                )}
              </p>
              <p className="text-sm text-gray-500">Member since {new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-medium text-gray-700">{user.stats.averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({user.stats.totalReviews} reviews)</span>
                </div>
                <div className="text-gray-500">•</div>
                <div className="text-gray-700">{user.stats.totalSessions} sessions completed</div>
              </div>
            </div>
          </div>
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
          </button>
        </div>

        {isEditing && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="mt-6">
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell others about yourself..."
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
            />
          ) : (
            <p className="text-gray-700">{user.bio || 'No bio yet'}</p>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coin Balance</p>
              <p className="text-2xl font-bold text-yellow-600">{user.wallet.balance}</p>
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
              <p className="text-2xl font-bold text-purple-600">{user.stats.averageRating.toFixed(1)}</p>
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
              { id: "availability", label: "Availability" }
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
                <p className="text-gray-700">{user.bio || 'No bio yet'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{user.stats.totalSessions}</div>
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
                    <div className="text-2xl font-bold text-yellow-600">{user.stats.averageRating.toFixed(1)}</div>
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
                {isEditing && (
                  <button
                    onClick={addTeachingSkill}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add New Skill
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {formData.teachingSkills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={skill.skill}
                            onChange={(e) => updateTeachingSkill(index, 'skill', e.target.value)}
                            placeholder="Skill name"
                            className="border border-gray-300 rounded px-2 py-1"
                          />
                          <select
                            value={skill.level}
                            onChange={(e) => updateTeachingSkill(index, 'level', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                          <input
                            type="number"
                            value={skill.hourlyRate}
                            onChange={(e) => updateTeachingSkill(index, 'hourlyRate', parseInt(e.target.value))}
                            placeholder="Hourly rate"
                            className="border border-gray-300 rounded px-2 py-1"
                          />
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-900">{skill.skill}</h4>
                          <p className="text-sm text-gray-600">Level: {skill.level} • ${skill.hourlyRate}/hour</p>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeTeachingSkill(index)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {formData.teachingSkills.length === 0 && !isEditing && (
                  <p className="text-gray-500 text-center py-8">No teaching skills added yet</p>
                )}
              </div>
            </div>
          )}

          {/* Learning Goals Tab */}
          {activeTab === "learning" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Skills I'm Learning</h3>
                {isEditing && (
                  <button
                    onClick={addLearningSkill}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Learning Goal
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {formData.learningSkills.map((skill, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      {isEditing ? (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={skill.skill}
                            onChange={(e) => updateLearningSkill(index, 'skill', e.target.value)}
                            placeholder="Skill name"
                            className="border border-gray-300 rounded px-2 py-1"
                          />
                          <select
                            value={skill.level}
                            onChange={(e) => updateLearningSkill(index, 'level', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-medium text-gray-900">{skill.skill}</h4>
                          <span className="text-sm text-gray-600">{skill.level}</span>
                        </>
                      )}
                      {isEditing && (
                        <button
                          onClick={() => removeLearningSkill(index)}
                          className="text-red-600 hover:text-red-800 ml-4"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {!isEditing && (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${skill.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{skill.progress}% progress</p>
                      </>
                    )}
                  </div>
                ))}
                {formData.learningSkills.length === 0 && !isEditing && (
                  <p className="text-gray-500 text-center py-8">No learning goals added yet</p>
                )}
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === "availability" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">My Availability</h3>
              <div className="space-y-3">
                {Object.entries(formData.availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900 capitalize w-20">{day}</span>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={schedule.available}
                          onChange={(e) => updateAvailability(day, 'available', e.target.checked)}
                          className="rounded"
                        />
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          schedule.available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {schedule.available ? 'Available' : 'Unavailable'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 max-w-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={schedule.hours}
                          onChange={(e) => updateAvailability(day, 'hours', e.target.value)}
                          placeholder="e.g., 9:00 AM - 5:00 PM"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          disabled={!schedule.available}
                        />
                      ) : (
                        <span className="text-gray-600 text-sm">
                          {schedule.available ? schedule.hours : 'Not available'}
                        </span>
                      )}
                    </div>
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