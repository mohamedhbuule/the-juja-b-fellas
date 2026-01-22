# Admin Guide - Viewing Bookings

## Automatic Email Notifications

When someone books a session, you will **automatically receive an email** at **mohamedhbuule2026@gmail.com** with:

✅ **Username** of the person who booked (clearly displayed)  
✅ **Email address** of the person  
✅ **New booking details** (date, time, subject, venue)  
✅ **All sessions** that user has booked (complete history)  
✅ **Total session count** for that user  

**The email is sent IMMEDIATELY when someone books a session!**

This way, you can see:
- Who booked what (username is prominently displayed)
- All sessions each person has chosen
- Complete booking history per user

### Email Sending Methods

The system tries multiple methods to ensure you receive the email:

1. **EmailJS** (if configured) - Automatic email sending
2. **Webhook** (if configured) - Send to your webhook endpoint
3. **Mailto Link** - Opens your email client with pre-filled message
4. **Console Logging** - Shows notification in browser console
5. **Local Storage** - Stores notifications for later viewing

Even if EmailJS isn't configured, you'll still get notifications via console and mailto links!

## Viewing Bookings in Browser Console

You can also view all bookings directly in the browser:

### Step 1: Open Browser Console
- Press `F12` or right-click → "Inspect" → "Console" tab

### Step 2: Use Admin Functions

**View all bookings grouped by username:**
```javascript
getAllBookingsByUsername()
```
Returns an object with all users and their sessions.

**View formatted summary:**
```javascript
getBookingsSummary()
```
Shows a nicely formatted text summary of all bookings.

**View pending email notifications:**
```javascript
viewPendingNotifications()
```
Shows all booking notifications that need to be sent (if EmailJS isn't configured).

**Clear pending notifications:**
```javascript
clearPendingNotifications()
```
Clears the list of pending notifications.

**Export all bookings:**
```javascript
exportBookings()
```
Downloads a JSON file with all booking data.

**Get raw bookings:**
```javascript
getAllBookings()
```
Returns the raw array of all bookings.

## Example Output

When you run `getBookingsSummary()`, you'll see:

```
📊 BOOKING SUMMARY
════════════════════════════════════════════════════════════

👤 john_doe (john@example.com)
   Total Sessions: 3
   ────────────────────────────────────
   📅 Monday, February 2, 2026
      🕐 9:00 AM - 11:00 AM (2hr) | 📚 Science of Hadith | 🕌 Al Basiirah Mosque
      🕐 2:00 PM - 5:00 PM (3hr) | 📚 Jurisprudence | 🕌 Al Hijaaz Mosque
   📅 Tuesday, February 3, 2026
      🕐 10:00 AM - 12:00 PM (2hr) | 📚 Islamic Creed | 🕌 Masjid Abii Bakar

👤 jane_smith (jane@example.com)
   Total Sessions: 2
   ────────────────────────────────────
   📅 Monday, February 2, 2026
      🕐 7:00 AM - 9:00 AM (2hr) | 📚 Hadith | 🕌 Al Hidaayah Mosque
   📅 Wednesday, February 4, 2026
      🕐 3:00 PM - 6:00 PM (3hr) | 📚 Principles of Islamic Jurisprudence | 🕌 Al Basiirah Mosque
```

## Email Setup

To enable automatic email sending, follow the instructions in `EMAIL_SETUP.md`.

The email system is already configured to send to: **mohamedhbuule2026@gmail.com**

## Notes

- All booking data is stored in browser localStorage
- **Emails are sent IMMEDIATELY when bookings are made**
- You'll always see the **username** prominently in every notification
- You can view bookings anytime using the console functions
- Bookings are grouped by username for easy viewing
- If EmailJS isn't configured, notifications are stored and can be viewed with `viewPendingNotifications()`

## Setting Up Webhook (Alternative to EmailJS)

If you prefer using a webhook instead of EmailJS:

1. Create a webhook URL (using Zapier, Make.com, or your own server)
2. In browser console, run:
```javascript
localStorage.setItem('webhook_url', 'YOUR_WEBHOOK_URL_HERE')
```
3. All booking notifications will be sent to your webhook automatically
