import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div ref={containerRef} />
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-red-600 text-white rounded-lg"
        >
          End Call & Return
        </button>
      </div>
    </div>
  );
}

export default VideoCall;