// Home Page Script
document.addEventListener('DOMContentLoaded', () => {
  // Calculate total sessions available
  const totalSessions = calculateTotalSessions();
  const totalSessionsEl = document.getElementById('totalSessions');
  if (totalSessionsEl) {
    totalSessionsEl.textContent = totalSessions;
  }
});

function calculateTotalSessions() {
  // 5 days × 16 time slots (7am-10pm) = 80 sessions
  return 80;
}
