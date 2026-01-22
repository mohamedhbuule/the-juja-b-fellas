// Sessions Booking Script
document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  const startTimeSelect = document.getElementById('startTime');
  const endTimeSelect = document.getElementById('endTime');
  const durationDisplay = document.getElementById('durationDisplay');
  const myBookings = document.getElementById('myBookings');
  const successModal = document.getElementById('successModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');

  let currentStep = 1;
  const bookings = loadBookings();

  // Initialize time slots
  initializeTimeSlots();
  
  // Handle start time change
  if (startTimeSelect) {
    startTimeSelect.addEventListener('change', () => {
      updateEndTimeOptions();
      updateDuration();
    });
  }
  
  // Handle end time change
  if (endTimeSelect) {
    endTimeSelect.addEventListener('change', () => {
      updateDuration();
    });
  }

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
      const startTime = formData.get('startTime');
      const endTime = formData.get('endTime');
      const duration = calculateDuration(startTime, endTime);
      
      const booking = {
        id: Date.now().toString(),
        userId: auth.getCurrentUser()?.id,
        username: auth.getCurrentUser()?.username,
        email: auth.getCurrentUser()?.email,
        date: formData.get('sessionDate'),
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        subject: formData.get('sessionSubject'),
        venue: formData.get('sessionVenue'),
        timestamp: new Date().toISOString()
      };

      // Add booking
      bookings.push(booking);
      saveBookings();

      // Send email notification immediately
      sendBookingEmail(booking);
      
      console.log('✅ Booking saved and email notification sent');

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

    // Special validation for time step
    if (step === 2) {
      const startTime = startTimeSelect?.value;
      const endTime = endTimeSelect?.value;
      
      if (!startTime || !endTime) {
        isValid = false;
        alert('Please select both start and end times');
        return false;
      }
      
      // Validate end time is after start time
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      
      if (endHour <= startHour) {
        isValid = false;
        alert('End time must be after start time');
        if (endTimeSelect) {
          endTimeSelect.style.borderColor = 'var(--error)';
          setTimeout(() => {
            if (endTimeSelect) endTimeSelect.style.borderColor = '';
          }, 2000);
        }
        return false;
      }
    }

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
        setTimeout(() => {
          input.style.borderColor = '';
        }, 2000);
      }
    });

    if (!isValid && step !== 2) {
      alert('Please complete all required fields');
    }

    return isValid;
  }

  function initializeTimeSlots() {
    if (!startTimeSelect || !endTimeSelect) return;

    // Generate time options from 7am to 10pm
    const times = [];
    for (let hour = 7; hour <= 22; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = hour > 12 
        ? `${hour - 12}:00 PM` 
        : hour === 12 
        ? '12:00 PM' 
        : `${hour}:00 AM`;
      times.push({ value: time24, display: time12 });
    }

    // Populate start time dropdown
    startTimeSelect.innerHTML = '<option value="">Select start time...</option>';
    times.forEach(time => {
      const option = document.createElement('option');
      option.value = time.value;
      option.textContent = time.display;
      startTimeSelect.appendChild(option);
    });

    // Populate end time dropdown (will be updated based on start time)
    endTimeSelect.innerHTML = '<option value="">Select end time...</option>';
  }

  function updateEndTimeOptions() {
    if (!startTimeSelect || !endTimeSelect) return;

    const startTime = startTimeSelect.value;
    if (!startTime) {
      endTimeSelect.innerHTML = '<option value="">Select end time...</option>';
      return;
    }

    const startHour = parseInt(startTime.split(':')[0]);
    endTimeSelect.innerHTML = '<option value="">Select end time...</option>';

    // Only show times after start time
    for (let hour = startHour + 1; hour <= 22; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = hour > 12 
        ? `${hour - 12}:00 PM` 
        : hour === 12 
        ? '12:00 PM' 
        : `${hour}:00 AM`;

      const option = document.createElement('option');
      option.value = time24;
      option.textContent = time12;
      endTimeSelect.appendChild(option);
    }
  }

  function calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return '';

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = endMinutes - startMinutes;

    if (durationMinutes <= 0) return '';

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}hr ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}hr`;
    } else {
      return `${minutes}min`;
    }
  }

  function updateDuration() {
    if (!durationDisplay || !startTimeSelect || !endTimeSelect) return;

    const startTime = startTimeSelect.value;
    const endTime = endTimeSelect.value;

    if (!startTime || !endTime) {
      durationDisplay.innerHTML = `
        <span class="duration-icon">⏱️</span>
        <span class="duration-text">Select times to see duration</span>
      `;
      return;
    }

    const duration = calculateDuration(startTime, endTime);
    if (!duration) {
      durationDisplay.innerHTML = `
        <span class="duration-icon">⚠️</span>
        <span class="duration-text">End time must be after start time</span>
      `;
      return;
    }

    durationDisplay.innerHTML = `
      <span class="duration-icon">⏱️</span>
      <span class="duration-text">Session Duration: <strong>${duration}</strong></span>
    `;
    durationDisplay.classList.add('duration-active');
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
        if (booking.startTime && booking.endTime) {
          timeEl.textContent = `🕐 ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)} (${booking.duration || calculateDuration(booking.startTime, booking.endTime)})`;
        } else if (booking.time) {
          // Legacy format support
          timeEl.textContent = `🕐 ${formatTime(booking.time)}`;
        }

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
    if (!user) return;
    
    // Get all bookings for this user
    const userBookings = bookings.filter(b => b.userId === user.id);
    
    // Format time display for the new booking
    const timeDisplay = booking.startTime && booking.endTime 
      ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)} (${booking.duration || calculateDuration(booking.startTime, booking.endTime)})`
      : formatTime(booking.time || booking.startTime);
    
    // Create email content with all user's sessions
    let sessionsList = '';
    if (userBookings.length > 0) {
      // Group by date
      const groupedByDate = userBookings.reduce((acc, b) => {
        if (!acc[b.date]) acc[b.date] = [];
        acc[b.date].push(b);
        return acc;
      }, {});
      
      sessionsList = '\n\n📅 ALL SESSIONS FOR THIS USER:\n';
      sessionsList += '═'.repeat(50) + '\n';
      
      Object.keys(groupedByDate).sort().forEach(date => {
        sessionsList += `\n📆 ${formatDate(date)}\n`;
        sessionsList += '─'.repeat(50) + '\n';
        
        groupedByDate[date].forEach(b => {
          const bTimeDisplay = b.startTime && b.endTime 
            ? `${formatTime(b.startTime)} - ${formatTime(b.endTime)} (${b.duration || calculateDuration(b.startTime, b.endTime)})`
            : formatTime(b.time || b.startTime || 'N/A');
          
          sessionsList += `  🕐 Time: ${bTimeDisplay}\n`;
          sessionsList += `  📚 Subject: ${b.subject}\n`;
          sessionsList += `  🕌 Venue: ${b.venue}\n`;
          sessionsList += `  🆔 Booking ID: ${b.id}\n`;
          if (b === booking) {
            sessionsList += `  ✨ NEW BOOKING\n`;
          }
          sessionsList += '\n';
        });
      });
      
      sessionsList += `\nTotal Sessions: ${userBookings.length}\n`;
    }
    
    const emailData = {
      to_email: 'mohamedhbuule2026@gmail.com',
      subject: `🆕 New Session Booking - ${user.username}`,
      message: `
🆕 NEW SESSION BOOKING RECEIVED!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 USER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: ${user.username}
Email: ${user.email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 NEW BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: ${formatDate(booking.date)}
🕐 Time: ${timeDisplay}
📚 Subject: ${booking.subject}
🕌 Venue: ${booking.venue}
🆔 Booking ID: ${booking.id}
⏰ Booked At: ${new Date(booking.timestamp).toLocaleString()}
${sessionsList}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated notification from The Juja B Fellas booking system.
      `.trim()
    };

    // Try to send via EmailJS (if configured)
    if (typeof emailjs !== 'undefined') {
      // Format all sessions for EmailJS template
      let sessionsHtml = '';
      if (userBookings.length > 0) {
        const groupedByDate = userBookings.reduce((acc, b) => {
          if (!acc[b.date]) acc[b.date] = [];
          acc[b.date].push(b);
          return acc;
        }, {});
        
        sessionsHtml = '<h3>All Sessions for ' + user.username + ':</h3><ul>';
        Object.keys(groupedByDate).sort().forEach(date => {
          sessionsHtml += '<li><strong>' + formatDate(date) + '</strong><ul>';
          groupedByDate[date].forEach(b => {
            const bTimeDisplay = b.startTime && b.endTime 
              ? formatTime(b.startTime) + ' - ' + formatTime(b.endTime) + ' (' + (b.duration || calculateDuration(b.startTime, b.endTime)) + ')'
              : formatTime(b.time || b.startTime || 'N/A');
            sessionsHtml += '<li>Time: ' + bTimeDisplay + ' | Subject: ' + b.subject + ' | Venue: ' + b.venue + '</li>';
          });
          sessionsHtml += '</ul></li>';
        });
        sessionsHtml += '</ul><p>Total Sessions: ' + userBookings.length + '</p>';
      }
      
      emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        username: user.username,
        user_email: user.email,
        date: formatDate(booking.date),
        start_time: formatTime(booking.startTime || booking.time || ''),
        end_time: booking.endTime ? formatTime(booking.endTime) : '',
        duration: booking.duration || calculateDuration(booking.startTime || booking.time, booking.endTime),
        subject: booking.subject,
        venue: booking.venue,
        booking_id: booking.id,
        timestamp: new Date(booking.timestamp).toLocaleString(),
        all_sessions: sessionsHtml,
        total_sessions: userBookings.length.toString(),
        to_email: emailData.to_email,
        message: emailData.message
      }).then(
        () => {
          console.log('✅ Booking email sent successfully to admin');
          // Also send confirmation to user
          if (user.email) {
            sendUserConfirmationEmail(booking, user);
          }
        },
        (error) => {
          console.error('❌ Email error:', error);
          // Fallback: Try webhook or log
          sendEmailFallback(emailData);
        }
      );
    } else {
      // Fallback: Try webhook or log
      sendEmailFallback(emailData);
    }

    // Also send confirmation to user
    if (user.email) {
      sendUserConfirmationEmail(booking, user);
    }
  }

  function sendEmailFallback(emailData) {
    // Try webhook first (if configured)
    const webhookUrl = localStorage.getItem('webhook_url');
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      }).then(
        () => console.log('✅ Email sent via webhook'),
        (err) => {
          console.error('❌ Webhook error:', err);
          console.log('📧 Email Data (for manual sending):', emailData);
        }
      );
    } else {
      // Log to console for manual sending
      console.log('📧 Booking Email Data:', emailData);
      console.log('💡 To enable automatic emails, configure EmailJS or set up a webhook URL');
      
      // Create a mailto link as last resort
      const subject = encodeURIComponent(emailData.subject);
      const body = encodeURIComponent(emailData.message);
      const mailtoLink = `mailto:${emailData.to_email}?subject=${subject}&body=${body}`;
      console.log('📬 Mailto link:', mailtoLink);
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
- Time: ${booking.startTime && booking.endTime 
  ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)} (${booking.duration || calculateDuration(booking.startTime, booking.endTime)})`
  : formatTime(booking.time || booking.startTime)}
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
        start_time: formatTime(booking.startTime || booking.time),
        end_time: booking.endTime ? formatTime(booking.endTime) : '',
        duration: booking.duration || calculateDuration(booking.startTime || booking.time, booking.endTime),
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

  // Admin functions - available in browser console
  function getAllBookingsByUsername() {
    const allBookings = loadBookings();
    const byUsername = {};
    
    allBookings.forEach(booking => {
      if (!byUsername[booking.username]) {
        byUsername[booking.username] = {
          username: booking.username,
          email: booking.email,
          sessions: []
        };
      }
      byUsername[booking.username].sessions.push(booking);
    });
    
    return byUsername;
  }

  function getBookingsSummary() {
    const byUsername = getAllBookingsByUsername();
    let summary = '\n📊 BOOKING SUMMARY\n';
    summary += '═'.repeat(60) + '\n\n';
    
    Object.keys(byUsername).forEach(username => {
      const userData = byUsername[username];
      summary += `👤 ${username} (${userData.email})\n`;
      summary += `   Total Sessions: ${userData.sessions.length}\n`;
      summary += '   ─'.repeat(20) + '\n';
      
      // Group by date
      const byDate = userData.sessions.reduce((acc, s) => {
        if (!acc[s.date]) acc[s.date] = [];
        acc[s.date].push(s);
        return acc;
      }, {});
      
      Object.keys(byDate).sort().forEach(date => {
        summary += `   📅 ${formatDate(date)}\n`;
        byDate[date].forEach(s => {
          const timeDisplay = s.startTime && s.endTime 
            ? `${formatTime(s.startTime)} - ${formatTime(s.endTime)} (${s.duration || calculateDuration(s.startTime, s.endTime)})`
            : formatTime(s.time || s.startTime || 'N/A');
          summary += `      🕐 ${timeDisplay} | 📚 ${s.subject} | 🕌 ${s.venue}\n`;
        });
      });
      summary += '\n';
    });
    
    return summary;
  }

  function exportBookings() {
    const dataStr = JSON.stringify(bookings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookings.json';
    link.click();
  }

  // Make functions available globally
  window.exportBookings = exportBookings;
  window.getAllBookings = () => bookings;
  window.getAllBookingsByUsername = getAllBookingsByUsername;
  window.getBookingsSummary = getBookingsSummary;

  // Log summary on page load (for admin)
  console.log('%c📊 Admin Functions Available:', 'color: #38bdf8; font-weight: bold; font-size: 14px;');
  console.log('%c- getAllBookingsByUsername() - Get all bookings grouped by username', 'color: #94a3b8;');
  console.log('%c- getBookingsSummary() - Get formatted summary of all bookings', 'color: #94a3b8;');
  console.log('%c- exportBookings() - Download all bookings as JSON', 'color: #94a3b8;');
  console.log('%c- getAllBookings() - Get raw bookings array', 'color: #94a3b8;');
});
