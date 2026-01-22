// Global variables
let userEmail = "";
let bookings = [];

// Initialize time slots (7am to 10pm)
const timeSlots = [];
for (let hour = 7; hour <= 22; hour++) {
  const time12 = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
  const time24 = `${hour.toString().padStart(2, "0")}:00`;
  timeSlots.push({ display: time12, value: time24 });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  const savedEmail = localStorage.getItem("userEmail");
  if (savedEmail) {
    userEmail = savedEmail;
    showMainContent();
  } else {
    showLoginModal();
  }

  // Setup login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Setup booking form
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBooking);
  }

  // Populate time slots when date is selected
  const dateSelect = document.getElementById("sessionDate");
  if (dateSelect) {
    dateSelect.addEventListener("change", populateTimeSlots);
  }

  // Load existing bookings
  loadBookings();
});

// Show login modal
function showLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

// Handle login
function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById("userEmail");
  if (emailInput) {
    userEmail = emailInput.value.trim();
    if (userEmail && isValidEmail(userEmail)) {
      localStorage.setItem("userEmail", userEmail);
      showMainContent();
      sendLoginNotification(userEmail);
    } else {
      alert("Please enter a valid email address");
    }
  }
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Show main content
function showMainContent() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.classList.add("hidden");
  }

  // Show all hidden elements
  const hiddenElements = document.querySelectorAll(".hidden");
  hiddenElements.forEach((el) => {
    if (el.id !== "loginModal" && el.id !== "bookingSuccess") {
      el.classList.remove("hidden");
    }
  });

  // Display user email
  const emailDisplay = document.getElementById("userEmailDisplay");
  if (emailDisplay) {
    emailDisplay.textContent = userEmail;
  }
}

// Populate time slots
function populateTimeSlots() {
  const timeSelect = document.getElementById("sessionTime");
  if (!timeSelect) return;

  // Clear existing options except the first one
  timeSelect.innerHTML = '<option value="">Choose a time...</option>';

  // Add time slots
  timeSlots.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot.value;
    option.textContent = slot.display;
    timeSelect.appendChild(option);
  });
}

// Handle booking submission
function handleBooking(e) {
  e.preventDefault();

  const date = document.getElementById("sessionDate").value;
  const time = document.getElementById("sessionTime").value;
  const subject = document.getElementById("sessionSubject").value;

  if (!date || !time || !subject) {
    alert("Please fill in all fields");
    return;
  }

  // Create booking object
  const booking = {
    email: userEmail,
    date: date,
    time: time,
    subject: subject,
    timestamp: new Date().toISOString(),
  };

  // Add to bookings array
  bookings.push(booking);

  // Save to localStorage
  saveBookings();

  // Send notification
  sendBookingNotification(booking);

  // Show success message
  showSuccessMessage();

  // Reset form
  document.getElementById("bookingForm").reset();
  populateTimeSlots();
}

// Show success message
function showSuccessMessage() {
  const successDiv = document.getElementById("bookingSuccess");
  if (successDiv) {
    successDiv.classList.remove("hidden");
    setTimeout(() => {
      successDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }
}

// Save bookings to localStorage
function saveBookings() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

// Load bookings from localStorage
function loadBookings() {
  const saved = localStorage.getItem("bookings");
  if (saved) {
    bookings = JSON.parse(saved);
  }
}

// Send login notification (you can integrate with your backend/email service)
function sendLoginNotification(email) {
  console.log("User logged in:", email);

  // Here you would send this to your backend
  // Example: fetch('/api/login', { method: 'POST', body: JSON.stringify({ email }) });

  // For now, we'll log it and you can check the console
  // In production, replace this with actual API call to your backend
  const notification = {
    type: "login",
    email: email,
    timestamp: new Date().toISOString(),
  };

  // You can send this to your email service or backend
  // For example, using EmailJS, SendGrid, or your own API
  sendToBackend(notification);
}

// Send booking notification
function sendBookingNotification(booking) {
  console.log("New booking:", booking);

  // Here you would send this to your backend
  // Example: fetch('/api/bookings', { method: 'POST', body: JSON.stringify(booking) });

  // For now, we'll log it and you can check the console
  // In production, replace this with actual API call to your backend
  const notification = {
    type: "booking",
    ...booking,
  };

  // You can send this to your email service or backend
  sendToBackend(notification);
}

// Send data to backend (placeholder - implement with your actual backend)
function sendToBackend(data) {
  // Option 1: Using EmailJS (uncomment and configure)
  /*
  emailjs.send('your_service_id', 'your_template_id', {
    to_email: 'mohamedhbuule2026@gmail.com',
    subject: data.type === 'login' ? 'New User Login' : 'New Session Booking',
    message: JSON.stringify(data, null, 2)
  });
  */

  // Option 2: Using Fetch API to your backend
  /*
  fetch('https://your-backend.com/api/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
  */

  // Option 3: Using Webhook (e.g., Zapier, Make.com, etc.)
  /*
  fetch('https://your-webhook-url.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  */

  // For now, just log to console
  console.log("Notification data to send:", data);

  // You can also display all bookings in console for easy access
  if (data.type === "booking") {
    console.log("All bookings:", bookings);
  }
}

// Export bookings data (for admin access)
function exportBookings() {
  const dataStr = JSON.stringify(bookings, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bookings.json";
  link.click();
}

// Make export function available globally (you can call it from browser console)
window.exportBookings = exportBookings;
window.getAllBookings = () => bookings;

console.log("The Juja B Fellas website loaded successfully");
console.log("To export bookings, run: exportBookings()");
console.log("To view all bookings, run: getAllBookings()");
