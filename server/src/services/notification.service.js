const nodemailer = require('nodemailer');
const logger = require('../config/logger');
const Notification = require('../models/Notification.model');
const { emit } = require('./socket.service');

// ── Email Transport ───────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Twilio Client ─────────────────────────────────────────────────────────────
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (err) {
  logger.warn('Twilio not configured – SMS notifications disabled');
}

/**
 * Create and dispatch a notification
 */
async function createNotification({ recipient, sender = null, type, title, message, link, relatedIssue, channels = {}, metadata = {} }) {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      relatedIssue,
      channels: { inApp: true, ...channels },
      metadata,
    });

    // Real-time in-app notification via Socket.io
    emit.notification(recipient.toString(), {
      _id: notification._id,
      type,
      title,
      message,
      link,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (err) {
    logger.error('Failed to create notification:', err);
  }
}

/**
 * Send email notification
 */
async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SMTP_USER) {
    logger.info(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Community Hero <noreply@communityhero.app>',
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error('Email send failed:', err);
  }
}

/**
 * Send SMS notification via Twilio
 */
async function sendSMS({ to, body }) {
  if (!twilioClient) {
    logger.info(`[SMS STUB] To: ${to} | Body: ${body}`);
    return;
  }
  try {
    const msg = await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`SMS sent: ${msg.sid}`);
    return msg;
  } catch (err) {
    logger.error('SMS send failed:', err);
  }
}

/**
 * Send WhatsApp notification via Twilio
 */
async function sendWhatsApp({ to, body }) {
  if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER) {
    logger.info(`[WHATSAPP STUB] To: ${to} | Body: ${body}`);
    return;
  }
  try {
    const msg = await twilioClient.messages.create({
      body,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
    });
    logger.info(`WhatsApp sent: ${msg.sid}`);
    return msg;
  } catch (err) {
    logger.error('WhatsApp send failed:', err);
  }
}

/**
 * Notify reporters when issue status changes
 */
async function notifyStatusChange(issue, changedBy) {
  const statusLabels = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved ✅',
    closed: 'Closed',
    escalated: 'Escalated ⚠️',
  };

  await createNotification({
    recipient: issue.reporter,
    sender: changedBy ? changedBy._id : null,
    type: 'issue_status_changed',
    title: `Issue status updated to ${statusLabels[issue.status]}`,
    message: `Your issue "${issue.title}" has been updated to ${statusLabels[issue.status]}.`,
    link: `/issues/${issue._id}`,
    relatedIssue: issue._id,
    channels: { email: true },
  });
}

/**
 * Notify reporter when someone upvotes their issue
 */
async function notifyUpvote(issue, voter) {
  if (issue.reporter.toString() === voter._id.toString()) return;
  await createNotification({
    recipient: issue.reporter,
    sender: voter._id,
    type: 'issue_upvoted',
    title: 'Someone upvoted your issue',
    message: `${voter.name} upvoted your issue "${issue.title}". It now has ${issue.upvoteCount} upvotes.`,
    link: `/issues/${issue._id}`,
    relatedIssue: issue._id,
  });
}

/**
 * Notify relevant authorities of critical alerts
 */
async function notifyCriticalAlert(issue) {
  logger.info(`CRITICAL ALERT EMITTED for Issue: ${issue._id}`);
  
  // Example: fetch admins from DB to send emails/SMS (simplified here to just log)
  // We already broadcast 'issue:critical_alert' via Socket in socket.service.js
  // Let's stub an SMS dispatch:
  sendSMS({
    to: process.env.ADMIN_PHONE_NUMBER || '+1234567890',
    body: `CRITICAL ALERT: New High Severity Issue reported: ${issue.title} - Severity ${issue.severity}.`
  });
}

module.exports = { createNotification, sendEmail, sendSMS, sendWhatsApp, notifyStatusChange, notifyUpvote, notifyCriticalAlert };
