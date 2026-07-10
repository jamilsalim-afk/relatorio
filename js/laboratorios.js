// ======================================================
// MÓDULO DE LABORATÓRIOS
// ======================================================

let mapaLaboratorios = {};

function inicializarLaboratorios() {

    preencherSelectLaboratorios();

    preencherSemanasLaboratorios();

    console.log("Mapa de Laboratórios:", mapaLaboratorios);

}

function extrairNomeLaboratorio(texto) {

    if (!texto) return null;

    const match = texto.match(/_Lab\s*([^-]+)/i);

    if (!match) return null;

    return "Lab " + match[1].trim();

}

function normalizarDisciplinaLab(texto) {

    if (!texto) return "";

    return texto.replace(/_Lab\s*.*$/i, "").trim();

}

function adicionarRegistroLaboratorio(registro) {

    const laboratorio = extrairNomeLaboratorio(registro.valor);

    if (!laboratorio) return;

    if (!mapaLaboratorios[laboratorio]) {
        mapaLaboratorios[laboratorio] = [];
    }

    // Evita duplicidade do mesmo registro
    const existe = mapaLaboratorios[laboratorio].some(r =>

        r.data === registro.data &&
        r.horario === registro.horario &&
        r.turma === registro.turma &&
        r.valor === registro.valor &&
        r.modalidade === registro.modalidade

    );

    if (!existe) {
        mapaLaboratorios[laboratorio].push(registro);
    }

}

function preencherSelectLaboratorios() {

    const select = document.getElementById("selectLaboratorio");

    if (!select) return;

    const labs = Object.keys(mapaLaboratorios).sort((a, b) => {

        const na = parseInt(a.match(/\d+/)?.[0] || 999);
        const nb = parseInt(b.match(/\d+/)?.[0] || 999);

        return na - nb;

    });

    select.innerHTML = `
        <option value="" selected>
            📌 Selecione um laboratório
        </option>

        <option value="TODOS">
            🗂 Visão geral (todos os laboratórios)
        </option>
    `;

    labs.forEach(lab => {

        select.innerHTML += `
            <option value="${lab}">
                ${lab}
            </option>
        `;

    });

}

function trocarSemanaLaboratorio() {

    semanaLaboratorioSelecionada =
        document.getElementById("selectSemanaLaboratorio").value;

    renderLaboratorio();
}

function preencherSemanasLaboratorios() {

    const selectSemana = document.getElementById("selectSemanaLaboratorio");
    const labSelecionado = document.getElementById("selectLaboratorio").value;

    if (!selectSemana) return;

    const semanas = new Set();

    if (labSelecionado === "TODOS") {

        Object.values(mapaLaboratorios).forEach(lista => {

            lista.forEach(r => {

                const [d, m, a] = r.data.split("/");

                const dt = new Date(a, m - 1, d);

                dt.setDate(dt.getDate() - dt.getDay() + 1);

                semanas.add(dt.toLocaleDateString("pt-BR"));

            });

        });

    } else if (labSelecionado && mapaLaboratorios[labSelecionado]) {

        mapaLaboratorios[labSelecionado].forEach(r => {

            const [d, m, a] = r.data.split("/");

            const dt = new Date(a, m - 1, d);

            dt.setDate(dt.getDate() - dt.getDay() + 1);

            semanas.add(dt.toLocaleDateString("pt-BR"));

        });

    }

    const ordenadas = Array.from(semanas).sort((a, b) => {

        const [da, ma, aa] = a.split("/");
        const [db, mb, ab] = b.split("/");

        return new Date(aa, ma - 1, da) -
               new Date(ab, mb - 1, db);

    });

    selectSemana.innerHTML = "";

    // Calcula a segunda-feira da semana atual
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const segundaAtual = new Date(hoje);
    segundaAtual.setDate(hoje.getDate() - hoje.getDay() + 1);

    const semanaAtual = segundaAtual.toLocaleDateString("pt-BR");

    // Procura a semana atual na lista
    let indiceSelecionado = ordenadas.indexOf(semanaAtual);

    // Se não existir, seleciona a última disponível
    if (indiceSelecionado === -1) {
        indiceSelecionado = Math.max(0, ordenadas.length - 1);
    }

    ordenadas.forEach((semana, indice) => {

        selectSemana.innerHTML += `
            <option
                value="${semana}"
                ${indice === indiceSelecionado ? "selected" : ""}>
                Semana de ${semana}
            </option>
        `;

    });

}

