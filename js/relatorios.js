let RELATORIO_ATUAL = {
  tipo: "",
  turma: "",
  disciplina: "",
  professor: ""
};

function extrairProfessor(valor) {

  if (!valor) return "";
  if (!valor.includes(" - ")) return "";

  const partes = valor.split(" - ");

  const prof = partes[1] || "";

  // NÃO usa mais normalização global da aba professor
  return prof.trim();
}

function extrairDisciplina(valor) {
  if (!valor) return "";
  if (!valor.includes(" - ")) return "";
  return valor.split(" - ")[0].trim();
}

function obterMes(data){

  const [d,m,a] =
    data.split("/");

  const dt =
    new Date(a,m-1,d);

  return dt.toLocaleString(
    "pt-BR",
    {
      month:"long",
      year:"numeric"
    }
  );
}

function inicializarRelatorio() {

  const tipo = document.getElementById("selectTipoRelatorio").value;

  RELATORIO_ATUAL.tipo = tipo;

  resetUI();

  if (!tipo) return;

  document.getElementById("relatorioPlaceholder").style.display = "none";
  document.getElementById("relatorioContainer").style.display = "block";

  const turma = document.getElementById("selectTurmaRelatorio");
  const disciplina = document.getElementById("selectDisciplinaRelatorio");
  const professor = document.getElementById("selectProfessorRelatorio");

  turma.style.display = "none";
  disciplina.style.display = "none";
  professor.style.display = "none";

  if (tipo === "disciplina") {
    carregarTurmas();
    turma.style.display = "block";
    disciplina.style.display = "block";
  }

  if (tipo === "turma") {
    carregarTurmas();
    turma.style.display = "block";
  }

  if (tipo === "professor") {
    carregarProfessoresRelatorio();
    professor.style.display = "block";
  }
}

function resetUI() {

  document.getElementById(
    "selectTurmaRelatorio"
  ).style.display = "none";

  document.getElementById(
    "selectDisciplinaRelatorio"
  ).style.display = "none";

  document.getElementById(
    "selectProfessorRelatorio"
  ).style.display = "none";

  document.getElementById(
    "relatorioContainer"
  ).style.display = "none";
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

select.onchange = () => {
  if (RELATORIO_ATUAL.tipo === "turma") {
    RELATORIO_ATUAL.turma = select.value;
    gerarRelatorio();
    return;
  }

  if (RELATORIO_ATUAL.tipo === "disciplina") {
    RELATORIO_ATUAL.turma = select.value;
    carregarDisciplinas();
  }
};
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

select.onchange = gerarRelatorio;
}

/* =========================
   PROFESSORES
========================= */

function carregarProfessoresRelatorio() {

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

  // ❌ REMOVIDO: select.onchange = gerarRelatorio;

  select.onchange = () => {
    RELATORIO_ATUAL.professor = select.value;
  };
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

   if (valor.includes("[REC]")) {

  resumo.REC++;

} else if (valor.includes("[EX]")) {

  resumo.EX++;

} else {

  resumo.TOTAL++;

  if(
    normalizarDia(a.horario)
      .includes("SÁBADO")
  ){
    resumo.SAB++;
  }

}

meses[mes]++;
  });

  return { meses, resumo };
}

function renderTabelaMensal(dados){

  const tabela =
    document.getElementById(
      "tabelaResumoRelatorio"
    );

  const thead =
    tabela.querySelector("thead");

  const tbody =
    tabela.querySelector("tbody");

  const { meses, resumo } =
    montarMatrizMensal(dados);

  thead.innerHTML = `
    <tr>
      ${Object.keys(meses)
        .map(m => `<th>${m}</th>`)
        .join("")}
      <th>Sábado</th>
      <th>Rec</th>
      <th>Ex</th>
      <th>Total</th>
    </tr>
  `;

  tbody.innerHTML = `
    <tr>
      ${Object.values(meses)
        .map(v => `<td>${v}</td>`)
        .join("")}
      <td>${resumo.SAB}</td>
      <td>${resumo.REC}</td>
      <td>${resumo.EX}</td>
      <td>${resumo.TOTAL}</td>
    </tr>
  `;
}

