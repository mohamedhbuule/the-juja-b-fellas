// Sessions Booking Script
document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  const timeGrid = document.getElementById('timeGrid');
  const myBookings = document.getElementById('myBookings');
  const successModal = document.getElementById('successModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');

  let currentStep = 1;
  const bookings = loadBookings();

  // Initialize time slots
  initializeTimeSlots();

  // Display existing bookings
  displayBookings();

  // Step navigation
  const nextButtons = document.querySelectorAll('.next-step');
  const prevButtons = document.querySelectorAll('.prev-step');

  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1);
      }
    });
  });

  prevButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  });

  // Handle form submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateStep(4)) {
        return;
      }

      // Get form data
      const formData = new FormData(bookingForm);
      const booking = {
        id: Date.now().toString(),
        userId: auth.getCurrentUser()?.id,
        username: auth.getCurrentUser()?.username,
        email: auth.getCurrentUser()?.email,
        date: formData.get('sessionDate'),
        time: formData.get('sessionTime'),
        subject: formData.get('sessionSubject'),
        venue: formData.get('sessionVenue'),
        timestamp: new Date().toISOString()
      };

      // Add booking
      bookings.push(booking);
      saveBookings();

      // Send email notification
      sendBookingEmail(booking);

      // Show success modal
      if (successModal) {
        successModal.classList.remove('hidden');
      }

      // Reset form
      bookingForm.reset();
      currentStep = 1;
      goToStep(1);
      displayBookings();
    });
  }

  // Close success modal
  if (closeSuccessModal) {
    closeSuccessModal.addEventListener('click', () => {
      if (successModal) {
        successModal.classList.add('hidden');
      }
    });
  }

  function goToStep(step) {
    if (step < 1 || step > 4) return;

    // Hide current step
    const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (currentStepEl) {
      currentStepEl.classList.remove('active');
    }

    // Update step indicator
    const currentStepIndicator = document.querySelector(`.step[data-step="${currentStep}"]`);
    if (currentStepIndicator) {
      currentStepIndicator.classList.remove('active');
      if (currentStep < step) {
        currentStepIndicator.classList.add('completed');
      }
    }

    currentStep = step;

    // Show new step
    const newStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (newStepEl) {
      newStepEl.classList.add('active');
    }

    // Update step indicator
    const newStepIndicator = document.querySelector(`.step[data-step="${currentStep}"]`);
    if (newStepIndicator) {
      newStepIndicator.classList.add('active');
    }
  }

  function validateStep(step) {
    const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    if (!stepEl) return false;

    const requiredInputs = stepEl.querySelectorAll('input[required], select[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
      if (input.type === 'radio') {
        const radioGroup = stepEl.querySelectorAll(`input[name="${input.name}"]`);
        const isChecked = Array.from(radioGroup).some(radio => radio.checked);
        if (!isChecked) {
          isValid = false;
          input.closest('.form-step').style.border = '2px solid var(--error)';
        }
      } else if (!input.value) {
        isValid = false;
        input.style.borderColor = 'var(--error)';
      }
    });

    if (!isValid) {
      alert('Please complete all required fields');
    }

    return isValid;
  }

  function initializeTimeSlots() {
    if (!timeGrid) return;

    timeGrid.innerHTML = '';

    // Generate time slots from 7am to 10pm
    for (let hour = 7; hour <= 22; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = hour > 12 
        ? `${hour - 12}:00 PM` 
        : hour === 12 
        ? '12:00 PM' 
        : `${hour}:00 AM`;

      const label = document.createElement('label');
      label.className = 'time-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'sessionTime';
      input.value = time24;
      input.required = true;

      const card = document.createElement('div');
      card.className = 'time-card';
      card.textContent = time12;

      label.appendChild(input);
      label.appendChild(card);
      timeGrid.appendChild(label);
    }
  }

  function displayBookings() {
    if (!myBookings) return;

    const userBookings = bookings.filter(b => b.userId === auth.getCurrentUser()?.id);

    if (userBookings.length === 0) {
      myBookings.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No bookings yet. Book your first session above!</p>';
      return;
    }

    // Group bookings by date
    const grouped = groupByDate(userBookings);

    myBookings.innerHTML = '';

    Object.keys(grouped).sort().forEach(date => {
      const dateBookings = grouped[date];
      
      dateBookings.forEach(booking => {
        const item = document.createElement('div');
        item.className = 'booking-item';

        const details = document.createElement('div');
        details.className = 'booking-details';

        const dateEl = document.createElement('div');
        dateEl.className = 'booking-date';
        dateEl.textContent = formatDate(booking.date);

        const timeEl = document.createElement('div');
        timeEl.className = 'booking-info';
        timeEl.textContent = `🕐 ${formatTime(booking.time)}`;

        const subjectEl = document.createElement('div');
        subjectEl.className = 'booking-info';
        subjectEl.textContent = `📚 ${booking.subject}`;

        const venueEl = document.createElement('div');
        venueEl.className = 'booking-info';
        venueEl.textContent = `🕌 ${booking.venue}`;

        details.appendChild(dateEl);
        details.appendChild(timeEl);
        details.appendChild(subjectEl);
        details.appendChild(venueEl);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-booking';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to delete this booking?')) {
            deleteBooking(booking.id);
          }
        });

        item.appendChild(details);
        item.appendChild(deleteBtn);
        myBookings.appendChild(item);
      });
    });
  }

  function groupByDate(bookings) {
    return bookings.reduce((acc, booking) => {
      if (!acc[booking.date]) {
        acc[booking.date] = [];
      }
      acc[booking.date].push(booking);
      return acc;
    }, {});
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  }

  function deleteBooking(id) {
    const index = bookings.findIndex(b => b.id === id);
    if (index > -1) {
      bookings.splice(index, 1);
      saveBookings();
      displayBookings();
    }
  }

  function loadBookings() {
    const stored = localStorage.getItem('bookings');
    return stored ? JSON.parse(stored) : [];
  }

  function saveBookings() {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }

  function sendBookingEmail(booking) {
    const user = auth.getCurrentUser();
    
    // Email data
    const emailData = {
      to_email: 'mohamedhbuule2026@gmail.com',
      subject: `New Session Booking - ${user.username}`,
      message: `
New Session Booking Received!

User Details:
- Username: ${user.username}
- Email: ${user.email}

Booking Details:
- Date: ${formatDate(booking.date)}
- Time: ${formatTime(booking.time)}
- Subject: ${booking.subject}
- Venue: ${booking.venue}
- Booking ID: ${booking.id}
- Booked At: ${new Date(booking.timestamp).toLocaleString()}
      `.trim()
    };

    // Try to send via EmailJS (if configured)
    if (typeof emailjs !== 'undefined') {
      emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        username: user.username,
        email: user.email,
        date: formatDate(booking.date),
        time: formatTime(booking.time),
        subject: booking.subject,
        venue: booking.venue,
        booking_id: booking.id,
        timestamp: new Date(booking.timestamp).toLocaleString(),
        to_email: emailData.to_email
      }).then(
        () => {
          console.log('Booking email sent successfully to admin');
          // Also send confirmation to user
          if (user.email) {
            sendUserConfirmationEmail(booking, user);
          }
        },
        (error) => console.error('Email error:', error)
      );
    } else {
      // Fallback: Use mailto link or log to console
      console.log('Booking Email Data:', emailData);
      
      // Alternative: Use a webhook or API endpoint
      // You can set up a simple webhook using services like:
      // - Zapier
      // - Make.com (formerly Integromat)
      // - Webhook.site for testing
      // - Your own backend API
      
      // Example webhook call (uncomment and configure):
      /*
      fetch('YOUR_WEBHOOK_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      }).catch(err => console.error('Webhook error:', err));
      */
    }

    // Also send confirmation to user
    if (user.email) {
      sendUserConfirmationEmail(booking, user);
    }
  }

  function sendUserConfirmationEmail(booking, user) {
    const userEmailData = {
      to_email: user.email,
      subject: 'Session Booking Confirmation - The Juja B Fellas',
      message: `
Dear ${user.username},

Your session has been booked successfully!

Booking Details:
- Date: ${formatDate(booking.date)}
- Time: ${formatTime(booking.time)}
- Subject: ${booking.subject}
- Venue: ${booking.venue}

We look forward to seeing you!

Best regards,
The Juja B Fellas Team
      `.trim()
    };

    // Try to send via EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.send('YOUR_SERVICE_ID', 'YOUR_USER_TEMPLATE_ID', {
        username: user.username,
        email: user.email,
        date: formatDate(booking.date),
        time: formatTime(booking.time),
        subject: booking.subject,
        venue: booking.venue,
        to_email: user.email
      }).then(
        () => console.log('Confirmation email sent to user'),
        (error) => console.error('User email error:', error)
      );
    } else {
      console.log('User Confirmation Email:', userEmailData);
    }
  }
});
