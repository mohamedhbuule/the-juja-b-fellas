// Profile Page Script
document.addEventListener('DOMContentLoaded', () => {
  const user = auth.getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Load user data
  loadProfileData();
  loadUserBookings();
  loadUserStats();

  // Handle form submission
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }

  function loadProfileData() {
    const usernameEl = document.getElementById('profileUsername');
    const emailEl = document.getElementById('profileEmail');
    const memberSinceEl = document.getElementById('memberSince');
    const editUsernameEl = document.getElementById('editUsername');
    const editEmailEl = document.getElementById('editEmail');

    if (usernameEl) usernameEl.textContent = user.username;
    if (emailEl) emailEl.textContent = user.email;
    if (memberSinceEl) {
      const date = new Date(user.createdAt);
      memberSinceEl.textContent = `Member since: ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    }
    if (editUsernameEl) editUsernameEl.value = user.username;
    if (editEmailEl) editEmailEl.value = user.email;
  }

  function loadUserStats() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = bookings.filter(b => b.userId === user.id);
    const now = new Date();
    
    const upcoming = userBookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate >= now;
    });

    const completed = userBookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate < now;
    });

    const totalEl = document.getElementById('totalBookings');
    const upcomingEl = document.getElementById('upcomingSessions');
    const completedEl = document.getElementById('completedSessions');

    if (totalEl) totalEl.textContent = userBookings.length;
    if (upcomingEl) upcomingEl.textContent = upcoming.length;
    if (completedEl) completedEl.textContent = completed.length;
  }

  function loadUserBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = bookings.filter(b => b.userId === user.id);
    const recentBookings = userBookings
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    const container = document.getElementById('recentBookings');
    if (!container) return;

    if (recentBookings.length === 0) {
      container.innerHTML = '<p class="no-bookings">No bookings yet. <a href="sessions.html">Book your first session!</a></p>';
      return;
    }

    container.innerHTML = '';
    recentBookings.forEach(booking => {
      const item = document.createElement('div');
      item.className = 'booking-preview-item';

      const date = new Date(booking.date);
      const timeDisplay = booking.startTime && booking.endTime 
        ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`
        : formatTime(booking.time || booking.startTime || 'N/A');

      item.innerHTML = `
        <div class="booking-preview-date">${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <div class="booking-preview-details">🕐 ${timeDisplay}</div>
        <div class="booking-preview-details">📚 ${booking.subject}</div>
        <div class="booking-preview-details">🕌 ${booking.venue}</div>
      `;

      container.appendChild(item);
    });
  }

  function formatTime(time24) {
    if (!time24) return 'N/A';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  }

  function handleProfileUpdate(e) {
    e.preventDefault();

    const errorDiv = document.getElementById('profileError');
    const successDiv = document.getElementById('profileSuccess');
    const editUsername = document.getElementById('editUsername').value.trim();
    const editEmail = document.getElementById('editEmail').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    // Clear previous messages
    if (errorDiv) {
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
    }
    if (successDiv) {
      successDiv.classList.add('hidden');
      successDiv.textContent = '';
    }

    // Validate username
    if (editUsername.length < 3 || editUsername.length > 20) {
      showError('Username must be between 3 and 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(editUsername)) {
      showError('Username can only contain letters, numbers, and underscores');
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      showError('Please enter a valid email address');
      return;
    }

    // Check for duplicate username (if changed)
    if (editUsername !== user.username) {
      const allUsers = auth.loadUsers();
      if (allUsers.find(u => u.username === editUsername && u.id !== user.id)) {
        showError('Username already taken');
        return;
      }
    }

    // Check for duplicate email (if changed)
    if (editEmail !== user.email) {
      const allUsers = auth.loadUsers();
      if (allUsers.find(u => u.email === editEmail && u.id !== user.id)) {
        showError('Email already registered to another account');
        return;
      }
    }

    // Validate password change
    if (newPassword) {
      if (newPassword.length < 6) {
        showError('New password must be at least 6 characters');
        return;
      }

      if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
      }

      if (!currentPassword) {
        showError('Please enter your current password to change it');
        return;
      }

      // Verify current password
      if (auth.hashPassword(currentPassword) !== user.password) {
        showError('Current password is incorrect');
        return;
      }
    }

    // Update user
    const allUsers = auth.loadUsers();
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) {
      showError('User not found');
      return;
    }

    allUsers[userIndex].username = editUsername;
    allUsers[userIndex].email = editEmail;
    if (newPassword) {
      allUsers[userIndex].password = auth.hashPassword(newPassword);
    }

    localStorage.setItem('users', JSON.stringify(allUsers));

    // Update current user
    const updatedUser = allUsers[userIndex];
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    auth.currentUser = updatedUser;

    // Update bookings with new username/email
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.forEach(booking => {
      if (booking.userId === user.id) {
        booking.username = editUsername;
        booking.email = editEmail;
      }
    });
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Reload profile data
    loadProfileData();
    loadUserBookings();

    // Show success
    if (successDiv) {
      successDiv.textContent = 'Profile updated successfully!';
      successDiv.classList.remove('hidden');
    }

    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';

    // Scroll to success message
    if (successDiv) {
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function showError(message) {
    const errorDiv = document.getElementById('profileError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});
