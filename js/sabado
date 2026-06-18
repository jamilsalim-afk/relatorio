// ======================================================
// 🔥 OBTÉM APENAS SÁBADOS COM AULAS
// ======================================================
function obterSabadosSemana() {

    const modalidade =
        document.getElementById("selectModalidadeSabados")?.value ||
        "INTEGRADO";

    const baseSemanas =
        modalidade === "SUPERIOR"
            ? semanasSuperior
            : semanasIntegrado;

    const resultado = {};

    Object.keys(baseSemanas).forEach(semana => {

        const dias =
            baseSemanas[semana]?.dias || {};

        Object.keys(dias).forEach(dia => {

            const [d,m,a] = dia.split('/');

            const dataObj =
                new Date(a,m-1,d);

            // Apenas sábado
            if(dataObj.getDay() !== 6)
                return;

            const linhas = dias[dia];

            const possuiAula = linhas.some(r => {

                return r.slice(2).some(celula => {

                    const val =
                        normalizarTexto(celula || "");

                    if(!val)
                        return false;

                    if(
                        val.includes("INTERVALO") ||
                        val.includes("[+]") ||
                        val.includes("[R]") ||
                        val === "*"
                    ){
                        return false;
                    }

                    return true;

                });

            });

            if(possuiAula){
                resultado[dia] = linhas;
            }

        });

    });

    return resultado;
}

  // ======================================================
// 🔥 ABREVIAR TURMA
// ======================================================
function abreviarTurma(nome) {

  return nome

    .replaceAll("1 SEMESTRE", "1º")
    .replaceAll("2 SEMESTRE", "2º")
    .replaceAll("3 SEMESTRE", "3º")
    .replaceAll("4 SEMESTRE", "4º")
    .replaceAll("5 SEMESTRE", "5º")
    .replaceAll("6 SEMESTRE", "6º")
    .replaceAll("7 SEMESTRE", "7º")
    .replaceAll("8 SEMESTRE", "8º")
    .replaceAll("9 SEMESTRE", "9º")
    .replaceAll("10 SEMESTRE", "10º")

    .replaceAll("AGROECOLOGIA", "AGROEC.")
    .replaceAll("AGROPECUÁRIA", "AGROP.")
    .replaceAll("AGROPECUARIA", "AGROP.")
    .replaceAll("INFORMÁTICA", "INFO")
    .replaceAll("INFORMATICA", "INFO")

    .replaceAll("GEOGRAFIA", "GEO.")
    .replaceAll("MATEMÁTICA", "MAT.")
    .replaceAll("MATEMATICA", "MAT.")
    .replaceAll("AGRONEGÓCIO", "AGRONEG.")
    .replaceAll("AGRONEGOCIO", "AGRONEG.")
    .replaceAll("ZOOTECNIA", "ZOO.")
    .replaceAll("AGRONOMIA", "AGRON.")

    .replaceAll("MATUTINO", "MAT.")
    .replaceAll("VESPERTINO", "VESP.")
    .replaceAll("NOTURNO", "NOT.")

    .replaceAll("INTEGRADO", "INT.")
    .replaceAll("SUPERIOR", "SUP.")

    .replace(/\s+/g, " ")
    .trim();
}

