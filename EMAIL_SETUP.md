# Email Setup Guide

This guide will help you set up automatic email notifications for booking confirmations.

## Option 1: EmailJS (Recommended - Easiest)

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (100 emails/month free)

### Step 2: Create Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Copy your **Service ID**

### Step 3: Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template structure:

**Subject:**
```
New Session Booking - {{username}}
```

**Content:**
```
New Session Booking Received!

User Details:
- Username: {{username}}
- Email: {{email}}

Booking Details:
- Date: {{date}}
- Time: {{time}}
- Subject: {{subject}}
- Venue: {{venue}}
- Booking ID: {{booking_id}}
- Booked At: {{timestamp}}
```

4. Save and copy your **Template ID**

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key**

### Step 5: Update Code
1. Open `sessions.html` and `contact.html`
2. Replace `YOUR_PUBLIC_KEY` with your EmailJS Public Key
3. Open `js/sessions.js`
4. Replace `YOUR_SERVICE_ID` with your Service ID
5. Replace `YOUR_TEMPLATE_ID` with your Template ID

### Step 6: Update JavaScript
In `js/sessions.js`, update the `sendBookingEmail` function:

```javascript
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
  username: user.username,
  email: user.email,
  date: formatDate(booking.date),
  time: formatTime(booking.time),
  subject: booking.subject,
  venue: booking.venue,
  booking_id: booking.id,
  timestamp: new Date(booking.timestamp).toLocaleString()
}).then(
  () => console.log('Email sent successfully'),
  (error) => console.error('Email error:', error)
);
```

## Option 2: Webhook (Alternative)

### Using Zapier/Make.com
1. Create a webhook in Zapier or Make.com
2. Set up email trigger
3. Copy webhook URL
4. Update `js/sessions.js`:

```javascript
fetch('YOUR_WEBHOOK_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(emailData)
});
```

## Option 3: Backend API

If you have a backend server:
1. Create an API endpoint for receiving bookings
2. Update `js/sessions.js` to send POST requests to your API
3. Handle email sending on the backend

## Testing

After setup:
1. Book a test session
2. Check your email inbox
3. Check browser console for any errors

## Troubleshooting

- **Emails not sending**: Check browser console for errors
- **EmailJS errors**: Verify Service ID, Template ID, and Public Key are correct
- **CORS errors**: Make sure EmailJS is properly initialized

For more help, visit [EmailJS Documentation](https://www.emailjs.com/docs/)
