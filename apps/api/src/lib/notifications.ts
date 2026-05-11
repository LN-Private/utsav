// Notification service for Utsav API
// Email, SMS, push notifications, and booking notifications

import { prisma } from './prisma';

// ============================================
// Types
// ============================================

export type BookingNotificationType = 'created' | 'confirmed' | 'cancelled' | 'completed' | 'reminder';

export interface PushNotificationData {
  bookingId?: string;
  serviceId?: string;
  type?: string;
  [key: string]: unknown;
}

export interface NotificationResult {
  success: boolean;
  message: string;
}

// ============================================
// Email Functions
// ============================================

/**
 * Send an email notification
 * Stub implementation - replace with production email service (SendGrid, Nodemailer, etc.)
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email body in HTML format
 * @returns Notification result
 */
export async function sendEmail(to: string, subject: string, _html: string): Promise<NotificationResult> {
  // TODO: Replace with production email service (SendGrid, Nodemailer, Amazon SES)
  console.log(`[Email Stub] To: ${to}, Subject: ${subject}`);
  return {
    success: true,
    message: 'Email sent successfully (stub)',
  };
}

// ============================================
// SMS Functions
// ============================================

/**
 * Validate Nepal phone number format
 * Accepts +977 98XXXXXXXX or +977 97XXXXXXXX format
 * @param phone - Phone number to validate
 * @returns True if valid Nepal phone number
 */
function isValidNepalPhone(phone: string): boolean {
  const nepalPhoneRegex = /^\+977[6-9][0-9]{8}$/;
  return nepalPhoneRegex.test(phone);
}

/**
 * Send an SMS notification
 * Stub implementation for Nepal numbers
 * @param to - Recipient phone number (Nepal format: +977 98XXXXXXXX)
 * @param message - SMS message content
 * @returns Notification result
 */
export async function sendSMS(to: string, message: string): Promise<NotificationResult> {
  // Validate Nepal phone number format
  if (!isValidNepalPhone(to)) {
    return {
      success: false,
      message: 'Invalid Nepal phone number format. Use +977 98XXXXXXXX or +977 97XXXXXXXX',
    };
  }

  // TODO: Replace with production SMS gateway (Sparrow SMS, Ncell, NTC, etc.)
  // Example Sparrow SMS integration:
  // const response = await fetch('https://api.sparrowsms.com/api/v2/sms', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: new URLSearchParams({
  //     token: process.env.SPARROW_TOKEN,
  //     to: phone.replace('+977', ''),
  //     message: message,
  //     from: 'Utsav'
  //   })
  // });
  console.log(`[SMS Stub] To: ${to}, Message: ${message}`);

  return {
    success: true,
    message: 'SMS sent successfully (stub)',
  };
}

// ============================================
// Push Notification Functions
// ============================================

/**
 * Send a push notification to a user
 * Stub implementation - replace with production push service (Firebase, OneSignal, etc.)
 * @param userId - User ID to send notification to
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data payload
 * @returns Notification result
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  _data?: PushNotificationData,
): Promise<NotificationResult> {
  // TODO: Replace with production push notification service (Firebase Cloud Messaging, OneSignal)
  // Example FCM integration:
  // const user = await prisma.user.findUnique({ where: { id: userId } });
  // if (user?.pushToken) {
  //   await fetch('https://fcm.googleapis.com/fcm/send', {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       to: user.pushToken,
  //       notification: { title, body },
  //       data
  //     })
  //   });
  // }
  console.log(`[Push Stub] User: ${userId}, Title: ${title}, Body: ${body}`);

  return {
    success: true,
    message: 'Push notification sent successfully (stub)',
  };
}

// ============================================
// Booking Notification Functions
// ============================================

/**
 * Send booking-related notifications to customer and provider
 * @param bookingId - ID of the booking
 * @param type - Type of notification
 * @returns Notification result
 */
export async function sendBookingNotification(
  bookingId: string,
  type: BookingNotificationType,
): Promise<NotificationResult> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        provider: {
          include: { user: true },
        },
        service: true,
      },
    });

    if (!booking) {
      return {
        success: false,
        message: 'Booking not found',
      };
    }

    const { customer, provider, service } = booking;
    const messages: NotificationResult[] = [];

    if (type === 'created') {
      // Notify provider of new booking
      if (provider.user.email) {
        messages.push(
          await sendEmail(
            provider.user.email,
            'New Booking Request',
            `<h2>New Booking Request</h2><p>Service: ${service.title}</p><p>Event Date: ${booking.eventDate.toDateString()}</p>`,
          ),
        );
      }
      if (provider.user.phone) {
        messages.push(
          await sendSMS(provider.user.phone, `New booking for ${service.title} on ${booking.eventDate.toDateString()}`),
        );
      }
    } else if (type === 'confirmed') {
      // Notify customer of confirmation
      if (customer.email) {
        messages.push(
          await sendEmail(
            customer.email,
            'Booking Confirmed',
            `<h2>Booking Confirmed</h2><p>Service: ${service.title}</p><p>Event Date: ${booking.eventDate.toDateString()}</p>`,
          ),
        );
      }
      if (customer.phone) {
        messages.push(
          await sendSMS(customer.phone, `Your booking for ${service.title} is confirmed`),
        );
      }
    } else if (type === 'cancelled') {
      // Notify both parties
      if (customer.email) {
        messages.push(
          await sendEmail(
            customer.email,
            'Booking Cancelled',
            `<h2>Booking Cancelled</h2><p>Service: ${service.title}</p>`,
          ),
        );
      }
      if (provider.user.email) {
        messages.push(
          await sendEmail(
            provider.user.email,
            'Booking Cancelled',
            `<h2>Booking Cancelled</h2><p>Service: ${service.title}</p>`,
          ),
        );
      }
    } else if (type === 'completed') {
      // Notify customer that service is completed
      if (customer.email) {
        messages.push(
          await sendEmail(
            customer.email,
            'Service Completed',
            `<h2>Service Completed</h2><p>Service: ${service.title}</p><p>Please leave a review.</p>`,
          ),
        );
      }
    } else if (type === 'reminder') {
      // Send reminder before event
      const eventDate = new Date(booking.eventDate);
      if (customer.email) {
        messages.push(
          await sendEmail(
            customer.email,
            'Upcoming Event Reminder',
            `<h2>Event Reminder</h2><p>Your event for ${service.title} is on ${eventDate.toDateString()}</p>`,
          ),
        );
      }
      if (customer.phone) {
        messages.push(
          await sendSMS(customer.phone, `Reminder: ${service.title} event tomorrow`),
        );
      }
    }

    const failedCount = messages.filter((m) => !m.success).length;
    return {
      success: failedCount === 0,
      message: `Booking notifications sent (${messages.length - failedCount}/${messages.length} successful)`,
    };
  } catch (error) {
    console.error('Booking notification error:', error);
    return {
      success: false,
      message: 'Failed to send booking notifications',
    };
  }
}