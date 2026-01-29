// Language Selection Script
document.addEventListener('DOMContentLoaded', () => {
  const preferencesForm = document.getElementById('preferencesForm');
  const user = auth.getCurrentUser();

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Check if preferences already set
  const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  if (preferences[user.id]) {
    // Redirect based on preferences
    const userPrefs = preferences[user.id];
    setLanguage(userPrefs.language);
    setStudyMode(userPrefs.studyMode);
    window.location.href = 'home.html';
    return;
  }

  // Handle form submission
  if (preferencesForm) {
    preferencesForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(preferencesForm);
      const language = formData.get('language');
      const studyMode = formData.get('studyMode');

      // Save preferences
      if (!preferences[user.id]) {
        preferences[user.id] = {};
      }
      preferences[user.id].language = language;
      preferences[user.id].studyMode = studyMode;
      localStorage.setItem('userPreferences', JSON.stringify(preferences));

      // Set language and study mode
      setLanguage(language);
      setStudyMode(studyMode);

      // Update UI immediately
      if (typeof updatePageLanguage === 'function') {
        updatePageLanguage(language);
      }

      // Redirect to home
      window.location.href = 'home.html';
    });
  }

  // Update text based on language selection
  const languageInputs = document.querySelectorAll('input[name="language"]');
  languageInputs.forEach(input => {
    input.addEventListener('change', () => {
      updateLanguageDisplay(input.value);
    });
  });
});

function setLanguage(lang) {
  localStorage.setItem('currentLanguage', lang);
  document.documentElement.setAttribute('lang', lang);
  if (lang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.body.classList.add('arabic-text');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.body.classList.remove('arabic-text');
  }
  
  // Load translations script if available
  if (typeof updatePageLanguage === 'function') {
    updatePageLanguage(lang);
  }
}

function setStudyMode(mode) {
  localStorage.setItem('currentStudyMode', mode);
}

function updateLanguageDisplay(lang) {
  const elements = document.querySelectorAll('[data-en][data-ar]');
  elements.forEach(el => {
    if (lang === 'ar') {
      el.textContent = el.getAttribute('data-ar');
    } else {
      el.textContent = el.getAttribute('data-en');
    }
  });
}
