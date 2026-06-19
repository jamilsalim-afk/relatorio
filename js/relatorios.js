let RELATORIO_ATUAL = {
  tipo: null,
  turma: null,
  disciplina: null
};

function inicializarRelatorio() {
  const tipo = document.getElementById("selectTipoRelatorio").value;

  RELATORIO_ATUAL.tipo = tipo;

  resetRelatorioUI();

  if (!tipo) return;

  mostrarEstrutura();

  if (tipo === "disciplina") {
    popularTurmas();
  }

  if (tipo === "turma") {
    popularTurmas();
  }

  if (tipo === "professor") {
    popularProfessores();
  }
}

function resetRelatorioUI() {
  document.getElementById("relatorioPlaceholder").style.display = "block";
  document.getElementById("relatorioContainer").style.display = "none";

  document.getElementById("selectTurmaRelatorio").style.display = "none";
  document.getElementById("selectDisciplinaRelatorio").style.display = "none";
}

function mostrarEstrutura() {
  document.getElementById("relatorioPlaceholder").style.display = "none";
  document.getElementById("relatorioContainer").style.display = "block";
}

/* =========================
   TURMAS
========================= */
function popularTurmas() {
  const select = document.getElementById("selectTurmaRelatorio");

  select.innerHTML = `<option value="">Selecione a turma</option>`;

  turmasDaPlanilha.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    select.appendChild(opt);
  });

  select.style.display = "block";
}

/* =========================
   DISCIPLINAS
========================= */
function carregarDisciplinas() {
  const turma = document.getElementById("selectTurmaRelatorio").value;

  RELATORIO_ATUAL.turma = turma;

  const select = document.getElementById("selectDisciplinaRelatorio");
  select.innerHTML = `<option value="">Selecione a disciplina</option>`;

  if (!turma) {
    select.style.display = "none";
    return;
  }

  const disciplinas = new Set();

  BASE_GERAL.forEach(a => {
    if (a.turma === turma && a.valor) {
      const disc = a.valor.split(" - ")[0];
      if (disc) disciplinas.add(disc.trim());
    }
  });

  [...disciplinas].sort().forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });

  select.style.display = "block";
}

/* =========================
   GERAR RELATÓRIO
========================= */
function gerarRelatorio() {

  const turma = document.getElementById("selectTurmaRelatorio").value;
  const disciplina = document.getElementById("selectDisciplinaRelatorio").value;

  RELATORIO_ATUAL.turma = turma;
  RELATORIO_ATUAL.disciplina = disciplina;

  if (!turma || !disciplina) return;

  const dados = BASE_GERAL.filter(a => {

    if (a.turma !== turma) return false;

    if (!a.valor) return false;

    return a.valor.startsWith(disciplina);
  });

  renderizarTabelaRelatorio(dados);
}

/* =========================
   RENDER TABELA
========================= */
function renderizarTabelaRelatorio(dados) {

  const tabela = document.getElementById("tabelaRelatorio");
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  thead.innerHTML = `
    <tr>
      <th>Dia</th>
      <th>Horário</th>
      <th>Professor</th>
      <th>Tipo</th>
    </tr>
  `;

  tbody.innerHTML = "";

  if (!dados.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;color:#999;">
          Nenhum registro encontrado
        </td>
      </tr>
    `;
    return;
  }

  dados.forEach(a => {

    const valor = a.valor || "";

    let professor = "";
    let tipo = "NORMAL";

    if (valor.includes(" - ")) {
      const partes = valor.split(" - ");
      professor = partes[1] || "";

      if (valor.includes("[+]")) tipo = "EXTRA";
      if (valor.includes("[REC]")) tipo = "RECUPERAÇÃO";
      if (valor.includes("[EX]")) tipo = "EXAME";
      if (valor.includes("[R]")) tipo = "REPOSIÇÃO";
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${a.data || ""}</td>
      <td>${a.horario || ""}</td>
      <td>${professor}</td>
      <td>${tipo}</td>
    `;

    tbody.appendChild(tr);
  });
}