function getDadosLaboratorio(labSelecionado, semanaSelecionada) {

    const registros = mapaLaboratorios[labSelecionado] || [];

    const resultado = [];

    registros.forEach(r => {

        const [d, m, a] = r.data.split("/");
        const dt = new Date(a, m - 1, d);

        const seg = new Date(dt.setDate(dt.getDate() - dt.getDay() + 1))
            .toLocaleDateString("pt-BR");

        if (!semanaSelecionada || semanaSelecionada === seg) {

            resultado.push({
                data: r.data,
                horario: r.horario,
                turma: r.turma,
                disciplina: normalizarDisciplinaLab(r.valor),
                modalidade: r.modalidade
            });

        }

    });

    return resultado;
}

function trocarLaboratorio() {

    preencherSemanasLaboratorios();

    renderLaboratorio();

}

function montarGradeLaboratorio(labSelecionado, semanaSelecionada) {

    const aulas = getDadosLaboratorio(labSelecionado, semanaSelecionada);

    const dias = [
        "SEGUNDA",
        "TERÇA",
        "QUARTA",
        "QUINTA",
        "SEXTA",
        "SÁBADO"
    ];

    const horarios = [

        "07:30 - 08:20",
        "08:20 - 09:10",

        "__INTERVALO_1__",

        "09:30 - 10:20",
        "10:20 - 11:10",
        "11:10 - 12:00",

        "__ALMOCO__",

        "13:50 - 14:40",
        "14:40 - 15:30",

        "__INTERVALO_2__",

        "15:50 - 16:40",
        "16:40 - 17:30",
        "17:30 - 18:20",

        "__JANTAR__",

        "19:00 - 19:50",
        "19:50 - 20:40",

        "__INTERVALO_3__",

        "20:50 - 21:40",
        "21:40 - 22:30"
    ];

    const grade = {};

    horarios.forEach(h => {
        grade[h] = {};
        dias.forEach(d => grade[h][d] = []);
    });

    aulas.forEach(aula => {

        const [d, m, a] = aula.data.split("/");
        const dt = new Date(a, m - 1, d);

        const diaSemana = [
            "DOMINGO",
            "SEGUNDA",
            "TERÇA",
            "QUARTA",
            "QUINTA",
            "SEXTA",
            "SÁBADO"
        ][dt.getDay()];

        const horario = horarios.find(h =>
            h.trim() === (aula.horario || "").trim()
        );

        if (!horario) return;

        if (!grade[horario]) return;

        if (!grade[horario][diaSemana]) return;

        grade[horario][diaSemana].push({

            turma: aula.turma,
            disciplina: aula.disciplina,
            modalidade: aula.modalidade

        });

    });

    return { dias, horarios, grade };
}

function renderLaboratorio() {

    const tabela = document.getElementById("tabelaLaboratorio");

    const lab = document.getElementById("selectLaboratorio").value;
const semana = document.getElementById("selectSemanaLaboratorio").value;

if (!lab) {
    tabela.innerHTML = `
        <div class="relatorio-placeholder">
            Selecione um laboratório.
        </div>`;
    return;
}

    if (lab === "TODOS") {

    renderTodosLaboratorios(semana);
    return;
}

    const { dias, horarios, grade } =
        montarGradeLaboratorio(lab, semana);

    let html = `
    <table class="tabela-professor">
        <thead>
            <tr>
                <th>Horário</th>
    `;

    dias.forEach(d => {
        html += `<th>${d}</th>`;
    });

    html += `</tr></thead><tbody>`;

    horarios.forEach(h => {

    const ehIntervalo =
        h.includes("__INTERVALO") ||
        h.includes("__ALMOCO__") ||
        h.includes("__JANTAR__");

    if (ehIntervalo) {

        html += `
        <tr>
            <td
                colspan="${dias.length + 1}"
                class="intervalo">

                ${formatarIntervalo(h)}

            </td>
        </tr>`;

        return;
    }

    html += `<tr>`;
    html += `<td><strong>${h}</strong></td>`;

        dias.forEach(d => {

            const celula = grade[h][d];

            if (!celula || celula.length === 0) {

    html += `
    <td class="livre">
        🟢 LIVRE
    </td>`;

} else if (celula.length === 1) {

    const aula = celula[0];

    html += `
    <td>
        <strong>${aula.disciplina}</strong><br><br>
        ${aula.turma}<br>
        <small>${aula.professor || ""}</small><br>
        <small style="color:${aula.modalidade === "INTEGRADO" ? "#16a34a" : "#2563eb"}">
            ${aula.modalidade}
        </small>
    </td>`;

} else {

    html += `
    <td style="background:#fee2e2; color:#991b1b;">
        ⚠ CONFLITO<br><br>
        ${celula.map(c => `
            ${c.disciplina} - ${c.turma}<br>
        `).join("")}
    </td>`;

}

        });

        html += `</tr>`;
    });

    html += `</tbody></table>`;

    tabela.innerHTML = html;
}

function renderTodosLaboratorios(semanaSelecionada) {
    const tabela = document.getElementById("tabelaLaboratorio");
    const labs = Object.keys(mapaLaboratorios).sort((a, b) => {
        const na = parseInt(a.match(/\d+/)?.[0] || 999);
        const nb = parseInt(b.match(/\d+/)?.[0] || 999);
        return na - nb;
    });

    const dias = [
        "SEGUNDA",
        "TERÇA",
        "QUARTA",
        "QUINTA",
        "SEXTA",
        "SÁBADO"
    ];

    // Apenas horários reais, sem separadores de intervalo/almoço/jantar
    const horarios = [
        "07:30 - 08:20",
        "08:20 - 09:10",
        "09:30 - 10:20",
        "10:20 - 11:10",
        "11:10 - 12:00",
        "13:50 - 14:40",
        "14:40 - 15:30",
        "15:50 - 16:40",
        "16:40 - 17:30",
        "17:30 - 18:20",
        "19:00 - 19:50",
        "19:50 - 20:40",
        "20:50 - 21:40",
        "21:40 - 22:30"
    ];

    let html = `
    <table class="tabela-professor">
        <thead>
            <tr>
                <th>Dia</th>
                <th>Horário</th>
                ${labs.map(l => `<th>${l}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
    `;

    dias.forEach((dia, indiceDia) => {
        horarios.forEach((h, indiceHorario) => {
            html += `<tr>`;

            // Primeira linha do dia recebe o rowspan com o nome do dia
            if (indiceHorario === 0) {
                html += `
                <td rowspan="${horarios.length}">
                    <strong>${dia}</strong>
                </td>`;
            }

            html += `<td><strong>${h}</strong></td>`;

            labs.forEach(lab => {
                const { grade } = montarGradeLaboratorio(lab, semanaSelecionada);
                const celula = grade[h][dia];

                if (!celula.length) {
                    html += `
                    <td class="livre">
                        🟢 LIVRE
                    </td>`;
                    return;
                }

                if (celula.length === 1) {
                    const aula = celula[0];
                    html += `
                    <td>
                        <strong>${aula.disciplina}</strong><br>
                        ${aula.turma}<br>
                        <small style="color:${
                            aula.modalidade === "INTEGRADO"
                                ? "#16a34a"
                                : "#2563eb"
                        }">
                            ${aula.modalidade}
                        </small>
                    </td>`;
                    return;
                }

                html += `
                <td style="background:#fee2e2;color:#991b1b;">
                    ⚠ CONFLITO<br><br>
                    ${celula.map(c => `
                        ${c.disciplina}<br>
                        ${c.turma}<hr>
                    `).join("")}
                </td>`;
            });

            html += `</tr>`;
        });

        // Linha em branco separando os dias (exceto após o último)
        if (indiceDia < dias.length - 1) {
            html += `
            <tr>
                <td colspan="${labs.length + 2}" style="height:8px;background:#fff;border:none;"></td>
            </tr>`;
        }
    });

    html += `
        </tbody>
    </table>`;
    tabela.innerHTML = html;
}

function formatarIntervalo(h) {

    if (h.includes("ALMOCO")) return "🍽 ALMOÇO";
    if (h.includes("JANTAR")) return "🍽 JANTAR";

    if (h.includes("INTERVALO_1")) return "⏸ INTERVALO";
    if (h.includes("INTERVALO_2")) return "⏸ INTERVALO";
    if (h.includes("INTERVALO_3")) return "⏸ INTERVALO";

    return "⏸ INTERVALO";
}

// ======================================================
// 📄 EXPORTAR PDF DOS LABORATÓRIOS
// ======================================================
function exportarLaboratorioPDF() {

    const laboratorio =
        document.getElementById("selectLaboratorio")?.value;

    const semana =
        document.getElementById("selectSemanaLaboratorio")?.value;

    if (!laboratorio) {

        alert("Selecione um laboratório.");

        return;

    }

    if (!semana) {

        alert("Selecione uma semana.");

        return;

    }

    if (laboratorio === "TODOS") {

        gerarPDFTodosLaboratorios(semana);

    } else {

        gerarPDFLaboratorio(laboratorio, semana);

    }

}

// ======================================================
// 📄 GERAR PDF DO LABORATÓRIO (A4 RETRATO)
// ======================================================
function gerarPDFLaboratorio(laboratorio, semana) {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();

    const { dias, horarios, grade } =
        montarGradeLaboratorio(laboratorio, semana);

    const aulas =
        getDadosLaboratorio(laboratorio, semana);

    // =====================================
    // ESTATÍSTICAS
    // =====================================

    const totalAulas = aulas.length;

    const totalTurmas =
        new Set(aulas.map(a => a.turma)).size;

    const totalDias =
        new Set(aulas.map(a => a.data)).size;

    const horariosValidos =
        horarios.filter(h => !h.startsWith("__"));

    const totalSlots =
        horariosValidos.length * dias.length;

    const ocupacao =
        totalSlots === 0
            ? 0
            : Math.round((totalAulas / totalSlots) * 100);

    // =====================================
    // CABEÇALHO
    // =====================================

    pdf.setFontSize(10);

    pdf.text(
        "INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO",
        pageWidth / 2,
        10,
        { align: "center" }
    );

    pdf.text(
        "CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE",
        pageWidth / 2,
        14,
        { align: "center" }
    );

    pdf.setFontSize(11);

    pdf.setFont(undefined, "bold");

    pdf.text(

        `FICHA DO LABORATÓRIO: ${laboratorio.toUpperCase()}`,

        pageWidth / 2,

        22,

        { align: "center" }

    );

    pdf.setFont(undefined, "normal");

    pdf.setFontSize(9);

    pdf.text(

        `Semana de ${semana}`,

        pageWidth / 2,

        27,

        { align: "center" }

    );

    // =====================================
    // CAIXAS DE ESTATÍSTICAS
    // =====================================

    pdf.setDrawColor(180);

    pdf.roundedRect(10,33,60,22,2,2);
    pdf.roundedRect(75,33,60,22,2,2);
    pdf.roundedRect(140,33,60,22,2,2);

    pdf.setFontSize(8);

    pdf.text("TOTAL DE AULAS",40,38,{align:"center"});
    pdf.text("TURMAS",105,38,{align:"center"});
    pdf.text("OCUPAÇÃO",170,38,{align:"center"});

    pdf.setFont(undefined,"bold");
    pdf.setFontSize(18);

    pdf.text(String(totalAulas),40,46,{align:"center"});
    pdf.text(String(totalTurmas),105,46,{align:"center"});
    pdf.text(`${ocupacao}%`,170,46,{align:"center"});

    pdf.setFont(undefined,"normal");
    pdf.setFontSize(7);

    pdf.text(

        `${totalDias} dia(s) com utilização`,

        170,

        52,

        {align:"center"}

    );

    // =====================================
    // TABELA
    // =====================================

    const body = [];

    horarios.forEach(h => {

        const separadores = {

            "__INTERVALO_1__":"INTERVALO",
            "__INTERVALO_2__":"INTERVALO",
            "__INTERVALO_3__":"INTERVALO",
            "__ALMOCO__":"ALMOÇO",
            "__JANTAR__":"JANTAR"

        };

        if (separadores[h]) {

            body.push([

                separadores[h],

                {

                    content: separadores[h],

                    colSpan:6,

                    styles:{

                        halign:"center",

                        fontStyle:"bold",

                        fillColor:[241,245,249]

                    }

                }

            ]);

            return;

        }

        const row = [h];

        dias.forEach(dia => {

            const celula = grade[h][dia];

            if (!celula.length){

                row.push("");

                return;

            }

            const texto = celula.map(a=>{

                return `${a.disciplina}
