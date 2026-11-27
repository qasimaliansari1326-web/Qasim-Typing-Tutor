
const textDisplay = document.getElementById("text-display");
const typingInput = document.getElementById("typing-input");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const resultDisplay = document.getElementById("result");
const timeSelect = document.getElementById("time-select");
const customTime = document.getElementById("custom-time");
const keyboard = document.getElementById("keyboard");
const fingerMessage = document.getElementById("finger-message");

// Typing paragraphs
const practiceTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Practice typing every day to improve your speed and accuracy.",
    "Learning touch typing helps you work faster and become more productive.",
    "A good typist can type quickly without looking at the keyboard.",
    "Keep practicing every day and your typing speed will improve.",
    "Technology makes our lives easier and helps us learn new skills.",
    "Typing is an important skill for students and computer users.",
    "Always keep your fingers on the home row keys while typing.",
    "The best way to improve typing is to practice regularly.",
    "Never give up because every practice session makes you better."
];

let passageIndex = 0;
let practiceText = practiceTexts[0];

let timeLeft = 60;
let totalTime = 60;
let timer = null;
let isRunning = false;
let startTime = null;

let completedCorrect = 0;
let completedTyped = 0;

// Finger guide
function getFinger(char) {
    char = char.toLowerCase();

    if ("qaz1".includes(char)) return "left-pinky";
    if ("wsx2".includes(char)) return "left-ring";
    if ("edc3".includes(char)) return "left-middle";
    if ("rfvgt45".includes(char)) return "left-index";

    if ("yhnujm67".includes(char)) return "right-index";
    if ("ik8".includes(char)) return "right-middle";
    if ("ol9".includes(char)) return "right-ring";
    if ("p0-=[];'/.\\,`".includes(char)) return "right-pinky";

    if (char === " ") return "left-thumb";

    return "right-pinky";
}

// Create keyboard
function createKeyboard() {
    keyboard.innerHTML = "";

    const rows = [
        "1234567890",
        "qwertyuiop",
        "asdfghjkl",
        "zxcvbnm"
    ];

    rows.forEach(rowText => {
        const row = document.createElement("div");
        row.className = "key-row";

        [...rowText].forEach(char => {
            const key = document.createElement("div");

            key.className = "key";
            key.textContent = char;
            key.dataset.key = char;
            key.dataset.finger = getFinger(char);

            row.appendChild(key);
        });

        keyboard.appendChild(row);
    });

    const spaceRow = document.createElement("div");
    spaceRow.className = "key-row";

    const spaceKey = document.createElement("div");

    spaceKey.className = "key space";
    spaceKey.textContent = "SPACE";
    spaceKey.dataset.key = " ";
    spaceKey.dataset.finger = "left-thumb";

    spaceRow.appendChild(spaceKey);
    keyboard.appendChild(spaceRow);
}

// Display paragraph
function renderText() {
    textDisplay.innerHTML = "";

    [...practiceText].forEach((char, index) => {
        const span = document.createElement("span");

        span.className = "char";
        span.textContent = char;
        span.dataset.index = index;

        textDisplay.appendChild(span);
    });

    updateText();
}

// Green correct letters and red mistakes
function updateText() {
    const typed = typingInput.value;
    const chars = textDisplay.querySelectorAll(".char");

    chars.forEach((span, index) => {
        span.className = "char";

        if (index < typed.length) {
            if (typed[index] === practiceText[index]) {
                span.classList.add("correct");
            } else {
                span.classList.add("wrong");
            }
        }

        if (index === typed.length) {
            span.classList.add("current");
        }
    });

    showFinger(typed.length);
}

// Show next finger and keyboard key
function showFinger(index) {
    document.querySelectorAll(".finger").forEach(finger => {
        finger.classList.remove("active");
    });

    document.querySelectorAll(".key").forEach(key => {
        key.classList.remove("active");
    });

    const nextChar = practiceText[index];

    if (!nextChar) {
        fingerMessage.textContent = "Excellent! Paragraph completed!";
        return;
    }

    const fingerName = getFinger(nextChar);

    const fingerElement = document.querySelector(
        `[data-finger="${fingerName}"]`
    );

    if (fingerElement) {
        fingerElement.classList.add("active");
    }

    const keyElement = [...document.querySelectorAll(".key")].find(
        key => key.dataset.key === nextChar.toLowerCase()
    );

    if (keyElement) {
        keyElement.classList.add("active");
    }

    fingerMessage.textContent =
        "Next key: " +
        (nextChar === " " ? "SPACE" : nextChar) +
        " | Use: " +
        fingerName.replace("-", " ");
}

