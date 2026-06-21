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
  Relatorio.professor = "";
  Relatorio.turma = "";
  Relatorio.disciplina = "";

  // 🔥 LIMPEZA TOTAL DA TELA
  const container = document.getElementById("relatorioContainer");
  const placeholder = document.getElementById("relatorioPlaceholder");

  container.style.display = "none";
  placeholder.style.display = "block";

  // limpa tabelas antigas
  const t1 = document.getElementById("tabelaRelatorioResumo");
  const t2 = document.getElementById("tabelaRelatorioDetalhado");

  if (t1) {
    t1.querySelector("thead").innerHTML = "";
    t1.querySelector("tbody").innerHTML = "";
  }

  if (t2) {
    t2.querySelector("thead").innerHTML = "";
    t2.querySelector("tbody").innerHTML = "";
  }

  esconderTodosSelects();

  if (!tipo) return;

  container.style.display = "block";
  placeholder.style.display = "none";

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

  // 🔥 sempre limpa tabelas antes de qualquer coisa
  limparTabelasRelatorio();

  if (Relatorio.tipo === "disciplina") {
    gerarRelatorioDisciplina();
    return;
  }

  if (Relatorio.tipo === "professor") {
    gerarRelatorioProfessor();
    return;
  }

  if (Relatorio.tipo === "turma") {
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
  if (!tabela) return;

  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  if (!thead || !tbody) return;

  const { meses, resumo } = resumoObj;
  const mesesKeys = Object.keys(meses);

  thead.innerHTML = `
    <tr style="font-size:14px; font-weight:bold;">
      ${mesesKeys.map(m => `<th style="border:1px solid #999;padding:6px;">${m}</th>`).join("")}
      <th>SÁB</th>
      <th>REC</th>
      <th>EX</th>
      <th>TOTAL</th>
    </tr>
  `;

  tbody.innerHTML = `
    <tr style="font-size:14px;">
      ${mesesKeys.map(m => `<td style="border:1px solid #999;padding:6px;">${meses[m].aulas}</td>`).join("")}
      <td style="border:1px solid #999;padding:6px;">${resumo.SAB}</td>
      <td style="border:1px solid #999;padding:6px;">${resumo.REC}</td>
      <td style="border:1px solid #999;padding:6px;">${resumo.EX}</td>
      <td style="border:1px solid #999;padding:6px;">${resumo.TOTAL}</td>
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
    obterDisciplinaRelatorio(a.valor) === Relatorio.disciplina &&
    a.valor && a.valor.trim() !== ""
  );

  const resumo = criarResumoMensal(dados);

  renderTabelaResumoRelatorio(resumo);
  renderTabelaDetalhadaRelatorio(dados);
}

function gerarRelatorioProfessor() {

  if (!Relatorio.professor) return;

  const profSelecionado = Relatorio.professor.toUpperCase().trim();

  const dados = BASE_GERAL.filter(a => {

    if (!a.valor) return false;

    const prof = obterProfessorRelatorio(a.valor);

    if (!prof) return false;

    return prof.toUpperCase().trim() === profSelecionado;
  });

  if (dados.length === 0) {
    console.warn("Nenhum dado encontrado para o professor:", Relatorio.professor);
    return;
  }

  const meses = obterMesesRelatorio(dados);

  const mapa = {};

  dados.forEach(a => {

    const disc = obterDisciplinaRelatorio(a.valor);
    const turma = a.turma;

    if (!disc || !turma) return;

    const tipo = classificarTipoRelatorio(a.valor);

    const [d, m, y] = a.data.split("/");
    const dt = new Date(y, m - 1, d);

    const mes = dt.toLocaleDateString("pt-BR", {
      month: "short",
    });

    const key = `${disc}|${turma}`;

    if (!mapa[key]) {
      mapa[key] = {
        disciplina: disc,
        turma: turma,
        meses: {},
        sab: 0,
        rec: 0,
        ex: 0,
        total: 0
      };
    }

    if (tipo === "RECUPERAÇÃO") {
      mapa[key].rec++;
      return;
    }

    if (tipo === "EXAME") {
      mapa[key].ex++;
      return;
    }

    mapa[key].meses[mes] = (mapa[key].meses[mes] || 0) + 1;
    mapa[key].total++;

    if (dt.getDay() === 6) mapa[key].sab++;
  });

  const linhas = Object.values(mapa);

  const tabela = document.getElementById("tabelaResumoRelatorio");
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  thead.innerHTML = `
  <tr>
    <th class="col-texto">Disciplina</th>
    <th class="col-texto">Turma</th>
    ${meses.map(m => `<th class="col-mes">${m}</th>`).join("")}
    <th class="col-mes">SÁB</th>
    <th class="col-mes">REC</th>
    <th class="col-mes">EX</th>
    <th class="col-mes">TOTAL</th>
  </tr>
`;

  tbody.innerHTML = "";

linhas.forEach(l => {

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td class="col-texto">${l.disciplina}</td>
    <td class="col-texto">${l.turma}</td>
    ${meses.map(m => `<td class="col-mes">${l.meses[m] || 0}</td>`).join("")}
    <td class="col-mes">${l.sab}</td>
    <td class="col-mes">${l.rec}</td>
    <td class="col-mes">${l.ex}</td>
    <td class="col-mes">${l.total}</td>
  `;

  tbody.appendChild(tr);
});
}

