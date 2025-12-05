import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Teacher, userService } from '../services/user';
import { API_BASE_URL } from '../services/api';


interface AvailabilitySlot {
  time: string;
  available: boolean;
}

interface SessionBookingProps {
  teacher: Teacher;
  onClose: () => void;
  onBookingSuccess: () => void;
}

function SessionBooking({ teacher, onClose, onBookingSuccess }: SessionBookingProps) {
  const { user, updateUser } = useAuth(); // Get user and update function
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/sessions/availability/${teacher._id}?date=${selectedDate}`
      );
      const data = await response.json();
      
      if (data.success) {
        // Generate time slots based on teacher availability
        const slots = generateTimeSlots(data.data.availability, data.data.bookedSlots);
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (availability: any, bookedSlots: any[]) => {
    const slots: AvailabilitySlot[] = [];
    const selectedDateObj = new Date(selectedDate);
    const dayOfWeek = selectedDateObj
  .toLocaleDateString('en-US', { weekday: 'long' })
  .toLowerCase();

    
    const dayAvailability = availability[dayOfWeek];
    if (!dayAvailability || !dayAvailability.available) {
      return slots;
    }
    
    // Parse available hours (e.g., "9:00 AM - 5:00 PM")
    const [startStr, endStr] = dayAvailability.hours.split(' - ');
    const startHour = parseTime(startStr);
    const endHour = parseTime(endStr);
    
    // Generate 30-minute slots
    for (let hour = startHour; hour < endHour; hour += 0.5) {
      const timeStr = formatTime(hour);
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(Math.floor(hour), (hour % 1) * 60);
      
      // Check if slot conflicts with existing bookings
      const conflict = bookedSlots.some(session => {
        const sessionStart = new Date(session.scheduledDate);
        const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60000);
        return slotDateTime >= sessionStart && slotDateTime < sessionEnd;
      });
      
      slots.push({
        time: timeStr,
        available: !conflict
      });
    }
    
    return slots;
  };

  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours + minutes / 60;
  };

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = (hour % 1) * 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleBooking = async () => {
    if (!selectedSkill || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user || !user.wallet) {
      alert('User wallet not found. Please log in again.');
      return;
    }

    const selectedSkillData = teacher.teachingSkills.find(s => s.skill === selectedSkill);
    const totalPrice = selectedSkillData ? selectedSkillData.hourlyRate * (duration / 60) : 0;
    const hasEnoughCoins = user.wallet.balance >= totalPrice;

    if (!hasEnoughCoins) {
      alert(`Insufficient coins. You need ${totalPrice} coins but only have ${user?.wallet.balance || 0} coins.`);
      return;
    }

    setBooking(true);
    try {
      const scheduledDateTime = new Date(selectedDate);
      // Parse time correctly (e.g., "9:00 AM" -> hours: 9, minutes: 0)
      const [time, period] = selectedTime.split(' ');
      const [hoursStr, minutesStr] = time.split(':');
      let hours = parseInt(hoursStr);
      const minutes = parseInt(minutesStr);

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      scheduledDateTime.setHours(hours, minutes);

      // Check if the selected date/time is in the future
      const now = new Date();
      if (scheduledDateTime <= now) {
        alert('Please select a future date and time for your session.');
        setBooking(false);
        return;
      }

      const requestData = {
        teacherId: teacher._id,
        skill: selectedSkill,
        scheduledDate: scheduledDateTime.toISOString(),
        duration,
        notes
      };

      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success) {
        // Refresh user data to update wallet balance
        try {
          const profileResponse = await userService.getCurrentProfile();
          if (profileResponse.success) {
            updateUser(profileResponse.data.user);
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }

        alert('Session booked successfully!');
        onBookingSuccess();
        onClose();
      } else {
        alert(data.message || 'Failed to book session');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book session. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const selectedSkillData = teacher.teachingSkills.find(s => s.skill === selectedSkill);
  const totalPrice = selectedSkillData ? selectedSkillData.hourlyRate * (duration / 60) : 0;
  const hasEnoughCoins = user && user.wallet.balance >= totalPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Book Session</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Teacher Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <img 
                src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=3b82f6&color=fff`} 
                alt={teacher.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-medium text-gray-900">{teacher.name}</h3>
                <p className="text-sm text-gray-600">Professional Teacher</p>
              </div>
            </div>

            {/* Skill Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Skill
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a skill...</option>
                {teacher.teachingSkills.map((skill) => (
                  <option key={skill.skill} value={skill.skill}>
                    {skill.skill} - ${skill.hourlyRate}/hour
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Times
                </label>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`px-3 py-2 text-sm rounded-lg border ${
                          selectedTime === slot.time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : slot.available
                            ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific topics or goals for this session..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Price Summary with Coin Check */}
            {selectedSkillData && (
              <div className={`border rounded-lg p-4 ${
                hasEnoughCoins 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  hasEnoughCoins ? 'text-green-900' : 'text-red-900'
                }`}>
                  Session Summary
                </h4>
                <div className={`space-y-1 text-sm ${
                  hasEnoughCoins ? 'text-green-800' : 'text-red-800'
                }`}>
                  <div className="flex justify-between">
                    <span>Skill:</span>
                    <span>{selectedSkill}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>${selectedSkillData.hourlyRate}/hour</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t border-current">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Your Balance:</span>
                    <span>{user?.wallet.balance || 0} coins</span>
                  </div>
                </div>
                
                {!hasEnoughCoins && (
                  <div className="mt-3 p-2 bg-red-100 text-red-700 text-sm rounded">
                    ⚠️ Insufficient coins. Purchase more coins to book this session.
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={booking || !selectedSkill || !selectedDate || !selectedTime || !hasEnoughCoins}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? 'Booking...' : 
                 !hasEnoughCoins ? 'Insufficient Coins' : 
                 'Book Session'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionBooking;