window.googleTranslateElementInit = function () {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,hi,te,ta,kn,ml',
    layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
  }, 'google_translate_element');
};

 window.addEventListener('load', function () {
  if (typeof google !== 'undefined' && google.translate) {
    window.googleTranslateElementInit();
  }
});

