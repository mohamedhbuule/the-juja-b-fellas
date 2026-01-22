// Navigation System
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navClose = document.getElementById('navClose');
  const sideNav = document.getElementById('sideNav');
  const logoutBtn = document.getElementById('logoutBtn');
  const userInfo = document.getElementById('userInfo');

  // Show navigation
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      sideNav.classList.add('active');
    });
  }

  // Hide navigation
  if (navClose) {
    navClose.addEventListener('click', () => {
      sideNav.classList.remove('active');
    });
  }

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (sideNav && sideNav.classList.contains('active')) {
      if (!sideNav.contains(e.target) && e.target !== navToggle) {
        sideNav.classList.remove('active');
      }
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        auth.logout();
      }
    });
  }

  // Display user info
  if (userInfo) {
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      userInfo.textContent = `Logged in as: ${currentUser.username}`;
    }
  }

  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'home.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'home.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});
