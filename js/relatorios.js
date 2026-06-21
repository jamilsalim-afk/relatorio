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
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
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

  if (Relatorio.tipo === "disciplina") {

    if (!Relatorio.turma || !Relatorio.disciplina) return;

    gerarRelatorioDisciplina();
    return;
  }

  if (Relatorio.tipo === "professor") {

    if (!Relatorio.professor) return;

    gerarRelatorioProfessor();
    return;
  }

  if (Relatorio.tipo === "turma") {

    if (!Relatorio.turma) return;

    gerarRelatorioTurma();
    return;
  }
}

function criarResumoMensal(dados) {

  const meses = {};
  let sabados = 0;
  let recuperacoes = 0;
  let exames = 0;
  let total = 0;

  dados.forEach(a => {

    const tipo = classificarTipoRelatorio(a.valor);

    const [d, m, y] = a.data.split("/");
    const dt = new Date(y, m - 1, d);

    const mesKey = dt.toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric"
    });

    if (!meses[mesKey]) {
      meses[mesKey] = { aulas: 0, rec: 0, ex: 0 };
    }

    if (tipo === "RECUPERAÇÃO") {
      recuperacoes++;
      meses[mesKey].rec++;
      return;
    }

    if (tipo === "EXAME") {
      exames++;
      meses[mesKey].ex++;
      return;
    }

    meses[mesKey].aulas++;
    total++;

    if (dt.getDay() === 6) sabados++;
  });

  return {
    meses,
    sabados,
    recuperacoes,
    exames,
    total
  };
}

function formatarCelulaMes(info) {

  let texto =
    String(info.aulas);

  if (info.rec > 0) {

    texto +=
      ` (R${info.rec})`;

  }

  if (info.ex > 0) {

    texto +=
      ` (E${info.ex})`;

  }

  return texto;
}

function obterMesesRelatorio(dados) {

  const mapa = new Map();

  dados.forEach(a => {

    const [d,m,ano] =
      a.data.split("/");

    const data =
      new Date(
        ano,
        m - 1,
        d
      );

    const chave =
      data.toLocaleDateString(
        "pt-BR",
        {
          month: "short",
          year: "numeric"
        }
      );

    mapa.set(
      chave,
      data.getTime()
    );

  });

  return [...mapa.entries()]
    .sort(
      (a,b) => a[1] - b[1]
    )
    .map(
      item => item[0]
    );
}

function esconderTodosSelects() {
  document.getElementById("selectProfessorRelatorio").style.display = "none";
  document.getElementById("selectTurmaRelatorio").style.display = "none";
  document.getElementById("selectDisciplinaRelatorio").style.display = "none";
}

function classificarTipoRelatorio(valor) {

  if (!valor) return "NORMAL";

  const v = valor.toUpperCase();

  if (v.includes("[REC]")) return "RECUPERAÇÃO";
  if (v.includes("[EX]")) return "EXAME";
  if (v.includes("[+]")) return "EXTRA";
  if (v.includes("[R]") || v.includes("[REP]")) return "REPOSIÇÃO";

  return "NORMAL";
}

function obterProfessorRelatorio(valor) {

  if (!valor || !valor.includes(" - ")) return "";

  const partes = valor.split(" - ");

  const prof = partes[1] || "";

  return obterNomeCompletoProfessor(prof.trim());
}

