let quizData = [];
let currentQuestion = 0;
let players = [];
let currentPlayerIndex = 0;
let timer;
let playerQuestions = {};

document.addEventListener('DOMContentLoaded', function () {
    M.Modal.init(document.querySelectorAll('.modal'));

    document.getElementById('settings-btn').addEventListener('click', () => {
        M.Modal.getInstance(document.getElementById('settings-modal')).open();
    });

    document.getElementById('save-settings').addEventListener('click', loadJSON);
    document.getElementById('start-btn').addEventListener('click', showPlayersScreen);
    document.getElementById('add-player-btn').addEventListener('click', addPlayer);
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    document.getElementById('play-again-btn').addEventListener('click', resetGame);
});

function loadJSON() {
    const fileInput = document.getElementById('json-file');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                processQuizData(jsonData);
                M.Modal.getInstance(document.getElementById('settings-modal')).close();
                M.toast({ html: 'Dados do quiz carregados com sucesso!', classes: 'rounded' });
            } catch (error) {
                M.toast({ html: 'Erro ao ler o arquivo JSON. Verifique o formato.', classes: 'rounded red' });
            }
        };
        reader.readAsText(file);
    } else {
        M.toast({ html: 'Por favor, selecione um arquivo JSON.', classes: 'rounded red' });
    }
}

function processQuizData(jsonData) {
    if (jsonData.quiz && Array.isArray(jsonData.quiz)) {
        quizData = jsonData.quiz.flatMap(serie =>
            serie.perguntas.map(pergunta => ({
                question: pergunta.pergunta,
                answers: pergunta.opcoes,
                correctAnswer: pergunta.opcoes[pergunta.resposta_correta],
                imageUrl: pergunta.url_imagem // Adicionando a chave url_imagem
            }))
        );
        console.log("Dados processados do quiz:", quizData);
    } else {
        M.toast({ html: 'Formato do arquivo JSON inválido.', classes: 'rounded red' });
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showPlayersScreen() {
    document.getElementById('start-screen').style.display = 'none';
    const playersScreen = document.getElementById('players-screen');
    playersScreen.style.display = 'block';
    playersScreen.classList.add('animate__animated', 'animate__fadeIn');
}

function addPlayer() {
    const playerName = document.getElementById('player-name').value.trim();
    if (playerName) {
        players.push({ name: playerName, score: 0 });
        updatePlayerList();
        document.getElementById('player-name').value = '';
        assignPlayerQuestions(playerName);
        M.toast({ html: `Jogador ${playerName} adicionado!`, classes: 'rounded' });
    }
}

function assignPlayerQuestions(playerName) {
    const shuffledQuestions = shuffleArray([...quizData]);
    shuffledQuestions.forEach(q => q.answers = shuffleArray([...q.answers]));
    playerQuestions[playerName] = shuffledQuestions;
}

function updatePlayerList() {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';
    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'collection-item animate__animated animate__fadeIn';
        li.innerHTML = `
            <span>${player.name}</span>
            <a href="#!" class="secondary-content" onclick="removePlayer(${index})">
                <i class="material-icons">delete</i>
            </a>
        `;
        playerList.appendChild(li);
    });
}

function removePlayer(index) {
    players.splice(index, 1);
    updatePlayerList();
    M.toast({ html: 'Jogador removido!', classes: 'rounded' });
}

function startQuiz() {
    if (players.length < 1) {
        M.toast({ html: 'Adicione pelo menos um jogador para começar!', classes: 'rounded red' });
        return;
    }
    if (quizData.length === 0) {
        M.toast({ html: 'Por favor, carregue os dados do JSON primeiro!', classes: 'rounded red' });
        return;
    }
    document.getElementById('players-screen').style.display = 'none';
    const quizScreen = document.getElementById('quiz-screen');
    quizScreen.style.display = 'block';
    quizScreen.classList.add('animate__animated', 'animate__fadeIn');
    currentQuestion = 0;
    currentPlayerIndex = 0;
    showQuestion();
}