// Get selected timer
function getSelectedTime() {
    if (timeSelect.value === "custom") {
        const minutes = Number(customTime.value);

        if (!minutes || minutes < 1 || minutes > 60) {
            alert("Enter time between 1 and 60 minutes.");
            return null;
        }

        return minutes * 60;
    }

    return Number(timeSelect.value);
}

// Calculate WPM and accuracy
function updateStats() {
    const typed = typingInput.value;

    let correct = 0;

    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === practiceText[i]) {
            correct++;
        }
    }

    const totalCorrect = completedCorrect + correct;
    const totalTyped = completedTyped + typed.length;

    const elapsedSeconds = Math.max(
        (Date.now() - startTime) / 1000,
        1
    );

    const minutes = elapsedSeconds / 60;

    const wpm = Math.round(
        (totalCorrect / 5) / minutes
    );

    const accuracy = totalTyped > 0
        ? Math.round((totalCorrect / totalTyped) * 100)
        : 100;

    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = accuracy + "%";
}

// Automatically go to next paragraph
function nextPassage() {
    const typed = typingInput.value;

    let correct = 0;

    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === practiceText[i]) {
            correct++;
        }
    }

    // Save completed paragraph results
    completedCorrect += correct;
    completedTyped += typed.length;

    // Move to next paragraph
    passageIndex++;

    // Start again from first paragraph after all paragraphs
    if (passageIndex >= practiceTexts.length) {
        passageIndex = 0;
    }

    practiceText = practiceTexts[passageIndex];

    // Clear input for next paragraph
    typingInput.value = "";

    renderText();
    updateStats();

    resultDisplay.textContent =
        "Next paragraph! Keep typing!";
}

// Start typing test
function startPractice() {
    if (isRunning) return;

    const selectedTime = getSelectedTime();

    if (selectedTime === null) return;

    totalTime = selectedTime;
    timeLeft = totalTime;

    passageIndex = 0;
    practiceText = practiceTexts[0];

    completedCorrect = 0;
    completedTyped = 0;

    typingInput.value = "";
    typingInput.disabled = false;

    renderText();

    timerDisplay.textContent = timeLeft;

    startTime = Date.now();
    isRunning = true;

    startBtn.disabled = true;
    timeSelect.disabled = true;
    customTime.disabled = true;

    resultDisplay.textContent = "";

    typingInput.focus();

    timer = setInterval(() => {
        timeLeft--;

        timerDisplay.textContent = timeLeft;

        updateStats();

        if (timeLeft <= 0) {
            finishPractice();
        }
    }, 1000);
}

// Finish when timer ends
function finishPractice() {
    clearInterval(timer);

    isRunning = false;

    typingInput.disabled = true;
    startBtn.disabled = false;

    timeSelect.disabled = false;
    customTime.disabled = false;

    updateStats();

    resultDisplay.textContent =
        "Time finished! Great job. Keep practicing!";
}

// Typing input
typingInput.addEventListener("input", () => {
    updateText();

    if (isRunning) {
        updateStats();
    }

    // Paragraph complete: automatically move to next
    if (
        typingInput.value.length >= practiceText.length &&
        isRunning
    ) {
        nextPassage();
    }
});

// Timer selection
timeSelect.addEventListener("change", () => {
    customTime.hidden = timeSelect.value !== "custom";
});

// Start button
startBtn.addEventListener("click", startPractice);

// Reset button
resetBtn.addEventListener("click", () => {
    clearInterval(timer);

    isRunning = false;
    startTime = null;

    passageIndex = 0;
    practiceText = practiceTexts[0];

    completedCorrect = 0;
    completedTyped = 0;

    typingInput.value = "";
    typingInput.disabled = true;

    timeSelect.disabled = false;
    customTime.disabled = false;
    startBtn.disabled = false;

    // Reset timer display
    if (timeSelect.value === "custom") {
        const minutes = Number(customTime.value);
        timeLeft = minutes >= 1 && minutes <= 60
            ? minutes * 60
            : 60;
    } else {
        timeLeft = Number(timeSelect.value);
    }

    timerDisplay.textContent = timeLeft;

    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "100%";

    resultDisplay.textContent = "";

    renderText();
});

// Custom timer display
customTime.hidden = timeSelect.value !== "custom";

// Initialize website
createKeyboard();
renderText();
