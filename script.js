let currentLevel = 1;
const levels = 3;
let completedLevels = [false, false, false];

const level1Data = {
    sentence: "The quick brown fox jumps over the lazy dog",
    words: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"]
};

const level2Data = [
    { sentence: "I eat breakfast every morning", tense: "Present Simple" },
    { sentence: "She was watching TV when I called", tense: "Past Continuous" },
    { sentence: "They will have finished the project by next week", tense: "Future Perfect" }
];

const level3Data = {
    word: "Happy",
    synonyms: ["Joyful", "Sad", "Excited", "Angry"],
    correctSynonym: "Joyful"
};

function startGame(level) {
    if (level > 1 && !completedLevels[level - 2]) {
        showPopup(`Complete Level ${level - 1} first!`);
        return;
    }

    document.getElementById('homepage').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    currentLevel = level;
    document.querySelectorAll('.level').forEach(el => el.style.display = 'none');
    document.getElementById(`level${level}`).style.display = 'block';
    document.getElementById('result').textContent = '';
    if (level === 1) startLevel1();
    else if (level === 2) startLevel2();
    else if (level === 3) startLevel3();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startLevel1() {
    const wordsContainer = document.getElementById("words");
    const shuffledWords = [...level1Data.words];
    shuffleArray(shuffledWords);

    wordsContainer.innerHTML = '';
    shuffledWords.forEach(word => {
        createWordElement(word, wordsContainer);
    });

    const sentenceContainer = document.getElementById("sentence");
    sentenceContainer.innerHTML = '';
    sentenceContainer.addEventListener("dragover", allowDrop);
    sentenceContainer.addEventListener("drop", drop);

    wordsContainer.addEventListener("dragover", allowDrop);
    
    wordsContainer.addEventListener("drop", drop);
}

function startLevel2() {
    const matchesContainer = document.getElementById("matches");
    matchesContainer.innerHTML = '';

    level2Data.forEach((item, index) => {
        const matchItem = document.createElement("div");
        matchItem.className = "match-item";
        matchItem.innerHTML = `
            <span class="match-sentence">${item.sentence}</span>
            <div class="match-tense" data-index="${index}" ondragover="allowDrop(event)" ondrop="dropLevel2(event)"></div>
        `;
        matchesContainer.appendChild(matchItem);
    });

    const tensesContainer = document.getElementById("tenses");
    tensesContainer.innerHTML = '';
    const tenses = ["Present Simple", "Past Continuous", "Future Perfect"];
    shuffleArray(tenses);
    tenses.forEach(tense => {
        createWordElement(tense, tensesContainer);
    });

    tensesContainer.addEventListener("dragover", allowDrop);
    tensesContainer.addEventListener("drop", dropLevel2);
}

function startLevel3() {
    document.getElementById("word-to-match").textContent = level3Data.word;
    const synonymsContainer = document.getElementById("synonyms");
    synonymsContainer.innerHTML = '';
    const shuffledSynonyms = [...level3Data.synonyms];
    shuffleArray(shuffledSynonyms);

    shuffledSynonyms.forEach(synonym => {
        const synonymElement = document.createElement("div");
        synonymElement.className = "synonym";
        synonymElement.textContent = synonym;
        synonymElement.onclick = () => selectSynonym(synonym);
        synonymsContainer.appendChild(synonymElement);
    });
}

function createWordElement(word, container) {
    const wordElement = document.createElement("div");
    wordElement.className = "word";
    wordElement.textContent = word;
    wordElement.draggable = true;
    wordElement.addEventListener("dragstart", drag);
    container.appendChild(wordElement);
}

function allowDrop(ev) {
    ev.preventDefault();
    ev.target.classList.add('drag-over');
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.textContent);
    ev.dataTransfer.setData("sourceId", ev.target.parentElement.id);
}

function drop(ev) {
    ev.preventDefault();
    ev.target.classList.remove('drag-over');
    const data = ev.dataTransfer.getData("text");
    const sourceId = ev.dataTransfer.getData("sourceId");
    
    let targetContainer;
    if (ev.target.className.includes("drop-zone") || ev.target.id === "words" || ev.target.id === "tenses") {
        targetContainer = ev.target;
    } else if (ev.target.className === "word") {
        targetContainer = ev.target.parentNode;
    } else {
        return; // Invalid drop target
    }

    // Remove the word from the source container
    const sourceContainer = document.getElementById(sourceId);
    const wordToRemove = Array.from(sourceContainer.children).find(el => el.textContent === data);
    if (wordToRemove) {
        sourceContainer.removeChild(wordToRemove);
    }

    // Add the word to the target container
    createWordElement(data, targetContainer);
}

