function extrairDisciplinaRelatorio(valor) {
  if (!valor) return "";

  if (!valor.includes(" - ")) return "";

  const partes = valor.split(" - ");

  const disciplina = partes[0]?.trim();
  const professor = partes[1]?.trim();

  // regra principal: só vale se tiver os dois lados
  if (!disciplina || !professor) return "";

  // bloqueios de lixo comum
  const bloqueados = [
    "INTERVALO",
    "REUNIÃO",
    "REUNIAO",
    "ALMOÇO",
    "ALMOCO",
    "EVENTO",
    "ATIVIDADE"
  ];

  if (bloqueados.includes(disciplina.toUpperCase())) return "";

  return disciplina;
}

const Relatorio = {
  tipo: "",
  professor: "",
  turma: "",
  disciplina: ""
};

function inicializarRelatorio() {
  const tipo = document.getElementById("selectTipoRelatorio").value;

  Relatorio.tipo = tipo;

  document.getElementById("relatorioPlaceholder").style.display = "none";
  document.getElementById("relatorioContainer").style.display = "block";

  esconderTodosSelects();

  if (!tipo) return;

  if (tipo === "professor") {
    document.getElementById("selectProfessorRelatorio").style.display = "block";
    carregarListaProfessoresRelatorio();
  }

  if (tipo === "turma") {
    document.getElementById("selectTurmaRelatorio").style.display = "block";
    carregarListaTurmasRelatorio();
  }

  if (tipo === "disciplina") {
    document.getElementById("selectTurmaRelatorio").style.display = "block";
    document.getElementById("selectDisciplinaRelatorio").style.display = "block";
    carregarListaTurmasRelatorio();
  }
}

function carregarListaProfessoresRelatorio() {
  const select = document.getElementById("selectProfessorRelatorio");

  select.innerHTML = '<option value="">Selecione o professor</option>';

  listaProfessores.forEach(p => {
    select.innerHTML += `<option value="${p}">${p}</option>`;
  });

  select.onchange = () => {
    Relatorio.professor = select.value;
    gerarRelatorio();
  };
}

function carregarListaTurmasRelatorio() {
  const select = document.getElementById("selectTurmaRelatorio");

  select.innerHTML = '<option value="">Selecione a turma</option>';

  Object.keys(INDEX_TURMA)
  .sort((a,b)=> a.localeCompare(b,'pt-BR'))
  .forEach(t => {
    select.innerHTML += `<option value="${t}">${t}</option>`;
  });

  select.onchange = () => {
    Relatorio.turma = select.value;

    if (Relatorio.tipo === "disciplina") {
      carregarDisciplinasRelatorio();
    } else {
      gerarRelatorio();
    }
  };
}

function carregarDisciplinasRelatorio() {
  const select = document.getElementById("selectDisciplinaRelatorio");

  select.innerHTML = '<option value="">Selecione a disciplina</option>';

  const set = new Set();

  BASE_GERAL.forEach(a => {
    if (a.turma === Relatorio.turma) {
      const disc = extrairDisciplinaRelatorio(a.valor);
      if (disc) set.add(disc.trim());
    }
  });

  [...set].sort().forEach(d => {
    select.innerHTML += `<option value="${d}">${d}</option>`;
  });

  select.onchange = () => {
    Relatorio.disciplina = select.value;
    gerarRelatorio();
  };
}

function gerarRelatorio() {
  let dados = [];

  if (Relatorio.tipo === "professor") {
    dados = BASE_GERAL.filter(a =>
      a.valor?.includes(Relatorio.professor)
    );
  }

  if (Relatorio.tipo === "turma") {
    dados = BASE_GERAL.filter(a =>
      a.turma === Relatorio.turma
    );
  }

  if (Relatorio.tipo === "disciplina") {
    dados = BASE_GERAL.filter(a =>
      a.turma === Relatorio.turma &&
      extrairDisciplinaRelatorio(a.valor) === Relatorio.disciplina
    );
  }

  renderTabelaRelatorioSimples(dados);
}

function renderTabelaRelatorioSimples(dados) {

  const tabela = document.getElementById("tabelaRelatorio");
  const tbody = tabela.querySelector("tbody");
  const thead = tabela.querySelector("thead");

  thead.innerHTML = `
    <tr>
      <th>Data</th>
      <th>Horário</th>
      <th>Disciplina</th>
      <th>Professor</th>
      <th>Turma</th>
    </tr>
  `;

  tbody.innerHTML = "";

  dados.forEach(a => {

    const disciplina = extrairDisciplinaRelatorio(a.valor);
const professor = (a.valor || "").split(" - ")[1] || "";

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${a.data}</td>
      <td>${a.horario}</td>
      <td>${disciplina || ""}</td>
      <td>${professor || ""}</td>
      <td>${a.turma}</td>
    `;

    tbody.appendChild(tr);
  });
}

function esconderTodosSelects() {
  document.getElementById("selectProfessorRelatorio").style.display = "none";
  document.getElementById("selectTurmaRelatorio").style.display = "none";
  document.getElementById("selectDisciplinaRelatorio").style.display = "none";
}
