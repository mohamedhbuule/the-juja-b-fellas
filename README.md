# The Juja B Fellas - Revision Session Booking System

A modern, multi-page web application for booking Islamic revision sessions with elegant styling and full authentication system.

## Features

✅ **Multi-Page Architecture** - Each section has its own dedicated page
✅ **Side Navigation Menu** - Elegant slide-out navigation for easy access
✅ **User Authentication** - Registration and login system with username/password
✅ **Session Booking** - Multi-step booking flow (Date → Time → Subject → Venue)
✅ **Multiple Sessions** - Book 2-3 different sessions per day
✅ **Responsive Design** - Works perfectly on both mobile and desktop
✅ **Email Notifications** - Automatic email sending for booking confirmations
✅ **Unique Styling** - Each page has its own elegant, modern design

## File Structure

```
the-juja-b-fellas/
├── index.html          # Login page
├── register.html       # Registration page
├── home.html          # Home/Dashboard page
├── about.html         # About page
├── sessions.html      # Booking page (main feature)
├── subjects.html      # Subjects information page
├── quotes.html        # Motivational quotes page
├── contact.html       # Contact page
├── styles/
│   ├── common.css     # Shared styles (nav, buttons, etc.)
│   ├── login.css      # Login page styles
│   ├── register.css   # Registration page styles
│   ├── home.css       # Home page styles
│   ├── about.css      # About page styles
│   ├── sessions.css   # Booking page styles
│   ├── subjects.css   # Subjects page styles
│   ├── quotes.css     # Quotes page styles
│   └── contact.css    # Contact page styles
├── js/
│   ├── auth.js        # Authentication system
│   ├── navigation.js  # Side nav functionality
│   ├── login.js       # Login page logic
│   ├── register.js    # Registration logic
│   ├── home.js        # Home page logic
│   ├── sessions.js    # Booking system logic
│   └── contact.js     # Contact form logic
└── EMAIL_SETUP.md     # Email configuration guide
```

## Getting Started

### 1. Setup Background Image
- Add your background image as `background.jpg` in the root directory
- The image will be used as a subtle background across all pages

### 2. Configure Email Notifications
See `EMAIL_SETUP.md` for detailed instructions on setting up automatic email notifications.

**Quick Setup (EmailJS):**
1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. Create an email service and template
3. Update `sessions.html` and `contact.html` with your EmailJS Public Key
4. Update `js/sessions.js` with your Service ID and Template ID

### 3. Deploy
Simply upload all files to your web server. No build process required!

## Usage

### For Users

1. **Register**: Create an account with username, email, and password
2. **Login**: Use your username and password to access the system
3. **Book Sessions**: 
   - Navigate to "Book Session"
   - Choose date (Feb 2-6)
   - Select time (7am-10pm)
   - Pick subject
   - Choose venue
   - Complete booking
4. **Multiple Bookings**: You can book multiple sessions per day with different subjects and venues

### For Admin

- All booking data is stored in browser localStorage
- To view bookings, open browser console and run: `getAllBookings()`
- To export bookings, run: `exportBookings()`
- Email notifications are sent automatically when bookings are made

## Booking System Details

### Available Dates
- February 2, 2026
- February 3, 2026
- February 4, 2026
- February 5, 2026
- February 6, 2026

### Available Times
- 7:00 AM to 10:00 PM (hourly slots)

### Available Subjects
- Science of Hadith
- Jurisprudence
- Principles of Islamic Jurisprudence
- Islamic Creed
- Hadith

### Available Venues
- Al Basiirah Mosque
- Al Hijaaz Mosque
- Masjid Abii Bakar
- Al Hidaayah Mosque

## Customization

### Colors
Edit CSS variables in `styles/common.css`:
```css
:root {
  --primary: #38bdf8;
  --primary-dark: #0ea5e9;
  --bg-dark: #020617;
  /* ... more variables */
}
```

### Dates/Times
Update the date options in `sessions.html` and time generation in `js/sessions.js`

### Subjects/Venues
Update options in `sessions.html`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript
- EmailJS (for email notifications)
- Google Fonts (Poppins & Playfair Display)

## Notes

- All user data is stored in browser localStorage
- For production use, consider implementing a backend database
- EmailJS free tier allows 100 emails/month
- Background image is optional (gradient fallback provided)

## Support

For issues or questions, contact: mohamedhbuule2026@gmail.com

---

Built with ❤️ for The Juja B Fellas community