// ======================================================
// 🔥 RENDER ABA SÁBADOS
// ======================================================
function renderSabados() {

  const container = document.getElementById("containerSabados");

  if (!container) return;

  const busca =
    normalizarTexto(
      document.getElementById("searchSabados")?.value || ""
    );

  // 🔥 sincroniza modalidade principal
  const modalidade = document.getElementById("selectModalidadeSabados")?.value || "INTEGRADO";
  const sabados = obterSabadosSemana();
  const dadosReferencia = (modalidade === "SUPERIOR" ? dadosSuperior : dadosIntegrado);
  
  // 1. Obtém todas as turmas possíveis da modalidade
  const todasTurmas = (modalidade === "SUPERIOR" ? turmasSuperior : turmasIntegrado);

  // 2. 🔥 FILTRO: Mantém apenas turmas que possuem aulas nos sábados encontrados
  let turmasAtivas = todasTurmas.filter(turma => {
    const idx = dadosReferencia[0].indexOf(turma);
    // Verifica se, entre todos os sábados com aula, esta turma tem algum valor válido
    return Object.values(sabados).some(linhas => {
      return linhas.some(r => {
        const val = normalizarTexto(r[idx] || "");
        // Considera "aula" se houver valor e não for marcador de intervalo/extra
        return val !== "" && 
               !val.includes("INTERVALO") && 
               !val.includes("[+]") && 
               !val.includes("[R]") && 
               val !== "*";
      });
    });
  });


// ======================================================
// 🔥 FILTRO - OCULTAR COLUNAS SEM O PROFESSOR
// ======================================================

if (busca) {
  turmasAtivas = turmasAtivas.filter(turma => {
    // ALTERE PARA:
    const dadosReferencia = (modalidade === "SUPERIOR" ? dadosSuperior : dadosIntegrado);
    const idx = dadosReferencia[0].indexOf(turma);

    return Object.values(sabados).some(linhas => {
      return linhas.some(r => {
        const val = normalizarTexto(r[idx] || "");
        return val.includes(busca);
      });
    });
  });
}
  
  let html = "";

  const regrasDestaque = [
    { match: v => v.includes("RESERVA ENSINO"), classe: "reserva-ensino" },
    { match: v => v.includes("PPS/ATENDIMENTO"), classe: "pps" },
    { match: v => v.includes("ESTUDOS INDIVIDUAIS"), classe: "estudos" },
    { match: v => v.includes("REUNIAO DE SERVIDORES"), classe: "reuniao" },
    { match: v => v.includes("CAED") || v.includes("PRE-CONSELHO"), classe: "caed" },
    { match: v => v.includes("_REP -"), classe: "reposicao" }
  ];

  Object.keys(sabados).forEach(dia => {

    const linhasOriginais = sabados[dia];

    let linhas = linhasOriginais.filter(r => {

      if (!busca) return true;

      return r.some(c =>
        normalizarTexto(c).includes(busca)
      );

    });

    if (!linhas.length) return;

    html += `<table>`;

    html += `
      <tr class="day-divider">
        <td colspan="${turmasAtivas.length + 1}">
          SÁBADO LETIVO - ${dia}
        </td>
      </tr>
    `;

    html += `
      <tr>
        <th class="time-col">Horário</th>
    `;

    turmasAtivas.forEach(t => {

      html += `
        <th
          class="${getCursoInfo(t).cl}"
          title="${t}"
        >
          ${abreviarTurma(t)}
        </th>
      `;
    });

    html += `</tr>`;

    linhas.forEach(r => {

      const horario = r[1] || "";

      const isInt =
        horario.toUpperCase().includes("INTERVALO");

      html += `
        <tr class="${isInt ? 'intervalo' : ''}">
          <td class="time-col">${horario}</td>
      `;

      turmasAtivas.forEach(turma => {

        const dadosReferencia = (modalidade === "SUPERIOR" ? dadosSuperior : dadosIntegrado);
        const idx = dadosReferencia[0].indexOf(turma);

        let val = (r[idx] || "").trim();

        const valNorm = normalizarTexto(val);

        let classesExtras = [];

        const contemBusca =
          busca &&
          valNorm.includes(busca);

        regrasDestaque.forEach(regra => {

          if (regra.match(valNorm)) {
            classesExtras.push(regra.classe);
          }

        });

        if (
          val.includes("[+]") ||
          val.includes("*") ||
          val.includes("[R]") ||
          valNorm.includes("INTERVALO")
        ) {
          classesExtras.push("marcacao-extra");
        }

        // 🔥 mesmo efeito da aba horários
        if (busca) {

          if (contemBusca) {
            classesExtras.push("highlight");
          } else {
            classesExtras.push("opaco");
          }
        }

        html += `
          <td class="aula-cell ${getCursoInfo(turma).cl} ${classesExtras.join(" ")}">
            ${val}
          </td>
        `;
      });

      html += `</tr>`;

    });

    html += `</table><br>`;

  });

  if (!html) {

    html = `
      <div style="
        padding:20px;
        background:white;
        border-radius:10px;
        text-align:center;
        font-weight:600;
      ">
        Nenhum sábado letivo encontrado.
      </div>
    `;
  }

  container.innerHTML = html;
}

