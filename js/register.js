// Register Page Script
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const toggleRegPassword = document.getElementById('toggleRegPassword');
  const toggleRegConfirmPassword = document.getElementById('toggleRegConfirmPassword');
  const regPassword = document.getElementById('regPassword');
  const regConfirmPassword = document.getElementById('regConfirmPassword');
  const regUsername = document.getElementById('regUsername');
  const regEmail = document.getElementById('regEmail');
  const errorDiv = document.getElementById('registerError');

  // Real-time validation
  let validationTimeout;

  // Real-time username validation
  if (regUsername) {
    regUsername.addEventListener('input', () => {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => {
        validateUsername(regUsername.value.trim());
      }, 500);
    });

    regUsername.addEventListener('blur', () => {
      validateUsername(regUsername.value.trim());
    });
  }

  // Real-time email validation
  if (regEmail) {
    regEmail.addEventListener('input', () => {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => {
        validateEmail(regEmail.value.trim());
      }, 500);
    });

    regEmail.addEventListener('blur', () => {
      validateEmail(regEmail.value.trim());
    });
  }

  // Real-time password match validation
  if (regPassword && regConfirmPassword) {
    regConfirmPassword.addEventListener('input', () => {
      validatePasswordMatch();
    });
  }

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

  function validateUsername(username) {
    if (!regUsername) return;

    // Remove previous validation classes
    regUsername.classList.remove('valid', 'invalid');

    if (!username) {
      removeValidationMessage(regUsername);
      return;
    }

    if (username.length < 3) {
      showFieldError(regUsername, 'Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      showFieldError(regUsername, 'Username must be less than 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showFieldError(regUsername, 'Username can only contain letters, numbers, and underscores');
      return;
    }

    // Check for duplicate
    const allUsers = auth.loadUsers();
    if (allUsers.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      showFieldError(regUsername, 'Username already taken');
      return;
    }

    showFieldSuccess(regUsername, 'Username available');
  }

  function validateEmail(email) {
    if (!regEmail) return;

    // Remove previous validation classes
    regEmail.classList.remove('valid', 'invalid');

    if (!email) {
      removeValidationMessage(regEmail);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError(regEmail, 'Please enter a valid email address');
      return;
    }

    // Check for duplicate
    const allUsers = auth.loadUsers();
    if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      showFieldError(regEmail, 'Email already registered');
      return;
    }

    showFieldSuccess(regEmail, 'Email available');
  }

  function validatePasswordMatch() {
    if (!regPassword || !regConfirmPassword) return;

    const password = regPassword.value;
    const confirmPassword = regConfirmPassword.value;

    regConfirmPassword.classList.remove('valid', 'invalid');

    if (!confirmPassword) {
      removeValidationMessage(regConfirmPassword);
      return;
    }

    if (password !== confirmPassword) {
      showFieldError(regConfirmPassword, 'Passwords do not match');
      return;
    }

    showFieldSuccess(regConfirmPassword, 'Passwords match');
  }

  function showFieldError(field, message) {
    field.classList.add('invalid');
    field.classList.remove('valid');
    removeValidationMessage(field);
    
    const messageEl = document.createElement('div');
    messageEl.className = 'field-validation-message error';
    messageEl.textContent = message;
    field.parentElement.appendChild(messageEl);
  }

  function showFieldSuccess(field, message) {
    field.classList.add('valid');
    field.classList.remove('invalid');
    removeValidationMessage(field);
    
    const messageEl = document.createElement('div');
    messageEl.className = 'field-validation-message success';
    messageEl.textContent = message;
    field.parentElement.appendChild(messageEl);
  }

  function removeValidationMessage(field) {
    const existing = field.parentElement.querySelector('.field-validation-message');
    if (existing) {
      existing.remove();
    }
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
