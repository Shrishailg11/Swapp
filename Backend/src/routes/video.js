import express from 'express';
import { protect } from '../middleware/auth.js';

// Lazy import to avoid issues if package not installed yet
let RtcTokenBuilder, RtcRole;
try {
  ({ RtcTokenBuilder, RtcRole } = await import('agora-access-token'));
} catch (e) {
  // no-op; route will respond with 501 if not available
}

const router = express.Router();

// @desc    Generate Agora RTC token for a session/channel
// @route   POST /api/video/token
// @access  Private
router.post('/token', protect, async (req, res) => {
  try {
    console.log('🎥 Video token request received:', {
      userId: req.user._id,
      body: req.body,
      headers: req.headers.authorization ? 'Has auth header' : 'No auth header'
    });

    if (!RtcTokenBuilder || !RtcRole) {
      console.log('❌ Agora SDK not available');
      return res.status(501).json({
        success: false,
        message: 'Video service not available: install agora-access-token on backend',
      });
    }

    const { channelName, uid, role = 'publisher', expireSeconds = 3600 } = req.body || {};

    if (!channelName) {
      console.log('❌ Missing channelName');
      return res.status(400).json({ success: false, message: 'channelName is required' });
    }

    console.log('📝 Processing token request:', { channelName, uid, role, expireSeconds });

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    console.log('🔍 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasAppId: !!appId,
      hasAppCertificate: !!appCertificate,
      appId: appId ? 'Present' : 'Missing',
      appCertificate: appCertificate ? 'Present' : 'Missing'
    });

    // For development mode, provide mock credentials if Agora isn't configured
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const mockAppId = 'demo_app_id_for_development';
    const mockToken = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!appId || !appCertificate) {
      if (isDevelopment) {
        // Return mock data for development
        console.log('⚠️ Using mock Agora credentials for development');
        return res.status(200).json({
          success: true,
          data: {
            appId: mockAppId,
            channelName,
            uid: uid ? Number(uid) : 0,
            token: mockToken,
            expireAt: Math.floor(Date.now() / 1000) + (expireSeconds || 3600),
            isMock: true // Flag to indicate this is mock data
          },
        });
      } else {
        // For production, require real credentials
        console.log('❌ Production mode requires Agora credentials');
        return res.status(501).json({
          success: false,
          message: 'Agora video calling not configured. To enable video calls: 1) Sign up for Agora account at https://console.agora.io, 2) Create a project, 3) Add AGORA_APP_ID and AGORA_APP_CERTIFICATE to your .env file',
          setup_required: true
        });
      }
    }

    console.log('✅ Using real Agora credentials');

    // Role mapping
    const rtcRole = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + Number(expireSeconds || 3600);

    // uid can be string; for token, allow 0 to let Agora assign
    const numericUid = uid && /^\d+$/.test(String(uid)) ? Number(uid) : 0;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      numericUid,
      rtcRole,
      privilegeExpiredTs
    );

    return res.status(200).json({
      success: true,
      data: {
        appId,
        channelName,
        uid: numericUid,
        token,
        expireAt: privilegeExpiredTs,
      },
    });
  } catch (error) {
    console.error('Agora token error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate token' });
  }
});

export default router;


