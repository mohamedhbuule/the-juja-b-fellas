// Login Page Script
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('loginError');

  // Toggle password visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
    });
  }

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      // Clear previous errors
      if (errorDiv) {
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
      }

      // Validate
      if (!username || !password) {
        showError('Please fill in all fields');
        return;
      }

      // Attempt login
      const result = auth.login(username, password);

      if (result.success) {
        // Check if preferences are set
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences[result.user.id]) {
          // Preferences already set, go to home
          window.location.href = 'home.html';
        } else {
          // Redirect to language selection
          window.location.href = 'language-selection.html';
        }
      } else {
        showError(result.message || 'Invalid credentials');
      }
    });
  }

  function showError(message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
  }

  // Check if already logged in
  if (auth.isAuthenticated()) {
    window.location.href = 'home.html';
  }
});
