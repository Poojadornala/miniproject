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


  const chatbotIcon = document.getElementById("chatbot-icon");
  const chatbotWindow = document.getElementById("chatbot-window");
  const chatlog = document.getElementById("chatlog");

  chatbotIcon.addEventListener("click", () => {
    chatbotWindow.style.display = chatbotWindow.style.display === "flex" ? "none" : "flex";
  });

  function sendChat() {
    const input = document.getElementById("chat-input");
    const userMsg = input.value.trim();
    if (!userMsg) return;

    appendChat("You", userMsg);
    input.value = "";

    const response = getBotResponse(userMsg.toLowerCase());
    setTimeout(() => appendChat("KrishnaBot", response), 600);
  }

  function appendChat(sender, message) {
    const msgDiv = document.createElement("div");
    msgDiv.style.margin = "5px 0";
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatlog.appendChild(msgDiv);
    chatlog.scrollTop = chatlog.scrollHeight;
  }

  function getBotResponse(message) {
    if (message.includes("sloka") || message.includes("slokas"))
      return "You can explore slokas on the Slokas page!";
    if (message.includes("contact"))
      return "You can reach us through the Contact page.";
    if (message.includes("gita") || message.includes("bhagavad"))
      return "Read the Bhagavad Gita section to learn more about Krishna's teachings.";
    if (message.includes("iskcon"))
      return "ISKCON temples are highlighted in the Explore section.";
    if (message.includes("temples") || message.includes("home"))
      return "Visit our homepage to explore ancient and ISKCON Krishna temples.";
    if (message.includes("logout"))
      return "Use the Log out link on the navigation bar.";

    return "Sorry, I can only help with questions related to this site!";
  }