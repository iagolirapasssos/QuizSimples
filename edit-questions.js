// Adiciona o evento de clique para o botão de edição de questões
document.getElementById('edit-questions-btn').addEventListener('click', showEditQuestionsScreen);

// Função para exibir a tela de edição de questões
function showEditQuestionsScreen() {
    document.getElementById('start-screen').style.display = 'none'; // Oculta a tela inicial
    document.getElementById('edit-questions-screen').style.display = 'block'; // Mostra a tela de edição
    document.getElementById('question-inputs').innerHTML = ''; // Limpa os campos existentes
}

// Adiciona evento para o botão de adicionar questão
document.getElementById('add-question-btn').addEventListener('click', addQuestionInput);

// Função para adicionar campos de entrada de questão
function addQuestionInput() {
    const questionInputsDiv = document.getElementById('question-inputs');
    const inputDiv = document.createElement('div');
    inputDiv.className = 'question-input animate__animated animate__fadeIn';

    inputDiv.innerHTML = `
        <input type="text" placeholder="Pergunta" class="question-text" required>
        <input type="text" placeholder="Resposta Correta" class="correct-answer" required>
        <input type="text" placeholder="Opção 1" class="answer-option" required>
        <input type="text" placeholder="Opção 2" class="answer-option" required>
        <input type="text" placeholder="Opção 3" class="answer-option" required>
        <input type="text" placeholder="Opção 4" class="answer-option" required>
        <input type="text" placeholder="URL da Imagem (opcional)" class="image-url">
        <button class="btn red waves-effect waves-light remove-question-btn">Remover</button>
    `;

    questionInputsDiv.appendChild(inputDiv);

    // Adiciona funcionalidade para remover a questão
    inputDiv.querySelector('.remove-question-btn').addEventListener('click', () => {
        questionInputsDiv.removeChild(inputDiv);
    });
}

// Adiciona evento para o botão de salvar questões
document.getElementById('save-questions-btn').addEventListener('click', saveQuestionsAsJSON);

// Função para salvar questões em JSON
function saveQuestionsAsJSON() {
    const questions = [];
    const questionInputs = document.querySelectorAll('.question-input');

    questionInputs.forEach(inputDiv => {
        const questionText = inputDiv.querySelector('.question-text').value;
        const correctAnswer = inputDiv.querySelector('.correct-answer').value;
        const answerOptions = Array.from(inputDiv.querySelectorAll('.answer-option')).map(option => option.value);
        const imageUrl = inputDiv.querySelector('.image-url').value;

        if (questionText && correctAnswer && answerOptions.length) {
            questions.push({
                pergunta: questionText,
                resposta_correta: answerOptions.indexOf(correctAnswer),
                opcoes: answerOptions,
                url_imagem: imageUrl
            });
        }
    });

    const jsonContent = JSON.stringify({ quiz: [{ perguntas: questions }] }, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.json';
    a.click();
    URL.revokeObjectURL(url);

    M.toast({ html: 'Questões salvas em JSON com sucesso!', classes: 'rounded' });
}

