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
🆕 New Session Booking - {{username}}
```

**Content (HTML or Text):**
```
🆕 NEW SESSION BOOKING RECEIVED!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 USER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: {{username}}
Email: {{user_email}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 NEW BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: {{date}}
🕐 Time: {{start_time}} - {{end_time}} ({{duration}})
📚 Subject: {{subject}}
🕌 Venue: {{venue}}
🆔 Booking ID: {{booking_id}}
⏰ Booked At: {{timestamp}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 ALL SESSIONS FOR THIS USER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{all_sessions}}

Total Sessions: {{total_sessions}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated notification from The Juja B Fellas booking system.
```

**Available Template Variables:**
- `{{username}}` - User's username
- `{{user_email}}` - User's email address
- `{{date}}` - Booking date (formatted)
- `{{start_time}}` - Session start time
- `{{end_time}}` - Session end time
- `{{duration}}` - Session duration (e.g., "2hr 30min")
- `{{subject}}` - Subject name
- `{{venue}}` - Venue name
- `{{booking_id}}` - Unique booking ID
- `{{timestamp}}` - When booking was made
- `{{all_sessions}}` - HTML list of all user's sessions
- `{{total_sessions}}` - Total number of sessions for this user
- `{{message}}` - Full formatted message (alternative)

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

### Step 6: Update Code
1. Open `sessions.html`
2. Replace `YOUR_PUBLIC_KEY` with your EmailJS Public Key (line 24)
3. Open `js/sessions.js`
4. Replace `YOUR_SERVICE_ID` with your Service ID (line 453)
5. Replace `YOUR_TEMPLATE_ID` with your Template ID (line 453)

**Note:** The email system is already configured to automatically send emails with:
- Username and email
- New booking details
- **All sessions** the user has booked (grouped by date)
- Total session count

The email will be sent automatically whenever someone books a session!

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
2. Check your email inbox at **mohamedhbuule2026@gmail.com**
3. You should receive an email with:
   - Username and email of the person who booked
   - Details of the new booking
   - **All sessions** that user has booked (so you can see their complete booking history)
4. Check browser console for any errors

## Viewing All Bookings

You can also view all bookings in the browser console:

1. Open the browser console (F12)
2. Run these commands:
   - `getAllBookingsByUsername()` - See all bookings grouped by username
   - `getBookingsSummary()` - See a formatted summary
   - `exportBookings()` - Download all bookings as JSON file
   - `getAllBookings()` - Get raw bookings data

## Troubleshooting

- **Emails not sending**: Check browser console for errors
- **EmailJS errors**: Verify Service ID, Template ID, and Public Key are correct
- **CORS errors**: Make sure EmailJS is properly initialized

For more help, visit [EmailJS Documentation](https://www.emailjs.com/docs/)