${a.turma}
${a.modalidade}`;

            }).join("\n\n");

            row.push(texto);

        });

        body.push(row);

    });

    // =====================================
    // TOTAL POR DIA
    // =====================================

    const totalDia=[];

    dias.forEach(d=>{

        let contador=0;

        horarios.forEach(h=>{

            if(h.startsWith("__")) return;

            contador+=grade[h][d].length;

        });

        totalDia.push(contador);

    });

    body.push([

        "AULAS/DIA",

        ...totalDia

    ]);

    // =====================================
    // AUTOTABLE
    // =====================================

    pdf.autoTable({

        head:[

            [

                "Horário",

                ...dias

            ]

        ],

        body,

        startY:62,

        theme:"grid",

        styles:{

            fontSize:6,

            cellPadding:1,

            halign:"center",

            valign:"middle",

            overflow:"linebreak"

        },

        headStyles:{

            fillColor:[21,128,61],

            textColor:[255,255,255],

            halign:"center"

        },

        columnStyles:{

            0:{cellWidth:20},

            1:{cellWidth:28},

            2:{cellWidth:28},

            3:{cellWidth:28},

            4:{cellWidth:28},

            5:{cellWidth:28},

            6:{cellWidth:28}

        },

        didParseCell:(data)=>{

            // Linha de totais
            if(data.row.index===body.length-1){

                data.cell.styles.fillColor=[232,245,233];

                data.cell.styles.fontStyle="bold";

            }

            // Linhas cinza
            if(

                data.cell.raw==="INTERVALO" ||

                data.cell.raw==="ALMOÇO" ||

                data.cell.raw==="JANTAR"

            ){

                data.cell.styles.fillColor=[241,245,249];

                data.cell.styles.fontStyle="bold";

                data.cell.styles.halign="center";

            }

        }

    });

    // =====================================
    // RODAPÉ
    // =====================================

    pdf.setFontSize(8);

    pdf.text(

        "IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br",

        pageWidth/2,

        285,

        {align:"center"}

    );

    // =====================================
    // SALVAR
    // =====================================

    pdf.save(

        `${laboratorio.replace(/\s+/g,"_")}_Semana_${semana.replace(/\//g,"-")}.pdf`

    );

}