function showQuestion() {
    const player = players[currentPlayerIndex];
    if (!player) {
        console.error("Erro: Jogador não encontrado!");
        return;
    }

    const questionData = playerQuestions[player.name]?.[currentQuestion];
    if (!questionData) {
        console.error("Erro: Pergunta não encontrada para o jogador", player.name);
        return;
    }

    const questionElement = document.getElementById('question');
    if (questionElement) {
        questionElement.textContent = `${player.name}, ${questionData.question}`;
        questionElement.classList.add('animate__animated', 'animate__fadeIn');
    }

    // Exibir a imagem se a URL não estiver vazia
    const questionImage = document.getElementById('question-image');
    if (questionImage) {
        if (questionData.imageUrl) {
            questionImage.src = questionData.imageUrl; // Define a URL da imagem
            questionImage.style.display = 'block'; // Exibe a imagem
        } else {
            questionImage.style.display = 'none'; // Oculta a imagem se não houver URL
        }
    }

    const answersContainer = document.getElementById('answers');
    if (answersContainer) {
        answersContainer.innerHTML = '';
        questionData.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'btn-large waves-effect waves-light deep-purple lighten-1 btn-answer col s12 m6 animate__animated animate__fadeIn';
            button.style.animationDelay = `${index * 0.1}s`;
            button.textContent = answer;
            button.onclick = () => checkAnswer(answer, player, questionData);
            answersContainer.appendChild(button);
        });
    }

    startTimer();
}


function startTimer() {
    let timeLeft = 10;
    const timerBar = document.getElementById('timer');
    if (timerBar) {
        timerBar.style.width = '100%';
        timerBar.style.backgroundColor = '#4CAF50';
    }

    timer = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / 10) * 100;
        if (timerBar) {
            timerBar.style.width = `${percentage}%`;

            if (timeLeft <= 3) {
                timerBar.style.backgroundColor = '#FF5252';
            }
        }

        if (timeLeft === 0) {
            clearInterval(timer);
            checkAnswer(null, players[currentPlayerIndex], playerQuestions[players[currentPlayerIndex].name]?.[currentQuestion]);
        }
    }, 1000);
}

function checkAnswer(answer, player, questionData) {

    clearInterval(timer);
    console.log(`questionData: ${questionData}`);
    const correctAnswer = questionData.correctAnswer;
    if (answer === correctAnswer) {
        player.score += 10;
        M.toast({ html: 'Resposta correta! +10 pontos', classes: 'rounded green' });
    } else {
        M.toast({ html: `Resposta incorreta. A resposta correta era: ${correctAnswer}`, classes: 'rounded red' });
    }

    currentPlayerIndex++;
    if (currentPlayerIndex >= players.length) {
        currentPlayerIndex = 0;
        currentQuestion++;
    }

    if (currentQuestion < quizData.length) {
        setTimeout(() => {
            const quizScreen = document.getElementById('quiz-screen');
            quizScreen.classList.remove('animate__fadeIn');
            quizScreen.classList.add('animate__fadeOut');
            setTimeout(() => {
                quizScreen.classList.remove('animate__fadeOut');
                quizScreen.classList.add('animate__fadeIn');
                showQuestion();
            }, 500);
        }, 1500);
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quiz-screen').style.display = 'none';
    const resultScreen = document.getElementById('result-screen');
    resultScreen.style.display = 'block';
    resultScreen.classList.add('animate__animated', 'animate__fadeIn');

    players.sort((a, b) => b.score - a.score);

    const rankingTable = document.getElementById('ranking');
    rankingTable.innerHTML = '';
    players.forEach((player, index) => {
        const row = rankingTable.insertRow();
        row.className = 'animate__animated animate__fadeIn';
        row.style.animationDelay = `${index * 0.1}s`;
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = player.name;
        row.insertCell(2).textContent = player.score;
    });
}

function resetGame() {
    players.forEach(player => player.score = 0);
    document.getElementById('result-screen').style.display = 'none';
    const startScreen = document.getElementById('start-screen');
    startScreen.style.display = 'block';
    startScreen.classList.add('animate__animated', 'animate__fadeIn');
}