function renderTabelaMensalPorTurma(dados){

  const tabela =
    document.getElementById(
      "tabelaResumoRelatorio"
    );

  const thead =
    tabela.querySelector("thead");

  const tbody =
    tabela.querySelector("tbody");

  const agrupado = {};

  dados.forEach(a => {

    const disciplina =
      extrairDisciplina(a.valor);

    const professor =
      extrairProfessor(a.valor);

    const chave =
      `${disciplina}|${professor}`;

    if(!agrupado[chave]){
      agrupado[chave] = [];
    }

    agrupado[chave].push(a);

  });

  const mesesSet = new Set();

  Object.values(agrupado).forEach(lista => {

    lista.forEach(a => {
      mesesSet.add(
        obterMes(a.data)
      );
    });

  });

  const meses =
    [...mesesSet];

  thead.innerHTML = `
    <tr>
      <th>Disciplina</th>
      <th>Professor</th>
      ${meses.map(m => `<th>${m}</th>`).join("")}
      <th>Sábado</th>
      <th>Rec</th>
      <th>Ex</th>
      <th>Total</th>
    </tr>
  `;

  tbody.innerHTML = "";

  Object.entries(agrupado).forEach(([chave, lista]) => {

    const [disciplina, professor] =
      chave.split("|");

    const matriz =
      montarMatrizMensal(lista);

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
      <td>${disciplina}</td>
      <td>${professor}</td>
      ${meses.map(m =>
        `<td>${matriz.meses[m] || 0}</td>`
      ).join("")}
      <td>${matriz.resumo.SAB}</td>
      <td>${matriz.resumo.REC}</td>
      <td>${matriz.resumo.EX}</td>
      <td>${matriz.resumo.TOTAL}</td>
    `;

    tbody.appendChild(tr);

  });

}

function renderTabelaMensalPorProfessor(dados){

  const tabela =
    document.getElementById(
      "tabelaResumoRelatorio"
    );

  const thead =
    tabela.querySelector("thead");

  const tbody =
    tabela.querySelector("tbody");

  const agrupado = {};

  dados.forEach(a => {

    const disciplina =
      extrairDisciplina(a.valor);

    const chave =
      `${disciplina}|${a.turma}`;

    if(!agrupado[chave]){
      agrupado[chave] = [];
    }

    agrupado[chave].push(a);

  });

  const mesesSet = new Set();

  Object.values(agrupado).forEach(lista => {

    lista.forEach(a => {
      mesesSet.add(
        obterMes(a.data)
      );
    });

  });

  const meses =
    [...mesesSet];

  thead.innerHTML = `
    <tr>
      <th>Disciplina</th>
      <th>Turma</th>
      ${meses.map(m => `<th>${m}</th>`).join("")}
      <th>Sábado</th>
      <th>Rec</th>
      <th>Ex</th>
      <th>Total</th>
    </tr>
  `;

  tbody.innerHTML = "";

  Object.entries(agrupado).forEach(([chave, lista]) => {

    const [disciplina, turma] =
      chave.split("|");

    const matriz =
      montarMatrizMensal(lista);

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
      <td>${disciplina}</td>
      <td>${turma}</td>
      ${meses.map(m =>
        `<td>${matriz.meses[m] || 0}</td>`
      ).join("")}
      <td>${matriz.resumo.SAB}</td>
      <td>${matriz.resumo.REC}</td>
      <td>${matriz.resumo.EX}</td>
      <td>${matriz.resumo.TOTAL}</td>
    `;

    tbody.appendChild(tr);

  });

}

function renderTabelaDetalhada(dados){

  const tabela =
    document.getElementById(
      "tabelaDetalhadaRelatorio"
    );

  const thead =
    tabela.querySelector("thead");

  const tbody =
    tabela.querySelector("tbody");

  thead.innerHTML = `
    <tr>
      <th>Dia</th>
      <th>Horário</th>
      <th>Professor</th>
      <th>Tipo</th>
    </tr>
  `;

  tbody.innerHTML = "";

  dados.forEach(a => {

    const tr =
      document.createElement("tr");

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

function exportarRelatorioAcademicoPDF(){

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF(
    "l",
    "mm",
    "a4"
  );

  pdf.setFontSize(14);

  pdf.text(
    "RELATÓRIO ACADÊMICO",
    148,
    10,
    { align:"center" }
  );

  const tabelaResumo =
    document.querySelector(
      "#tabelaResumoRelatorio"
    );

  const tabelaDetalhada =
    document.querySelector(
      "#tabelaDetalhadaRelatorio"
    );

  pdf.autoTable({
    html:tabelaResumo,
    startY:20,
    theme:"grid",
    styles:{
      fontSize:7
    }
  });

  const y =
    pdf.lastAutoTable.finalY + 10;

  pdf.autoTable({
    html:tabelaDetalhada,
    startY:y,
    theme:"grid",
    styles:{
      fontSize:7
    }
  });

  pdf.save(
    "RELATORIO_ACADEMICO.pdf"
  );
}