// ======================================================
// 🔥 EXPORTAR PDF SÁBADOS (PADRÃO HORÁRIOS)
// ======================================================
function exportarPDFSabados() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('l', 'mm', 'a4');

  const modalidade = document.getElementById("selectModalidadeSabados")?.value || "INTEGRADO";
  const sabados = obterSabadosSemana();
  
  // 🔥 Define a fonte de dados correta e as turmas ativas
  const dadosReferencia = (modalidade === "SUPERIOR" ? dadosSuperior : dadosIntegrado);
  const todasTurmas = (modalidade === "SUPERIOR" ? turmasSuperior : turmasIntegrado);
  
  // 🔥 Filtra apenas turmas com aula, igual ao que fizemos na tela
  const turmasAtivas = todasTurmas.filter(turma => {
    const idx = dadosReferencia[0].indexOf(turma);
    return Object.values(sabados).some(linhas => {
      return linhas.some(r => {
        const val = normalizarTexto(r[idx] || "");
        return val !== "" && !val.includes("INTERVALO") && !val.includes("[+]") && !val.includes("[R]") && val !== "*";
      });
    });
  });

  const nomes = ["DOMINGO","SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO"];

  /* 🔥 CORES PDF */
const coresPDF = {
    "reserva-ensino": [212,237,218],
    "pps": [11,61,145],
    "estudos": [255,229,180],
    "reuniao": [208,235,255],
    "caed": [255,243,205],
    "reposicao": [30,126,52],
    "marcacao-extra": [224,224,224]
};

/* 🔥 DETECÇÃO DE CLASSE */
function detectarClasse(valor){
    let valNorm = normalizarTexto(valor);

    if(valNorm.includes("RESERVA ENSINO")) return "reserva-ensino";
    if(valNorm.includes("PPS/ATENDIMENTO")) return "pps";
    if(valNorm.includes("ESTUDOS INDIVIDUAIS")) return "estudos";
    if(valNorm.includes("REUNIAO DE SERVIDORES")) return "reuniao";
    if(valNorm.includes("CAED") || valNorm.includes("PRE-CONSELHO")) return "caed";
    if(valNorm.includes("_REP -")) return "reposicao";

    if(
        valNorm.includes("[+]") ||
        valNorm.includes("*") ||
        valNorm.includes("[R]") ||
        valNorm.includes("INTERVALO")
    ){
        return "marcacao-extra";
    }

    return null;
}
  let pagina = 0;

  Object.keys(sabados).forEach(dia => {
    if (pagina > 0) pdf.addPage();
    pagina++;

    const linhas = sabados[dia];
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Cabeçalho
    pdf.setFontSize(9);
    pdf.text("INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO", pageWidth / 2, 8, { align: 'center' });
    pdf.text("CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE", pageWidth / 2, 12, { align: 'center' });
    pdf.text(`SÁBADOS LETIVOS - ${modalidade}`, pageWidth / 2, 16, { align: 'center' });

    const p = dia.split('/');
    const dObj = new Date(p[2], p[1] - 1, p[0]);
    pdf.setFontSize(14);
    pdf.setTextColor(46, 125, 50);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${nomes[dObj.getDay()]} - ${dia}`, pageWidth / 2, 24, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'normal');

    // Montagem do corpo da tabela
    const body = linhas.map(r => {
      const line = [r[1]];
      turmasAtivas.forEach(t => {
        // 🔥 Usa dadosReferencia em vez de dadosGlobais
        const idx = dadosReferencia[0].indexOf(t);
        line.push((r[idx] || "").trim());
      });
      return line;
    });

    pdf.autoTable({
      head: [['Horário', ...turmasAtivas]],
      body,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 4.5, halign: 'center', valign: 'middle', cellPadding: 1 },
      headStyles: { fillColor: [46, 125, 50], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 16 } },
      didParseCell: (data) => {
        const col = data.column.index;
        if (col > 0) {
          const curso = getCursoInfo(turmasAtivas[col - 1]);
          data.cell.styles.fillColor = curso.rgb;
        }
        // ... (resto da lógica de cores e marcações permanece igual)
        const txt = (data.cell.raw || "").toString();
        const classe = detectarClasse(txt);
        if (classe && coresPDF[classe]) {
          data.cell.styles.fillColor = coresPDF[classe];
        }
      }
    });
  });

  pdf.save(`SABADOS_${modalidade}.pdf`);
}

// ======================================================
// 🔥 TROCAR MODALIDADE SÁBADOS
// ======================================================
async function trocarModalidadeSabados() {

  // renderiza sábados
  renderSabados();
}
