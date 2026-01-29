// Apply translations on page load
document.addEventListener('DOMContentLoaded', () => {
  const currentLang = localStorage.getItem('currentLanguage') || 'en';
  if (currentLang === 'ar' && typeof updatePageLanguage === 'function') {
    // Small delay to ensure translations.js is loaded
    setTimeout(() => {
      updatePageLanguage('ar');
    }, 100);
  }
});

// Also apply when language changes
window.addEventListener('storage', (e) => {
  if (e.key === 'currentLanguage' && typeof updatePageLanguage === 'function') {
    updatePageLanguage(e.newValue || 'en');
  }
});