// ======================================================
// 📄 GERAR PDF - VISÃO GERAL DOS LABORATÓRIOS (A4 PAISAGEM)
// ======================================================
function gerarPDFTodosLaboratorios(semana) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    const labs = Object.keys(mapaLaboratorios).sort((a, b) => {
        const na = parseInt(a.match(/\d+/)?.[0] || 999);
        const nb = parseInt(b.match(/\d+/)?.[0] || 999);
        return na - nb;
    });

    // Apenas horários reais, sem separadores de intervalo/almoço/jantar
    const horarios = [
        "07:30 - 08:20",
        "08:20 - 09:10",
        "09:30 - 10:20",
        "10:20 - 11:10",
        "11:10 - 12:00",
        "13:50 - 14:40",
        "14:40 - 15:30",
        "15:50 - 16:40",
        "16:40 - 17:30",
        "17:30 - 18:20",
        "19:00 - 19:50",
        "19:50 - 20:40",
        "20:50 - 21:40",
        "21:40 - 22:30"
    ];

    // Dias agrupados 2 a 2, cada grupo = 1 página
    const paresDias = [
        ["SEGUNDA", "TERÇA"],
        ["QUARTA", "QUINTA"],
        ["SEXTA", "SÁBADO"]
    ];

    // =====================================
    // FUNÇÃO: CABEÇALHO (repetido em cada página)
    // =====================================
    function desenharCabecalho() {
        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");
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
        pdf.setFont(undefined, "bold");
        pdf.text(
            "VISÃO GERAL DOS LABORATÓRIOS",
            pageWidth / 2, 22,
            { align: "center" }
        );
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(9);
        pdf.text(
            `Semana de ${semana}`,
            pageWidth / 2, 27,
            { align: "center" }
        );
    }

    // =====================================
    // ESTATÍSTICAS (somente na primeira página)
    // =====================================
    function desenharEstatisticas() {
        let totalAulas = 0;
        labs.forEach(lab => {
            totalAulas += getDadosLaboratorio(lab, semana).length;
        });
        pdf.setDrawColor(180);
        pdf.roundedRect(10, 33, 60, 22, 2, 2);
        pdf.roundedRect(75, 33, 60, 22, 2, 2);
        pdf.roundedRect(140, 33, 60, 22, 2, 2);
        pdf.setFontSize(8);
        pdf.text("LABORATÓRIOS", 40, 38, { align: "center" });
        pdf.text("TOTAL DE AULAS", 105, 38, { align: "center" });
        pdf.text("SEMANA", 170, 38, { align: "center" });
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(18);
        pdf.text(String(labs.length), 40, 46, { align: "center" });
        pdf.text(String(totalAulas), 105, 46, { align: "center" });
        pdf.text(semana, 170, 46, { align: "center" });
        pdf.setFont(undefined, "normal");
    }

    // =====================================
    // MONTA O CORPO DE UM PAR DE DIAS
    // =====================================
    function montarBodyPar(dia1, dia2) {
        const body = [];

        [dia1, dia2].forEach((dia, indiceDia) => {
            horarios.forEach((h, indiceHorario) => {
                const row = [];

                // Primeira linha do dia recebe o rowSpan com o nome do dia
                if (indiceHorario === 0) {
                    row.push({
                        content: dia,
                        rowSpan: horarios.length,
                        styles: {
                            valign: "middle",
                            halign: "center",
                            fontStyle: "bold",
                            fillColor: [241, 245, 249]
                        }
                    });
                }

                row.push(h);

                labs.forEach(lab => {
                    const { grade } = montarGradeLaboratorio(lab, semana);
                    const celula = grade[h][dia];
                    if (!celula || !celula.length) {
                        row.push("");
                        return;
                    }
                    const texto = celula
                        .map(a => `${a.disciplina}\n${a.turma}`)
                        .join("\n\n");
                    row.push(texto);
                });

                body.push(row);
            });

            // Linha em branco separando os dois dias (exceto após o último dia)
            if (indiceDia === 0) {
                body.push([
                    {
                        content: "",
                        colSpan: labs.length + 2,
                        styles: { fillColor: [255, 255, 255], minCellHeight: 3 }
                    }
                ]);
            }
        });

        return body;
    }

    // =====================================
    // LARGURA DAS COLUNAS
    // =====================================
    const columnStyles = {
        0: { cellWidth: 22 }, // Dia
        1: { cellWidth: 22 }  // Horário
    };
    labs.forEach((lab, i) => {
        columnStyles[i + 2] = { cellWidth: 45 };
    });

    // =====================================
    // GERA UMA PÁGINA POR PAR DE DIAS
    // =====================================
    paresDias.forEach((par, indice) => {
        if (indice > 0) pdf.addPage();

        desenharCabecalho();
        let startY = 33;

        if (indice === 0) {
            desenharEstatisticas();
            startY = 62;
        } else {
            startY = 33;
        }

        pdf.autoTable({
            head: [["Dia", "Horário", ...labs]],
            body: montarBodyPar(par[0], par[1]),
            startY,
            theme: "grid",
            styles: {
                fontSize: 6,
                cellPadding: 1,
                valign: "middle",
                halign: "center",
                overflow: "linebreak"
            },
            headStyles: {
                fillColor: [21, 128, 61],
                textColor: [255, 255, 255],
                fontStyle: "bold",
                halign: "center"
            },
            columnStyles
        });
    });

    // =====================================
    // RODAPÉ EM TODAS AS PÁGINAS
    // =====================================
    const totalPaginas = pdf.internal.getNumberOfPages();
    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
        pdf.setPage(pagina);
        const alturaPagina = pdf.internal.pageSize.getHeight();
        pdf.setFontSize(8);
        pdf.text(
            "IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br",
            pageWidth / 2,
            alturaPagina - 6,
            { align: "center" }
        );
    }

    // =====================================
    // SALVAR
    // =====================================
    pdf.save(
        `Visao_Geral_Laboratorios_Semana_${semana.replace(/\//g, "-")}.pdf`
    );
}
