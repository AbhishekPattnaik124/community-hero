const express = require('express');
const router = express.Router();
const otpService = require('../services/sms.service');
const { authenticate } = require('../middleware/auth.middleware');
const User = require('../models/User.model');

router.post('/send-otp', authenticate, async (req, res) => {
  try {
    const email = req.user.email;
    
    const result = await otpService.sendOTP(email);
    res.json({ success: true, message: 'OTP sent successfully', previewUrl: result.previewUrl });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/verify-otp', authenticate, async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.user.email;
    if (!otp) return res.status(400).json({ success: false, message: 'OTP required' });

    await otpService.verifyOTP(email, otp);
    
    // Update User
    req.user.isPhoneVerified = true;
    await req.user.save();

    res.json({ success: true, message: 'Account OTP verified' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