function dropLevel2(ev) {
    ev.preventDefault();
    ev.target.classList.remove('drag-over');
    const data = ev.dataTransfer.getData("text");
    const sourceId = ev.dataTransfer.getData("sourceId");

    let targetContainer;
    if (ev.target.className.includes("match-tense") || ev.target.id === "tenses") {
        targetContainer = ev.target;
    } else {
        return; // Invalid drop target
    }

    // If dropping on a match-tense that already has a word, move that word back to tenses
    if (targetContainer.className.includes("match-tense") && targetContainer.children.length > 0) {
        const existingWord = targetContainer.children[0];
        document.getElementById("tenses").appendChild(existingWord);
    }

    // Remove the word from the source container
    const sourceContainer = document.getElementById(sourceId);
    const wordToRemove = Array.from(sourceContainer.children).find(el => el.textContent === data);
    if (wordToRemove) {
        sourceContainer.removeChild(wordToRemove);
    }

    // Add the word to the target container
    createWordElement(data, targetContainer);
}

function checkLevel1() {
    const sentenceContainer = document.getElementById("sentence");
    const userSentence = Array.from(sentenceContainer.children).map(word => word.textContent).join(" ");
    const isCorrect = userSentence === level1Data.sentence;
    showResult(isCorrect);
    if (isCorrect) completedLevels[0] = true;
}

function checkLevel2() {
    const matchTenses = document.querySelectorAll(".match-tense");
    let isCorrect = true;

    matchTenses.forEach((matchTense, index) => {
        if (matchTense.children.length === 0 || matchTense.children[0].textContent !== level2Data[index].tense) {
            isCorrect = false;
        }
    });

    showResult(isCorrect);
    if (isCorrect) completedLevels[1] = true;
}

let selectedSynonym = null;

function selectSynonym(synonym) {
    const synonyms = document.querySelectorAll(".synonym");
    synonyms.forEach(s => s.classList.remove("selected"));
    event.target.classList.add("selected");
    selectedSynonym = synonym;
}

function checkLevel3() {
    const isCorrect = selectedSynonym === level3Data.correctSynonym;
    showResult(isCorrect);
    if (isCorrect) completedLevels[2] = true;
}

function showResult(isCorrect) {
    const resultElement = document.getElementById("result");
    resultElement.textContent = isCorrect ? "Correct! Great job!" : "Incorrect. Try again!";
    resultElement.className = isCorrect ? "correct" : "incorrect";
    document.getElementById("nextLevel").style.display = isCorrect ? "inline-block" : "none";
}

function nextLevel() {
    if (currentLevel < levels) {
        currentLevel++;
        document.getElementById(`level${currentLevel - 1}`).style.display = "none";
        document.getElementById(`level${currentLevel}`).style.display = "block";
        document.getElementById("result").textContent = "";
        document.getElementById("nextLevel").style.display = "none";

        if (currentLevel === 2) {
            startLevel2();
        } else if (currentLevel === 3) {
            startLevel3();
        }
    } else {
        showCongratulations();
    }
}

function showCongratulations() {
    document.querySelectorAll('.level').forEach(level => level.style.display = 'none');
    document.getElementById('congratulations').style.display = 'block';
    document.getElementById('nextLevel').style.display = 'none';
    
    // Add trophy and stars
    document.getElementById('trophy').innerHTML = '🏆';
    const starsContainer = document.getElementById('stars');
    starsContainer.innerHTML = '⭐'.repeat(5);

    // Trigger confetti effect
    createConfetti();
}

function playAgain() {
    currentLevel = 1;
    completedLevels = [false, false, false];
    document.getElementById('congratulations').style.display = 'none';
    document.getElementById('homepage').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';
    stopConfetti();
}

let confettiAnimation;

function createConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiCount = 200;
    const confettiColors = ['#0056b3', '#00a0e9', '#7fdbff', '#39cccc'];
    const confetti = [];

    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 4 + 1,
            d: Math.random() * confettiCount,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncrement: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < confettiCount; i++) {
            const c = confetti[i];
            ctx.beginPath();
            ctx.lineWidth = c.r / 2;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + c.r, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
            ctx.stroke();
        }

        update();

        confettiAnimation = requestAnimationFrame(draw);
    }

    function update() {
        for (let i = 0; i < confettiCount; i++) {
            const c = confetti[i];
            c.tiltAngle += c.tiltAngleIncrement;
            c.y += (Math.cos(c.d) + 1 + c.r / 2) / 2;
            c.x += Math.sin(c.d) * 2;
            c.tilt = Math.sin(c.tiltAngle) * 15;

            if (c.y > canvas.height) {
                confetti[i] = {
                    x: Math.random() * canvas.width,
                    y: 0,
                    r: c.r,
                    d: c.d,
                    color: c.color,
                    tilt: Math.floor(Math.random() * 10) - 10,
                    tiltAngle: c.tiltAngle,
                    tiltAngleIncrement: c.tiltAngleIncrement
                };
            }
        }
    }

    draw();
}

function stopConfetti() {
    if (confettiAnimation) {
        cancelAnimationFrame(confettiAnimation);
    }
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popup.style.display = 'block';
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}

window.onload = function() {
    document.getElementById("homepage").style.display = "block";
    document.getElementById("game-container").style.display = "none";
};