function gerarRelatorioTurma() {

  const dados = BASE_GERAL.filter(a =>
    a.turma === Relatorio.turma &&
    a.valor &&
    a.valor.includes(" - ")
  );

  const meses = obterMesesRelatorio(dados);

  const mapa = {};

  dados.forEach(a => {

    const disc = obterDisciplinaRelatorio(a.valor);
    const prof = obterProfessorRelatorio(a.valor);

    // 🔥 FILTRO ANTI-LINHA VAZIA (CORREÇÃO PRINCIPAL)
    if (!disc || !prof) return;

    const tipo = classificarTipoRelatorio(a.valor);

    const [d, m, y] = a.data.split("/");
    const dt = new Date(y, m - 1, d);

    const mes = dt.toLocaleDateString("pt-BR", {
      month: "short",
    });

    const key = `${disc}|${prof}`;

    if (!mapa[key]) {
      mapa[key] = {
        disciplina: disc,
        professor: prof,
        meses: {},
        sab: 0,
        rec: 0,
        ex: 0,
        total: 0
      };
    }

    if (tipo === "RECUPERAÇÃO") {
      mapa[key].rec++;
      return;
    }

    if (tipo === "EXAME") {
      mapa[key].ex++;
      return;
    }

    mapa[key].meses[mes] = (mapa[key].meses[mes] || 0) + 1;
    mapa[key].total++;

    if (dt.getDay() === 6) mapa[key].sab++;
  });

  const linhas = Object.values(mapa);

  const tabela = document.getElementById("tabelaResumoRelatorio");
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  thead.innerHTML = `
    <tr>
      <th class="col-texto">Disciplina</th>
<th class="col-texto">Professor</th>
${meses.map(m => `<th class="col-mes">${m}</th>`).join("")}
<th class="col-mes">SÁB</th>
<th class="col-mes">REC</th>
<th class="col-mes">EX</th>
<th class="col-mes">TOTAL</th>
    </tr>
  `;

  tbody.innerHTML = "";

  linhas.forEach(l => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
     <td class="col-texto">${l.disciplina}</td>
<td class="col-texto">${l.professor}</td>
${meses.map(m => `<td class="col-mes">${l.meses[m] || 0}</td>`).join("")}
<td class="col-mes">${l.sab}</td>
<td class="col-mes">${l.rec}</td>
<td class="col-mes">${l.ex}</td>
<td class="col-mes">${l.total}</td>
    `;

    tbody.appendChild(tr);
  });
}

function renderTabelaResumoRelatorio(resumoObj) {

  const tabela = document.getElementById("tabelaResumoRelatorio");

  if (!tabela) return; // 🔥 proteção contra null

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

  const todosMeses = new Set();

  linhas.forEach(l => {
    Object.keys(l.resumo.meses).forEach(m => todosMeses.add(m));
  });

  const meses = [...todosMeses];

  thead.innerHTML = `
    <tr>
      <th>Disciplina</th>
      <th>Professor</th>
      ${meses.map(m => `<th>${m}</th>`).join("")}
      <th>SÁB</th>
      <th>REC</th>
      <th>EX</th>
      <th>TOTAL</th>
    </tr>
  `;

  tbody.innerHTML = "";

  linhas.forEach(l => {

    const tr = document.createElement("tr");

    const mesesCells = meses.map(m =>
      `<td>${l.resumo.meses[m]?.aulas || 0}</td>`
    ).join("");

    tr.innerHTML = `
      <td>${l.disciplina}</td>
      <td>${l.professor}</td>
      ${mesesCells}
      <td>${l.resumo.sabados}</td>
      <td>${l.resumo.recuperacoes}</td>
      <td>${l.resumo.exames}</td>
      <td>${l.resumo.total}</td>
    `;

    tbody.appendChild(tr);
  });
}

function renderTabelaProfessor(linhas) {

  const tabela = document.getElementById("tabelaResumoRelatorio");

  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  const mesesSet = new Set();

  linhas.forEach(l => {
    Object.keys(l.resumo.meses).forEach(m => mesesSet.add(m));
  });

  const meses = [...mesesSet];

  thead.innerHTML = `
    <tr>
      <th>Disciplina</th>
      <th>Turma</th>
      ${meses.map(m => `<th>${m}</th>`).join("")}
      <th>SÁB</th>
      <th>REC</th>
      <th>EX</th>
      <th>TOTAL</th>
    </tr>
  `;

  tbody.innerHTML = "";

  linhas.forEach(l => {

    const tr = document.createElement("tr");

    const mesesCells = meses.map(m =>
      `<td>${l.resumo.meses[m]?.aulas || 0}</td>`
    ).join("");

    tr.innerHTML = `
      <td>${l.disciplina}</td>
      <td>${l.turma}</td>
      ${mesesCells}
      <td>${l.resumo.sabados}</td>
      <td>${l.resumo.recuperacoes}</td>
      <td>${l.resumo.exames}</td>
      <td>${l.resumo.total}</td>
    `;

    tbody.appendChild(tr);
  });
}

function limparTabelasRelatorio() {

  const ids = [
    "tabelaResumoRelatorio",
    "tabelaDetalhadaRelatorio"
  ];

  ids.forEach(id => {

    const tabela = document.getElementById(id);

    if (!tabela) return;

    const thead = tabela.querySelector("thead");
    const tbody = tabela.querySelector("tbody");

    if (thead) thead.innerHTML = "";
    if (tbody) tbody.innerHTML = "";
  });
}

function exportarRelatorioAcademicoPDF() {

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('l', 'mm', 'a4'); // 🔥 paisagem (melhor pra tabelas)
  const pageWidth = pdf.internal.pageSize.getWidth();

  const tipo = Relatorio.tipo;

  if (!tipo) return;

  const tabela = document.getElementById("tabelaResumoRelatorio");
  if (!tabela) return;

  const linhas = tabela.querySelectorAll("tbody tr");
  const headers = [...tabela.querySelectorAll("thead th")].map(th => th.innerText);

  // =====================================
  // CABEÇALHO
  // =====================================
  pdf.setFontSize(10);
  pdf.text(
    "INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO",
    pageWidth / 2, 10,
    { align: "center" }
  );

  pdf.text(
    "CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE",
    pageWidth / 2, 14,
    { align: "center" }
  );

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `RELATÓRIO - ${tipo.toUpperCase()}`,
    pageWidth / 2, 22,
    { align: "center" }
  );

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  if (Relatorio.professor)
    pdf.text(`Professor: ${Relatorio.professor}`, pageWidth / 2, 27, { align: "center" });

  if (Relatorio.turma)
    pdf.text(`Turma: ${Relatorio.turma}`, pageWidth / 2, 27, { align: "center" });

  if (Relatorio.disciplina)
    pdf.text(`Disciplina: ${Relatorio.disciplina}`, pageWidth / 2, 27, { align: "center" });

  // =====================================
  // BODY (TABELA)
  // =====================================
  const body = [];

  linhas.forEach(tr => {
    const cols = [...tr.querySelectorAll("td")].map(td =>
      td.innerText.replace(/\s+/g, " ").trim()
    );
    body.push(cols);
  });

  // =====================================
  // AUTO TABLE
  // =====================================
  pdf.autoTable({
    head: [headers],
    body,
    startY: 35,
    theme: "grid",

    styles: {
      fontSize: 6.5,
      cellPadding: 1.5,
      halign: "center",
      valign: "middle",
      overflow: "linebreak"
    },

    headStyles: {
      fillColor: [46, 125, 50],
      textColor: 255,
      fontStyle: "bold"
    },

    // =====================================
    // COLUNAS (REGRA IMPORTANTE)
    // =====================================
    didParseCell: (data) => {

      const colCount = headers.length;

      // primeiras colunas (texto)
      if (data.column.index === 0) {
        data.cell.styles.halign = "left";
        data.cell.styles.cellWidth = 45;
      }

      if (data.column.index === 1) {
        data.cell.styles.halign = "left";
        data.cell.styles.cellWidth = 45;
      }

      // últimos 4 (SÁB REC EX TOTAL)
      if (data.column.index >= colCount - 4) {
        data.cell.styles.cellWidth = 12;
      }

      // meses (meio)
      if (data.column.index > 1 && data.column.index < colCount - 4) {
        data.cell.styles.cellWidth = 14;
      }
    }
  });

  // =====================================
  // RODAPÉ
  // =====================================
  pdf.setFontSize(8);
  pdf.text(
    "IFRO - Campus Cacoal | Relatório Acadêmico",
    pageWidth / 2,
    200,
    { align: "center" }
  );

  const nomeArquivo =
    `RELATORIO_${tipo}_${new Date().getTime()}.pdf`;

  pdf.save(nomeArquivo);
}
