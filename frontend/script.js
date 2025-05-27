document.addEventListener("DOMContentLoaded", () => {
    let apiUrl = "https://libretranslate.com/translate"; // LibreTranslate API
    let maxLength = 400;

    function splitText(text) {
        let sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g);
        let chunks = [];
        let currentChunk = "";

        sentences.forEach(sentence => {
            if ((currentChunk + sentence).length < maxLength) {
                currentChunk += sentence + " ";
            } else {
                chunks.push(currentChunk.trim());
                currentChunk = sentence + " ";
            }
        });
        if (currentChunk) chunks.push(currentChunk.trim());

        return chunks;
    }

    function translateText(text, targetLang, callback) {
        let chunks = splitText(text);
        let translatedChunks = [];

        function processChunk(index) {
            if (index >= chunks.length) {
                callback(translatedChunks.join(" "));
                return;
            }

            fetch(apiUrl, {
                method: "POST",
                body: JSON.stringify({
                    q: chunks[index],
                    source: "en",
                    target: targetLang,
                    format: "text"
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.json())
                .then(data => {
                    translatedChunks.push(data.translatedText);
                    processChunk(index + 1);
                })
                .catch(err => console.error("Translation Error:", err));
        }

        processChunk(0);
    }

    function translatePage(targetLang) {
        document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, th, td, a, button").forEach(element => {
            if (element.innerText.trim()) {
                translateText(element.innerText, targetLang, (translated) => {
                    element.innerText = translated;
                });
            }
        });
    }

    document.getElementById("languageSelect").addEventListener("change", function () {
        let selectedLang = this.value;
        localStorage.setItem("selectedLanguage", selectedLang);
        translatePage(selectedLang);
    });

    let savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang) {
        translatePage(savedLang);
        document.getElementById("languageSelect").value = savedLang;
    }
});
