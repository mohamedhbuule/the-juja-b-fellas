# Admin Guide - Viewing Bookings

## Automatic Email Notifications

When someone books a session, you will **automatically receive an email** at **mohamedhbuule2026@gmail.com** with:

✅ **Username** of the person who booked  
✅ **Email address** of the person  
✅ **New booking details** (date, time, subject, venue)  
✅ **All sessions** that user has booked (complete history)  
✅ **Total session count** for that user  

This way, you can see:
- Who booked what
- All sessions each person has chosen
- Complete booking history per user

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
- Emails are sent automatically when bookings are made
- You can view bookings anytime using the console functions
- Bookings are grouped by username for easy viewing
