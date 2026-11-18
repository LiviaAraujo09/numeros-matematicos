
let score = 0;
let lives = 3;
let combo = 0;
let coins = 0;
let level = 1;
let round = 0;
let timeLeft = 15;
let timer = null;
let currentAnswer = 0;
let playing = false;
let locked = false;

let record = Number(localStorage.getItem("chaosRecord")) || 0;

const $ = id => document.getElementById(id);

$("record").textContent = record;

// Gera números aleatórios inteiros
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Embaralha as respostas
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Cria alternativas sem repetir a resposta
function makeOptions(answer) {
    let options = new Set([answer]);

    while (options.size < 4) {
        let variation = random(1, Math.max(5, level * 5 + 5));
        let wrong = answer + (Math.random() < 0.5 ? variation : -variation);

        if (wrong !== answer && wrong >= -9999) {
            options.add(wrong);
        }
    }

    return shuffle([...options]);
}

// Atualiza as informações
function updateHUD() {
    $("score").textContent = score;
    $("lives").textContent = "❤️".repeat(lives);
    $("combo").textContent = combo + "x";
    $("level").textContent = level;
    $("coins").textContent = coins;
    $("record").textContent = record;
    $("round").textContent = round;
}

// Inicia o jogo
function startGame() {
    score = 0;
    lives = 3;
    combo = 0;
    coins = 0;
    level = 1;
    round = 0;
    playing = true;
    locked = false;

    $("endScreen").classList.add("hidden");

    updateHUD();
    nextQuestion();
}

// Reinicia a partida
function restartGame() {
    clearInterval(timer);
    startGame();
}

// Sorteia um tipo de desafio
function generateQuestion() {
    const types = [
        arithmeticQuestion,
        sequenceQuestion,
        comparisonQuestion,
        mysteryQuestion,
        surpriseQuestion
    ];

    const chosen = random(0, types.length - 1);

    return types[chosen]();
}

// 1. Operações matemáticas
function arithmeticQuestion() {
    const operations = ["+", "-", "×", "÷"];
    const operation = operations[random(0, 3)];

    let a = random(2, 15 + level * 3);
    let b = random(2, 12 + level * 2);
    let answer;
    let expression;

    if (operation === "+") {
        answer = a + b;
        expression = `${a} + ${b} = ?`;
    }

    if (operation === "-") {
        if (b > a) [a, b] = [b, a];

        answer = a - b;
        expression = `${a} - ${b} = ?`;
    }

    if (operation === "×") {
        answer = a * b;
        expression = `${a} × ${b} = ?`;
    }

    if (operation === "÷") {
        answer = a;
        expression = `${a * b} ÷ ${b} = ?`;
    }

    return {
        category: "➕ OPERAÇÃO RELÂMPAGO",
        question: "Resolva a operação!",
        display: expression,
        answer
    };
}

// 2. Descubra o número que falta
function sequenceQuestion() {
    const start = random(1, 15 + level * 3);
    const step = random(2, 5 + level * 2);

    const sequence = [
        start,
        start + step,
        start + step * 2,
        start + step * 3,
        start + step * 4
    ];

    const answer = sequence.pop();

    return {
        category: "🔢 SEQUÊNCIA NUMÉRICA",
        question: "Qual número completa a sequência?",
        display: sequence.join("  →  ") + "  →  ?",
        answer
    };
}

// 3. Maior ou menor
function comparisonQuestion() {
    const a = random(10, 100 + level * 20);
    let b = random(10, 100 + level * 20);

    while (a === b) {
        b = random(10, 100 + level * 20);
    }

    const answer = Math.max(a, b);

    return {
        category: "🧠 MAIOR OU MENOR?",
        question: "Qual é o MAIOR número?",
        display: `${a}  OU  ${b}`,
        answer
    };
}

// 4. Número misterioso
function mysteryQuestion() {
    const x = random(2, 12 + level);
    const multiplier = random(2, 5);
    const addition = random(1, 10);

    const result = x * multiplier + addition;

    return {
        category: "🕵️ NÚMERO MISTERIOSO",
        question: "Descubra o valor de X!",
        display: `${multiplier} × X + ${addition} = ${result}`,
        instruction: `Qual número deve substituir o X?`,
        answer: x
    };
}

// 5. Desafio surpresa
function surpriseQuestion() {
    const a = random(2, 12 + level * 2);
    const b = random(2, 10 + level);
    const c = random(1, 10);

    const answer = a * b + c;

    return {
        category: "⚡ DESAFIO SURPRESA",
        question: "Resolva este desafio especial!",
        display: `(${a} × ${b}) + ${c} = ?`,
        answer
    };
}

