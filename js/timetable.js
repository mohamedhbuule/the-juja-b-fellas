// Timetable Management Script
document.addEventListener('DOMContentLoaded', () => {
  const user = auth.getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const timetableContainer = document.getElementById('timetableContainer');
  const emptyState = document.getElementById('emptyState');
  const addSessionBtn = document.getElementById('addSessionBtn');
  const exportTimetableBtn = document.getElementById('exportTimetableBtn');
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('editForm');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  let editingSessionId = null;

  // Load and display timetable
  loadTimetable();

  // Add session button
  if (addSessionBtn) {
    addSessionBtn.addEventListener('click', () => {
      window.location.href = 'sessions.html';
    });
  }

  // Export timetable
  if (exportTimetableBtn) {
    exportTimetableBtn.addEventListener('click', () => {
      exportTimetable();
    });
  }

  // Cancel edit
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      closeEditModal();
    });
  }

  // Handle edit form submission
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveEditedSession();
    });
  }

  function loadTimetable() {
    const timetables = JSON.parse(localStorage.getItem('timetables') || '{}');
    const userTimetable = timetables[user.id] || [];

    if (userTimetable.length === 0) {
      if (timetableContainer) timetableContainer.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (timetableContainer) timetableContainer.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    // Group sessions by date
    const groupedByDate = groupByDate(userTimetable);
    
    // Generate timetable HTML
    if (timetableContainer) {
      timetableContainer.innerHTML = generateTimetableHTML(groupedByDate);
    }

    // Attach event listeners
    attachEventListeners();
  }

  function groupByDate(sessions) {
    return sessions.reduce((acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = [];
      }
      acc[session.date].push(session);
      return acc;
    }, {});
  }

  function generateTimetableHTML(groupedByDate) {
    let html = '<div class="timetable-grid">';
    
    Object.keys(groupedByDate).sort().forEach(date => {
      const sessions = groupedByDate[date];
      html += `
        <div class="timetable-day">
          <div class="day-header">
            <div class="day-date">${formatDate(date)}</div>
            <div class="day-sessions-count">${sessions.length} session${sessions.length > 1 ? 's' : ''}</div>
          </div>
          <div class="sessions-list">
      `;

      sessions.forEach(session => {
        const timeDisplay = session.startTime && session.endTime
          ? `${formatTime(session.startTime)} - ${formatTime(session.endTime)} (${session.duration || calculateDuration(session.startTime, session.endTime)})`
          : formatTime(session.time || session.startTime || 'N/A');
        
        const venueDisplay = session.venue === 'Home' ? '🏠' : '🕌';
        const floorDisplay = session.floor ? ` - ${session.floor}` : '';

        html += `
          <div class="session-item" data-session-id="${session.id}">
            <div class="session-details">
              <div class="session-time">${timeDisplay}</div>
              <div class="session-info">📚 ${session.subject}</div>
              <div class="session-info">${venueDisplay} ${session.venue}${floorDisplay}</div>
            </div>
            <div class="session-actions">
              <button class="session-action-btn edit" data-id="${session.id}">✏️ Edit</button>
              <button class="session-action-btn delete" data-id="${session.id}">🗑️ Delete</button>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  function attachEventListeners() {
    // Edit buttons
    document.querySelectorAll('.session-action-btn.edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sessionId = e.target.getAttribute('data-id');
        openEditModal(sessionId);
      });
    });

    // Delete buttons
    document.querySelectorAll('.session-action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sessionId = e.target.getAttribute('data-id');
        deleteSession(sessionId);
      });
    });
  }

  function openEditModal(sessionId) {
    const timetables = JSON.parse(localStorage.getItem('timetables') || '{}');
    const userTimetable = timetables[user.id] || [];
    const session = userTimetable.find(s => s.id === sessionId);

    if (!session) return;

    editingSessionId = sessionId;

    // Populate edit form
    if (editForm) {
      editForm.innerHTML = `
        <div class="form-group">
          <label>Date</label>
          <input type="date" name="date" value="${session.date}" required />
        </div>
        <div class="form-group">
          <label>Start Time</label>
          <input type="time" name="startTime" value="${session.startTime || session.time || ''}" required />
        </div>
        <div class="form-group">
          <label>End Time</label>
          <input type="time" name="endTime" value="${session.endTime || ''}" required />
        </div>
        <div class="form-group">
          <label>Subject</label>
          <input type="text" name="subject" value="${session.subject}" required />
        </div>
        <div class="form-group">
          <label>Venue</label>
          <select name="venue" required>
            <option value="Home" ${session.venue === 'Home' ? 'selected' : ''}>Home</option>
            <option value="Al Basiirah Mosque" ${session.venue === 'Al Basiirah Mosque' ? 'selected' : ''}>Al Basiirah Mosque</option>
            <option value="Al Hijaaz Mosque" ${session.venue === 'Al Hijaaz Mosque' ? 'selected' : ''}>Al Hijaaz Mosque</option>
            <option value="Masjid Abii Bakar" ${session.venue === 'Masjid Abii Bakar' ? 'selected' : ''}>Masjid Abii Bakar</option>
            <option value="Al Hidaayah Mosque" ${session.venue === 'Al Hidaayah Mosque' ? 'selected' : ''}>Al Hidaayah Mosque</option>
          </select>
        </div>
        <div class="form-group" id="floorGroup" style="${session.venue === 'Masjid Abii Bakar' ? '' : 'display: none;'}">
          <label>Floor</label>
          <select name="floor">
            <option value="">None</option>
            <option value="3rd Floor" ${session.floor === '3rd Floor' ? 'selected' : ''}>3rd Floor</option>
            <option value="5th Floor" ${session.floor === '5th Floor' ? 'selected' : ''}>5th Floor</option>
            <option value="6th Floor" ${session.floor === '6th Floor' ? 'selected' : ''}>6th Floor</option>
            <option value="Rooftop" ${session.floor === 'Rooftop' ? 'selected' : ''}>Rooftop</option>
          </select>
        </div>
      `;

      // Show/hide floor selection based on venue
      const venueSelect = editForm.querySelector('select[name="venue"]');
      const floorGroup = editForm.querySelector('#floorGroup');
      if (venueSelect && floorGroup) {
        venueSelect.addEventListener('change', (e) => {
          if (e.target.value === 'Masjid Abii Bakar') {
            floorGroup.style.display = 'block';
          } else {
            floorGroup.style.display = 'none';
          }
        });
      }
    }

    if (editModal) {
      editModal.classList.remove('hidden');
    }
  }

  function closeEditModal() {
    editingSessionId = null;
    if (editModal) {
      editModal.classList.add('hidden');
    }
    if (editForm) {
      editForm.innerHTML = '';
    }
  }

  function saveEditedSession() {
    if (!editingSessionId) return;

    const formData = new FormData(editForm);
    const timetables = JSON.parse(localStorage.getItem('timetables') || '{}');
    const userTimetable = timetables[user.id] || [];
    
    const sessionIndex = userTimetable.findIndex(s => s.id === editingSessionId);
    if (sessionIndex === -1) return;

    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const duration = calculateDuration(startTime, endTime);

    userTimetable[sessionIndex] = {
      ...userTimetable[sessionIndex],
      date: formData.get('date'),
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      subject: formData.get('subject'),
      venue: formData.get('venue'),
      floor: formData.get('floor') || null
    };

    timetables[user.id] = userTimetable;
    localStorage.setItem('timetables', JSON.stringify(timetables));

    closeEditModal();
    loadTimetable();
  }

  function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) return;

    const timetables = JSON.parse(localStorage.getItem('timetables') || '{}');
    const userTimetable = timetables[user.id] || [];
    
    timetables[user.id] = userTimetable.filter(s => s.id !== sessionId);
    localStorage.setItem('timetables', JSON.stringify(timetables));

    loadTimetable();
  }

  function exportTimetable() {
    const timetables = JSON.parse(localStorage.getItem('timetables') || '{}');
    const userTimetable = timetables[user.id] || [];

    if (userTimetable.length === 0) {
      alert('No timetable to export');
      return;
    }

    const dataStr = JSON.stringify(userTimetable, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timetable-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
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
});
