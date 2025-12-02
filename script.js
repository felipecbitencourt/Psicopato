const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const temaSelect = document.getElementById("temaSelect");
const dificuldadeSelect = document.getElementById("dificuldadeSelect");

const menu = document.getElementById("menu");
const quiz = document.getElementById("quiz");
const resultado = document.getElementById("resultado");

const numQuestoes = document.getElementById("numQuestoes");
const tempoQuestao = document.getElementById("tempoQuestao");

const questaoAtual = document.getElementById("questaoAtual");
const totalQuestoes = document.getElementById("totalQuestoes");
const pontosSpan = document.getElementById("pontosSpan");
const timer = document.getElementById("timer");

const questionContainer = document.getElementById("questionContainer");
const optionsContainer = document.getElementById("optionsContainer");
const explicacaoBox = document.getElementById("explicacaoBox");

const progressBar = document.getElementById("progressBar");

const finalPontos = document.getElementById("finalPontos");
const desempenho = document.getElementById("desempenho");

const erroCarregamento = document.getElementById("erroCarregamento");

let quizData = [];
let currentQuestion = 0;
let pontos = 0;
let questionTimer;

startBtn.addEventListener("click", iniciarQuiz);
nextBtn.addEventListener("click", proximaQuestao);
restartBtn.addEventListener("click", () => location.reload());

async function iniciarQuiz() {
  erroCarregamento.textContent = "";

  const tema = temaSelect.value;
  const dificuldade = dificuldadeSelect.value;
  const num = parseInt(numQuestoes.value);

  try {
    const res = await fetch(tema);
    if (!res.ok) throw new Error("Arquivo JSON não encontrado!");

    const data = await res.json();

    quizData = data.questoes.filter(q =>
      dificuldade === "todos" || q.categoria === dificuldade
    );

    quizData = quizData.sort(() => Math.random() - 0.5).slice(0, num);

    totalQuestoes.textContent = quizData.length;
    currentQuestion = 0;
    pontos = 0;

    menu.classList.add("hidden");
    quiz.classList.remove("hidden");

    mostrarQuestao();
  } catch (err) {
    erroCarregamento.textContent = "❌ Erro ao carregar os arquivos.";
    console.error(err);
  }
}

function mostrarQuestao() {
  const q = quizData[currentQuestion];

  questaoAtual.textContent = currentQuestion + 1;
  pontosSpan.textContent = pontos;

  progressBar.style.width =
    ((currentQuestion) / quizData.length) * 100 + "%";

  questionContainer.innerHTML = q.enunciado;
  optionsContainer.innerHTML = "";
  explicacaoBox.innerHTML = "";
  nextBtn.classList.add("hidden");

  for (let key in q.alternativas) {
    const btn = document.createElement("button");
    btn.textContent = key + ") " + q.alternativas[key];
    btn.onclick = () => checarResposta(key, btn);
    optionsContainer.appendChild(btn);
  }

  iniciarTimer();
}

function iniciarTimer() {
  const tempo = parseInt(tempoQuestao.value);
  if (!tempo) {
    timer.textContent = "";
    return;
  }

  let t = tempo;
  timer.textContent = `⏳ ${t}s`;

  clearInterval(questionTimer);
  questionTimer = setInterval(() => {
    t--;
    timer.textContent = `⏳ ${t}s`;

    if (t === 0) {
      clearInterval(questionTimer);
      proximaQuestao();
    }
  }, 1000);
}

function checarResposta(resposta, btn) {
  clearInterval(questionTimer);

  const q = quizData[currentQuestion];
  const correta = q.resposta;

  if (resposta === correta) {
    pontos += 10;
    btn.classList.add("certo");
    explicacaoBox.innerHTML = `
      ✅ <strong>Correto!</strong><br>
      <strong>Resposta:</strong> ${correta} - ${q.alternativas[correta]}<br>
      <strong>Explicação:</strong> ${q.explicacao}
    `;
  } else {
    btn.classList.add("errado");
    explicacaoBox.innerHTML = `
      ❌ <strong>Incorreto.</strong><br>
      <strong>Resposta correta:</strong> ${correta} - ${q.alternativas[correta]}<br>
      <strong>Explicação:</strong> ${q.explicacao}
    `;
  }

  document
    .querySelectorAll("#optionsContainer button")
    .forEach(b => b.disabled = true);

  nextBtn.classList.remove("hidden");
}

function proximaQuestao() {
  currentQuestion++;

  if (currentQuestion >= quizData.length) {
    finalizarQuiz();
  } else {
    mostrarQuestao();
  }
}

function finalizarQuiz() {
  quiz.classList.add("hidden");
  resultado.classList.remove("hidden");

  finalPontos.textContent = pontos;
  desempenho.textContent =
    Math.round((pontos / (quizData.length * 10)) * 100);
}
