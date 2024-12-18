document.addEventListener("DOMContentLoaded", function () {
  const chatDiv = document.getElementById("chat");
  const inputField = document.getElementById("input");
  const sendButton = document.getElementById("button");
  const id = makeid(36);

  function makeid(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  const selectElement = document.getElementById("model");
  let selectedMode = "python";
  selectElement.addEventListener("change", (event) => {
    selectedMode = event.target.value;
    const placeholderOption = selectElement.querySelector("option[value='']");
    if (placeholderOption) {
      placeholderOption.remove();
    }

    console.log("Selected Model:", selectedMode);
  });

  function addFeedbackButtons(messageDiv) {
    const thumbsUpButton = document.createElement("button");
    thumbsUpButton.innerText = "👍";
    thumbsUpButton.onclick = () => submitFeedback(true);

    const thumbsDownButton = document.createElement("button");
    thumbsDownButton.innerText = "👎";
    thumbsDownButton.onclick = () => submitFeedback(false);

    messageDiv.appendChild(thumbsUpButton);
    messageDiv.appendChild(thumbsDownButton);
  }

  function submitFeedback(isPositive) {
    // Get the current timestamp and feedback type
    const feedback = {
      timestamp: new Date().toISOString(),
      isPositive: isPositive,
    };

    // Send the feedback data to the server
    fetch("http://127.0.0.1:5000/feedback", {
      // Replace with your server URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Feedback submitted successfully:", data);
      })
      .catch((error) => {
        console.error("Error submitting feedback:", error);
      });
  }
  // Fungsi untuk menampilkan pop-up pilihan mode
  function showModeSelection() {
    const modePopup = document.createElement("div");
    modePopup.classList.add("mode-popup");

    const message = document.createElement("p");
    message.textContent = "Pilih mode chatbot:";

    const genAIButton = document.createElement("button");
    genAIButton.textContent = "Generative AI";
    genAIButton.onclick = () => {
      selectedMode = "genai";
      document.body.removeChild(modePopup);
    };

    const pythonModelButton = document.createElement("button");
    pythonModelButton.textContent = "Model Python";
    pythonModelButton.onclick = () => {
      selectedMode = "python";
      document.body.removeChild(modePopup);
    };

    modePopup.appendChild(message);
    modePopup.appendChild(genAIButton);
    modePopup.appendChild(pythonModelButton);

    document.body.appendChild(modePopup);
  }

  // Tampilkan pop-up saat halaman dimuat
  // window.onload = () => {
  //   showModeSelection();
  // };

  // Fungsi untuk menambahkan pesan ke chat
  function appendMessage(text, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", isUser ? "user" : "bot");

    // Tambahkan avatar
    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("avatar");

    // Tambahkan teks
    const textDiv = document.createElement("div");
    textDiv.classList.add("text");
    textDiv.innerHTML = text;

    messageDiv.appendChild(isUser ? textDiv : avatarDiv);
    messageDiv.appendChild(isUser ? avatarDiv : textDiv);

    chatDiv.appendChild(messageDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;

    if (!isUser) {
      addFeedbackButtons(messageDiv); // Add feedback buttons for bot messages
    }
  }

  function speak(text) {
    if ("speechSynthesis" in window) {
      console.log("Speaking:", text); // Debugging line to see if it's being called
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported in this browser.");
    }
  }

  // Kirim pesan ke server
  sendButton.addEventListener("click", () => {
    if (!selectedMode) {
      alert("Silakan pilih mode terlebih dahulu.");
      return;
    }

    const userMessage = inputField.value.trim();
    if (!userMessage) return;

    appendMessage(userMessage, true);
    inputField.value = "";

    // Kirim pesan ke server Flask
    fetch(`http://127.0.0.1:5000/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, mode: selectedMode }), // Kirim mode bersama pesan
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.response) {
          appendMessage(data.response, false);
          speak(data.response); // Ensure there's text to speak
        } else {
          appendMessage("No response from the bot.", false);
        }
      })
      .catch((error) => {
        appendMessage("Error: Unable to connect to chatbot.", false);
      });
  });

  // Kirim pesan dengan tombol Enter
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendButton.click();
    }
  });
});
