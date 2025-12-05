import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SessionReview from "../components/SessionReview";
import { API_BASE_URL } from "../services/api";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

function buildRoomName(sessionId?: string) {
  return sessionId ? `swapp-session-${sessionId}` : "swapp-demo-room";
}

function VideoCall() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);
  const scriptId = "jitsi-external-api-script";
  const [showReview, setShowReview] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callEndTime, setCallEndTime] = useState<Date | null>(null);

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setSessionData(data.data.session);
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;

    const loadAndStartJitsi = () => {
      if (cancelled) return;

      const initialize = () => {
        if (cancelled) return;
        if (!window.JitsiMeetExternalAPI || !containerRef.current) return;

        // Clean up any previous iframe before starting a new one
        if (apiRef.current) {
          apiRef.current.dispose();
          apiRef.current = null;
        }
        containerRef.current.innerHTML = "";

        apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName: buildRoomName(sessionId),
          parentNode: containerRef.current,
          width: "100%",
          height: 600,
          userInfo: { displayName: "Swapp User" },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            disableJoinLeaveSounds: true,
          },
          interfaceConfigOverwrite: {
            TILE_VIEW_MAX_COLUMNS: 2,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
        });

        // Set call start time
        setCallStartTime(new Date());
        
        // Add event listeners for call end
        apiRef.current.on('readyToClose', handleCallEnd);
      };

      // If script already loaded, just initialize
      if (window.JitsiMeetExternalAPI) {
        initialize();
        return;
      }

      // If script not yet injected, add it once
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = initialize;
        document.body.appendChild(script);
      } else {
        // Script exists but not ready yet—wait briefly
        const checkInterval = setInterval(() => {
          if (window.JitsiMeetExternalAPI) {
            clearInterval(checkInterval);
            initialize();
          }
        }, 200);
      }
    };

    loadAndStartJitsi();

    return () => {
      cancelled = true;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [sessionId]);

  const handleCallEnd = () => {
    // Set call end time
    setCallEndTime(new Date());
    
    // Check if we should show review modal
    if (sessionData && sessionData.status === 'confirmed') {
      // Check if session was attended for a significant duration
      if (shouldAskForReview()) {
        // Mark session as completed
        updateSessionStatus('completed');
        setShowReview(true);
      } else {
        // Just navigate back without review
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  const shouldAskForReview = (): boolean => {
    if (!sessionData || !callStartTime || !callEndTime) return false;
    
    // Calculate call duration in minutes
    const callDurationMinutes = (callEndTime.getTime() - callStartTime.getTime()) / (1000 * 60);
    
    // Get session scheduled duration
    const scheduledDuration = sessionData.duration || 60;
    
    // Ask for review if:
    // 1. Call lasted more than 5 minutes, OR
    // 2. Call lasted at least 50% of the scheduled duration
    return callDurationMinutes > 5 || callDurationMinutes >= (scheduledDuration * 0.5);
  };

  const updateSessionStatus = async (status: string) => {
    if (!sessionId) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const submitReview = async (rating: number, comment: string) => {
    if (!sessionId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to submit review');
      }
      
      // Refresh user data to update stats
      // You might want to implement this in a more robust way
      window.location.reload();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const handleCloseReview = () => {
    setShowReview(false);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div ref={containerRef} />
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleCallEnd}
          className="px-6 py-2 bg-red-600 text-white rounded-lg"
        >
          End Call & Return
        </button>
      </div>
      
      {showReview && sessionData && (
        <SessionReview
          sessionId={sessionId || ''}
          teacherName={sessionData.teacher?.name || 'Teacher'}
          skill={sessionData.skill}
          onClose={handleCloseReview}
          onSubmit={submitReview}
        />
      )}
    </div>
  );
}

export default VideoCall;