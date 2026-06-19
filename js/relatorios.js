let RELATORIO_ATUAL = {
  tipo: "",
  turma: "",
  disciplina: "",
  professor: ""
};

function extrairProfessor(valor) {
  if (!valor) return "";
  if (!valor.includes(" - ")) return "";

  const prof = valor.split(" - ")[1] || "";
  return obterNomeCompletoProfessor(prof.trim());
}

function extrairDisciplina(valor) {
  if (!valor) return "";
  if (!valor.includes(" - ")) return "";
  return valor.split(" - ")[0].trim();
}

function obterMes(data) {
  const [d, m, a] = data.split("/");
  const dt = new Date(a, m - 1, d);
  return dt.toLocaleString("pt-BR", { month: "long" });
}

function inicializarRelatorio() {

  const tipo = document.getElementById("selectTipoRelatorio").value;

  RELATORIO_ATUAL.tipo = tipo;

  resetUI();

  if (!tipo) return;

  document.getElementById("relatorioPlaceholder").style.display = "none";
  document.getElementById("relatorioContainer").style.display = "block";

  if (tipo === "disciplina") {
    carregarTurmas();
  }

  if (tipo === "turma") {
    carregarTurmas();
  }

  if (tipo === "professor") {
    carregarProfessores();
  }
}

function resetUI() {
  document.getElementById("relatorioPlaceholder").style.display = "block";
  document.getElementById("relatorioContainer").style.display = "none";

  document.getElementById("selectTurmaRelatorio").style.display = "none";
  document.getElementById("selectDisciplinaRelatorio").style.display = "none";
  document.getElementById("selectProfessorRelatorio").style.display = "none";
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

function carregarTurmas() {
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

  const set = new Set();

  BASE_GERAL.forEach(a => {
    if (a.turma === turma && a.valor) {
      set.add(extrairDisciplina(a.valor));
    }
  });

  [...set].sort().forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });

  select.style.display = "block";
}

/* =========================
   PROFESSORES
========================= */

function carregarProfessores() {

  const select = document.getElementById("selectProfessorRelatorio");

  select.innerHTML = `<option value="">Selecione o professor</option>`;

  const set = new Set();

  BASE_GERAL.forEach(a => {
    if (a.valor) {
      const prof = extrairProfessor(a.valor);
      if (prof) set.add(prof);
    }
  });

  [...set].sort().forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });

  select.style.display = "block";
}

/* =========================
   GERAR RELATÓRIO
========================= */
function gerarRelatorio() {

  const tipo = RELATORIO_ATUAL.tipo;

  if (tipo === "disciplina") gerarDisciplina();
  if (tipo === "turma") gerarTurma();
  if (tipo === "professor") gerarProfessor();
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

function gerarDisciplina() {

  const turma = document.getElementById("selectTurmaRelatorio").value;
  const disciplina = document.getElementById("selectDisciplinaRelatorio").value;

  if (!turma || !disciplina) return;

  const dados = BASE_GERAL.filter(a =>
    a.turma === turma &&
    extrairDisciplina(a.valor) === disciplina
  );

  renderTabelaMensal(dados, ["Dia", "Horário", "Professor", "Tipo"]);

  renderTabelaDetalhada(dados);
}

function gerarTurma() {

  const turma = document.getElementById("selectTurmaRelatorio").value;

  if (!turma) return;

  const dados = BASE_GERAL.filter(a => a.turma === turma);

  renderTabelaMensalPorTurma(dados);

  renderTabelaDetalhada(dados);
}

function gerarProfessor() {

  const prof = document.getElementById("selectProfessorRelatorio").value;

  if (!prof) return;

  const dados = BASE_GERAL.filter(a =>
    extrairProfessor(a.valor) === prof
  );

  renderTabelaMensalPorProfessor(dados);

  renderTabelaDetalhada(dados);
}

function montarMatrizMensal(dados) {

  const meses = {};
  const resumo = {
    SAB: 0,
    REC: 0,
    EX: 0,
    TOTAL: 0
  };

  dados.forEach(a => {

    const mes = obterMes(a.data);
    const valor = a.valor || "";

    if (!meses[mes]) {
      meses[mes] = 0;
    }

    if (valor.includes("[REC]")) resumo.REC++;
    else if (valor.includes("[EX]")) resumo.EX++;
    else if (valor.includes("SÁB") || a.horario?.includes("SÁB")) resumo.SAB++;
    else resumo.TOTAL++;

    meses[mes]++;
  });

  return { meses, resumo };
}

function renderTabelaMensal(dados) {

  const { meses, resumo } = montarMatrizMensal(dados);

  const container = document.getElementById("tabelaRelatorio");

  let html = `
  <tr>
    <th>Mês</th>
    ${Object.keys(meses).map(m => `<th>${m}</th>`).join("")}
    <th>Sabado</th>
    <th>Rec</th>
    <th>Ex</th>
    <th>Total</th>
  </tr>
  <tr>
    <td>Qtd</td>
    ${Object.values(meses).map(v => `<td>${v}</td>`).join("")}
    <td>${resumo.SAB}</td>
    <td>${resumo.REC}</td>
    <td>${resumo.EX}</td>
    <td>${resumo.TOTAL}</td>
  </tr>`;

  container.querySelector("thead").innerHTML = html;
}

function renderTabelaDetalhada(dados) {

  const tbody = document.querySelector("#tabelaRelatorio tbody");

  tbody.innerHTML = "";

  dados.forEach(a => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${a.data}</td>
      <td>${a.horario}</td>
      <td>${extrairProfessor(a.valor)}</td>
      <td>${classificarTipo(a.valor)}</td>
    `;

    tbody.appendChild(tr);
  });
}

function classificarTipo(v) {

  if (v.includes("[REC]")) return "REC";
  if (v.includes("[EX]")) return "EX";
  if (v.includes("[+]")) return "EXTRA";
  if (v.includes("[R]")) return "REPOSIÇÃO";

  return "NORMAL";
}
