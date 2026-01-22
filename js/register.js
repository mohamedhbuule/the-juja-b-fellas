// Register Page Script
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const toggleRegPassword = document.getElementById('toggleRegPassword');
  const toggleRegConfirmPassword = document.getElementById('toggleRegConfirmPassword');
  const regPassword = document.getElementById('regPassword');
  const regConfirmPassword = document.getElementById('regConfirmPassword');
  const errorDiv = document.getElementById('registerError');

  // Toggle password visibility
  if (toggleRegPassword && regPassword) {
    toggleRegPassword.addEventListener('click', () => {
      const type = regPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      regPassword.setAttribute('type', type);
    });
  }

  if (toggleRegConfirmPassword && regConfirmPassword) {
    toggleRegConfirmPassword.addEventListener('click', () => {
      const type = regConfirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      regConfirmPassword.setAttribute('type', type);
    });
  }

  // Handle registration form submission
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;

      // Clear previous errors
      if (errorDiv) {
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
      }

      // Validate
      if (!username || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
      }

      if (username.length < 3) {
        showError('Username must be at least 3 characters');
        return;
      }

      if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
      }

      // Attempt registration
      const result = auth.register(username, email, password);

      if (result.success) {
        // Auto login after registration
        const loginResult = auth.login(username, password);
        if (loginResult.success) {
          // Redirect to home
          window.location.href = 'home.html';
        }
      } else {
        showError(result.message || 'Registration failed');
      }
    });
  }

  function showError(message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Check if already logged in
  if (auth.isAuthenticated()) {
    window.location.href = 'home.html';
  }
});