function obterDisciplinaRelatorio(valor) {

  if (!valor || !valor.includes(" - ")) return "";

  const disciplina = valor.split(" - ")[0].trim();

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

function renderTabelaResumoDisciplina(resumoObj) {

  const tabela = document.getElementById("tabelaRelatorioResumo");
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  const { meses, resumo } = resumoObj;

  const mesesKeys = Object.keys(meses);

  thead.innerHTML = `
    <tr>
      ${mesesKeys.map(m => `<th>${m}</th>`).join("")}
      <th>SÁBADO</th>
      <th>REC</th>
      <th>EX</th>
      <th>TOTAL</th>
    </tr>
  `;

  tbody.innerHTML = `
    <tr>
      ${mesesKeys.map(m => `<td>${meses[m]}</td>`).join("")}
      <td>${resumo.SAB}</td>
      <td>${resumo.REC}</td>
      <td>${resumo.EX}</td>
      <td>${resumo.TOTAL}</td>
    </tr>
  `;
}

function renderTabelaDetalhadaDisciplina(dados) {

  const tabela = document.getElementById("tabelaRelatorioDetalhado");
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  thead.innerHTML = `
    <tr>
      <th>Data</th>
      <th>Horário</th>
      <th>Professor</th>
      <th>Tipo</th>
    </tr>
  `;

  tbody.innerHTML = "";

  dados.forEach(a => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${a.data}</td>
      <td>${a.horario}</td>
      <td>${obterProfessorRelatorio(a.valor)}</td>
      <td>${classificarTipoRelatorio(a.valor)}</td>
    `;

    tbody.appendChild(tr);
  });
}

function gerarRelatorioDisciplina() {

  const dados = BASE_GERAL.filter(a =>
    a.turma === Relatorio.turma &&
    obterDisciplinaRelatorio(a.valor) === Relatorio.disciplina
  );

  const resumo = criarResumoMensal(dados);

  renderTabelaResumoDisciplina(resumo);
  renderTabelaDetalhadaDisciplina(dados);
}

function gerarRelatorioProfessor() {

  const dados = BASE_GERAL.filter(a =>
    (a.valor || "").includes(Relatorio.professor)
  );

  const resumo = criarResumoMensal(dados);

  renderTabelaResumoRelatorio(resumo, dados, "professor");
}

function gerarRelatorioTurma() {

  const dados = BASE_GERAL.filter(a =>
    a.turma === Relatorio.turma
  );

  const mapa = new Map();

  dados.forEach(a => {

    const disciplina = obterDisciplinaRelatorio(a.valor);
    const professor = obterProfessorRelatorio(a.valor);

    const chave = `${disciplina}__${professor}`;

    if (!mapa.has(chave)) {
      mapa.set(chave, []);
    }

    mapa.get(chave).push(a);
  });

  const linhas = [];

  mapa.forEach((items, chave) => {

    const resumo = criarResumoMensal(items);

    const [disciplina, professor] = chave.split("__");

    linhas.push({
      disciplina,
      professor,
      resumo
    });
  });

  renderTabelaResumoTurma(linhas);
}

function renderTabelaResumoRelatorio(resumoObj) {

  const tabela = document.getElementById("tabelaResumoRelatorio");
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  const mesesKeys = Object.keys(resumoObj.meses);

  thead.innerHTML = `
    <tr>
      ${mesesKeys.map(m => `<th>${m}</th>`).join("")}
      <th>SÁB</th>
      <th>REC</th>
      <th>EX</th>
      <th>TOTAL</th>
    </tr>
  `;

  tbody.innerHTML = `
    <tr>
      ${mesesKeys.map(m => `<td>${resumoObj.meses[m].aulas}</td>`).join("")}
      <td>${resumoObj.sabados}</td>
      <td>${resumoObj.recuperacoes}</td>
      <td>${resumoObj.exames}</td>
      <td>${resumoObj.total}</td>
    </tr>
  `;
}

function renderTabelaDetalhadaRelatorio(dados) {

  const tabela = document.getElementById("tabelaDetalhadaRelatorio");
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  thead.innerHTML = `
    <tr>
      <th>Data</th>
      <th>Horário</th>
      <th>Professor</th>
      <th>Tipo</th>
    </tr>
  `;

  tbody.innerHTML = "";

  dados.forEach(a => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${a.data}</td>
      <td>${a.horario}</td>
      <td>${obterProfessorRelatorio(a.valor)}</td>
      <td>${classificarTipoRelatorio(a.valor)}</td>
    `;

    tbody.appendChild(tr);
  });
}

function renderTabelaResumoTurma(linhas) {

  const tabela = document.getElementById("tabelaResumoRelatorio");
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  thead.innerHTML = `
    <tr>
      <th>Disciplina</th>
      <th>Professor</th>
      <th>Meses</th>
      <th>SÁB</th>
      <th>REC</th>
      <th>EX</th>
      <th>TOTAL</th>
    </tr>
  `;

  tbody.innerHTML = "";

  linhas.forEach(l => {

    const mesesKeys = Object.keys(l.resumo.meses)
      .map(m => `${m}:${l.resumo.meses[m].aulas}`)
      .join(" | ");

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${l.disciplina}</td>
      <td>${l.professor}</td>
      <td>${mesesKeys}</td>
      <td>${l.resumo.sabados}</td>
      <td>${l.resumo.recuperacoes}</td>
      <td>${l.resumo.exames}</td>
      <td>${l.resumo.total}</td>
    `;

    tbody.appendChild(tr);
  });
}