// Exibe uma nova questão
function nextQuestion() {
    if (!playing) return;

    clearInterval(timer);

    locked = false;
    round++;

    const question = generateQuestion();

    currentAnswer = question.answer;

    $("category").textContent = question.category;
    $("question").textContent = question.question;

    $("instruction").textContent =
        question.instruction || "Escolha a alternativa correta!";

    $("numberBox").textContent = question.display;

    $("feedback").textContent = "🧠 Pense rápido!";

    const answers = makeOptions(currentAnswer);

    $("answers").innerHTML = "";

    answers.forEach(answer => {
        const button = document.createElement("button");

        button.textContent = answer;

        button.onclick = () => checkAnswer(answer, button);

        $("answers").appendChild(button);
    });

    updateHUD();
    startTimer();
}

// Cronômetro
function startTimer() {
    timeLeft = Math.max(6, 15 - Math.floor((level - 1) / 2));

    updateTimer();

    timer = setInterval(() => {
        timeLeft--;

        updateTimer();

        if (timeLeft <= 0) {
            clearInterval(timer);
            loseLife("⏰ Tempo esgotado!");
        }

    }, 1000);
}

function updateTimer() {
    $("timer").textContent = timeLeft;

    const percentage = (timeLeft / 15) * 100;

    $("timerFill").style.width = percentage + "%";

    if (timeLeft <= 5) {
        $("timerFill").style.background = "#ff3155";
        $("timer").style.color = "#ff3155";
    } else {
        $("timerFill").style.background =
            "linear-gradient(90deg, #00e5ff, #a855f7)";

        $("timer").style.color = "#00e5ff";
    }
}

// Verifica a resposta
function checkAnswer(answer, button) {
    if (!playing || locked) return;

    locked = true;
    clearInterval(timer);

    const buttons = $("answers").querySelectorAll("button");

    buttons.forEach(btn => {
        btn.disabled = true;

        if (Number(btn.textContent) === currentAnswer) {
            btn.classList.add("correct");
        }
    });

    if (Number(answer) === currentAnswer) {
        correctAnswer();
    } else {
        button.classList.add("wrong");
        loseLife("❌ Resposta incorreta!");
    }
}

// Acertou!
function correctAnswer() {
    combo++;

    const points = 100 + (combo * 20) + (level * 10);

    score += points;

    // Sorteio de bônus
    if (Math.random() < 0.30) {
        const bonus = random(1, 5);

        coins += bonus;

        $("feedback").textContent =
            `🎉 CORRETO! +${points} pontos e bônus de ${bonus} moedas!`;
    } else {
        $("feedback").textContent =
            `🔥 INCRÍVEL! +${points} pontos! Combo ${combo}x`;
    }

    // Sobe de nível a cada 5 acertos
    if (round % 5 === 0) {
        level++;

        $("feedback").textContent =
            `🚀 NOVO NÍVEL! Agora você está no nível ${level}!`;
    }

    saveRecord();
    updateHUD();

    setTimeout(() => {
        if (playing) nextQuestion();
    }, 1100);
}

// Errou ou acabou o tempo
function loseLife(reason) {
    if (!playing || locked && timeLeft > 0) {
        // Permite processar o erro já bloqueado pela seleção.
        if (!locked) return;
    }

    locked = true;
    clearInterval(timer);

    lives--;
    combo = 0;

    $("feedback").textContent =
        `${reason} A resposta era ${currentAnswer}.`;

    const buttons = $("answers").querySelectorAll("button");

    buttons.forEach(btn => {
        btn.disabled = true;

        if (Number(btn.textContent) === currentAnswer) {
            btn.classList.add("correct");
        }
    });

    updateHUD();

    if (lives <= 0) {
        setTimeout(endGame, 1300);
    } else {
        setTimeout(() => {
            if (playing) nextQuestion();
        }, 1500);
    }
}

// Salva o recorde
function saveRecord() {
    if (score > record) {
        record = score;

        localStorage.setItem("chaosRecord", record);

        $("record").textContent = record;
    }
}

// Fim da partida
function endGame() {
    playing = false;
    clearInterval(timer);

    $("endIcon").textContent = "💥";
    $("endTitle").textContent = "FIM DE JOGO!";
    $("endText").textContent =
        "Você foi derrotado pelos desafios numéricos!";

    $("finalScore").textContent = score;
    $("finalCoins").textContent = coins;

    $("endScreen").classList.remove("hidden");
}

// Inicialização
updateHUD();
