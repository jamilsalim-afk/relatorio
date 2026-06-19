function montarIndiceProfessores() {
    INDEX_PROFESSOR = {};
    INDEX_TURMA = {};
    BASE_GERAL.forEach(item => {
        const valor = item.valor || "";
        if (!valor.includes(" - "))
            return;
        const [
            disciplina,
            professor
        ] =
            valor
                .split(" - ")
                .map(v => v.trim());

        if (!professor)
            return;
        const profNorm = normalizarProfessor(
                professor
            );

        // ====================================
        // ÍNDICE DE PROFESSORES
        // ====================================
        if (!INDEX_PROFESSOR[profNorm]) {
            INDEX_PROFESSOR[profNorm] = [];
        }
        const registro = {
            data: item.data,
            horario: item.horario,
            turma: item.turma,
            disciplina,
            professor,
            modalidade: item.modalidade
        };

        INDEX_PROFESSOR[profNorm].push(
            registro
        );

        // ====================================
        // ÍNDICE DE TURMAS
        // ====================================

        const turma = item.turma || "";
        if (!turma)
            return;
        if (!INDEX_TURMA[turma]) {
            INDEX_TURMA[turma] = [];
        }

        INDEX_TURMA[turma].push(
            registro
        );
    });

    console.log(
        "PROF INDEX OK:",
        Object.keys(
            INDEX_PROFESSOR
        ).length
    );

    console.log(
        "TURMA INDEX OK:",
        Object.keys(
            INDEX_TURMA
        ).length
    );
}

function normalizarProfessor(nome) {
    if (!nome) return "";
    return nome
        .toString()
        .toUpperCase()
        // remove [R], [EX], [REP], [+] etc
        .replace(/\[.*?\]/g, "")
        // remove *
        .replace(/\*/g, "")
        // remove espaços duplicados
        .replace(/\s+/g, " ")
        .trim();
}

function carregarListaProfessores() {
    const select =
        document.getElementById("selectProfessor");
    if (!select) return;
    select.innerHTML =
        '<option value="">Selecione um professor</option>';
    dadosProfessores
        .slice(1)
        .sort((a,b)=>
            (a[0] || "")
                .localeCompare(
                    b[0] || "",
                    'pt-BR'
                )
        )
        .forEach(linha => {
            const nomeCompleto = (linha[0] || "").trim();
            if (!nomeCompleto) return;
            select.innerHTML += `
                <option value="${nomeCompleto}">
                    ${nomeCompleto}
                </option>
            `;
        });
}

function traduzirProfessor(nomeCompleto) {
    if (!nomeCompleto) return "";
    const nomeNorm = normalizarProfessor(nomeCompleto);
    for (let i = 1; i < dadosProfessores.length; i++) {
        const nomeExibicao = normalizarProfessor(
                dadosProfessores[i][0]
            );

        const variacao = normalizarProfessor(
                dadosProfessores[i][1]
            );

        if (nomeExibicao === nomeNorm) {
            return variacao;
        }
    }
    return nomeNorm;
}

function obterNomeCompletoProfessor(nome) {
    if (!nome) return "";
    const nomeNorm = normalizarProfessor(nome);
    for (let i = 1; i < dadosProfessores.length; i++) {
        const nomeCompleto = (dadosProfessores[i][0] || "").trim();
        const nomeCurto = normalizarProfessor(
                dadosProfessores[i][1]
            );
        if (nomeCurto === nomeNorm) {
            return nomeCompleto;
        }
    }
    return nome;
}
  
function getDadosProfessor(professor, semana) {
    const profCurto = traduzirProfessor(professor);
    return (
        INDEX_PROFESSOR[profCurto] || []
    ).filter(aula => {
        const data = aula.data;
        const semanaAula = obterInicioSemana(data);
        return semanaAula === semana;
    });
}
  
function carregarSemanasProfessor(){
    const origem = document.getElementById('selectSemana');
    const destino = document.getElementById('selectSemanaProfessor');
    if(!origem || !destino) return;
    destino.innerHTML = origem.innerHTML;
    // 🔥 IMPORTANTE: evita disparo automático de onchange
    destino.value = origem.value;
    // 🔥 BLOQUEIA render automático nessa etapa
    destino.dataset.ready = "true";
}

function montarGradeProfessor(dados, professorSelecionado, semanaSelecionada) {
    const aulas = getDadosProfessor(
            professorSelecionado,
            semanaSelecionada
        );

    console.log("AULAS ENCONTRADAS:", aulas.length);
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

    // ==============================
    // 🔥 GRADE BASE (TUDO ARRAY)
    // ==============================
    const grade = {};
    horarios.forEach(h => {
        grade[h] = {};
        dias.forEach(d => {
            grade[h][d] = [];
        });
    });

    // ==============================
    // 🔥 PREENCHIMENTO
    // ==============================
    aulas.forEach(aula => {
        const [d, m, a] = aula.data.split("/");
        const dt = new Date(a, m - 1, d);
        const diaSemana =
            [
                "DOMINGO",
                "SEGUNDA",
                "TERÇA",
                "QUARTA",
                "QUINTA",
                "SEXTA",
                "SÁBADO"
            ][dt.getDay()];

        // normaliza horário (evita erro de espaço)
        const horario = horarios.find(h =>
            h.trim() === (aula.horario || "").trim()
        );

        if (!horario) return;
        if (!grade[horario]) return;
        if (!grade[horario][diaSemana]) {
            grade[horario][diaSemana] = [];
        }

        const turma = aula.turma || "";
        const disciplina = aula.disciplina || "";
        grade[horario][diaSemana].push(`
            <div style="
                margin-bottom:4px;
                padding:3px;
                border-left:3px solid #15803d;
            ">
                <b>${turma}</b><br>
                ${disciplina}
            </div>
        `);
    });

    return {
        dias,
        horarios,
        grade
    };
}

function renderProfessor(){
    const semanaEl = document.getElementById("selectSemanaProfessor");
    if (
        semanaEl &&
        semanaEl.dataset.ready !== "true"
    ){
        return;
    }

    const professor = document.getElementById("selectProfessor")?.value;
    const semana = semanaEl?.value;
    if (!professor || !semana) return;
    const container = document.getElementById("tabelaProfessor");
    const { dias, horarios, grade } =
        montarGradeProfessor(
            BASE_GERAL,
            professor,
            semana
        );
    const aulas = getDadosProfessor(
            professor,
            semana
        );
    const totalAulas = aulas.length;
    const totalTurmas = new Set(
            aulas.map(a => a.turma)
        ).size;

    const totalDias = new Set(
            aulas.map(a => a.data)
        ).size;

    let html = `

    <div style="
        display:flex;
        gap:15px;
        margin-bottom:15px;
        flex-wrap:wrap;
    ">

        <div style="
            background:var(--surface);
            color:var(--text);
            padding:15px;
            border-radius:10px;
            box-shadow:0 2px 6px rgba(0,0,0,.15);
            min-width:160px;
            text-align:center;
        ">
            <div style="font-size:12px;color:var(--text-soft)">
                TOTAL DE AULAS
            </div>
            <div style="
                font-size:30px;
                font-weight:bold;
                color:#2e7d32;
            ">
                ${totalAulas}
            </div>
        </div>

        <div style="
            background:var(--surface);
            color:var(--text);
            padding:15px;
            border-radius:10px;
            box-shadow:0 2px 6px rgba(0,0,0,.15);
            min-width:160px;
            text-align:center;
        ">
            <div style="font-size:12px;color:var(--text-soft)">
                TURMAS
            </div>
            <div style="
                font-size:30px;
                font-weight:bold;
                color:#1565c0;
            ">
                ${totalTurmas}
            </div>
        </div>

        <div style="
            background:var(--surface);
            color:var(--text);
            padding:15px;
            border-radius:10px;
            box-shadow:0 2px 6px rgba(0,0,0,.15);
            min-width:160px;
            text-align:center;
        ">
            <div style="font-size:12px;color:var(--text-soft)">
                DIAS COM AULA
            </div>
            <div style="
                font-size:30px;
                font-weight:bold;
                color:#ef6c00;
            ">
                ${totalDias}
            </div>
        </div>
    </div>

    <table style="
    width:100%;
    border-collapse:collapse;
    background:var(--surface);
    color:var(--text);
    font-size:12px;
">

    <thead>

    <tr style="
        background:#15803d;
        color:white;
    ">
        <th style="padding:8px;border:1px solid #ccc">
            HORÁRIO
        </th>
    `;

    dias.forEach(d => {
        html += `
            <th style="
                padding:8px;
                border:1px solid #ccc;
            ">
                ${d}
            </th>
        `;
    });
    html += `
        </tr>
        </thead>
        <tbody>
    `;

    horarios.forEach(h => {
        if (h === "__INTERVALO_1__") {
            html += `
            <tr style="
                background:var(--intervalo);
                color:var(--text);
                font-weight:bold;
                text-align:center;
            ">
                <td>09:10 - 09:30</td>
                <td colspan="6">INTERVALO</td>
            </tr>
            `;
            return;
        }

        if (h === "__INTERVALO_2__") {
            html += `
            <tr style="
                background:var(--intervalo);
                color:var(--text);
                font-weight:bold;
                text-align:center;
            ">
                <td>15:30 - 15:50</td>
                <td colspan="6">INTERVALO</td>
            </tr>
            `;
            return;
        }

        if (h === "__INTERVALO_3__") {
            html += `
            <tr style="
                background:var(--intervalo);
                color:var(--text);
                font-weight:bold;
                text-align:center;
            ">
                <td>20:40 - 20:50</td>
                <td colspan="6">INTERVALO</td>
            </tr>
            `;
            return;
        }

        if (h === "__ALMOCO__") {
            html += `
            <tr style="
                background:var(--caed);
                color:var(--text);
                font-weight:bold;
                text-align:center;
            ">
                <td>12:00 - 13:50</td>
                <td colspan="6">ALMOÇO</td>
            </tr>
            `;
            return;
        }

        if (h === "__JANTAR__") {
            html += `
            <tr style="
                background:var(--caed);
                color:var(--text);
                font-weight:bold;
                text-align:center;
            ">
                <td>18:20 - 19:00</td>
                <td colspan="6">JANTAR</td>
            </tr>
            `;
            return;
        }

        html += `<tr>`;
        html += `
            <td style="
                border:1px solid #ccc;
                padding:6px;
                font-weight:bold;
                text-align:center;
                background:var(--time-bg);
                color:var(--text);
            ">
                ${h}
            </td>
        `;

        dias.forEach(d => {

    const conteudo = grade[h]?.[d] || [];

    html += `
        <td style="
            border:1px solid #ccc;
            padding:6px;
            vertical-align:top;
            min-height:50px;
        ">
            ${Array.isArray(conteudo)
                ? conteudo.join("")
                : conteudo}
        </td>
    `;
});

        html += `</tr>`;
    });

    const aulasPorDia = {
        "SEGUNDA":0,
        "TERÇA":0,
        "QUARTA":0,
        "QUINTA":0,
        "SEXTA":0,
        "SÁBADO":0
    };

    aulas.forEach(aula => {
        const [d,m,a] = aula.data.split("/");
        const dt = new Date(a,m-1,d);
        const dia =
            [
                "DOMINGO",
                "SEGUNDA",
                "TERÇA",
                "QUARTA",
                "QUINTA",
                "SEXTA",
                "SÁBADO"
            ][dt.getDay()];

        if(aulasPorDia[dia] !== undefined){
            aulasPorDia[dia]++;
        }
    });

    html += `
    <tr style="
        background:var(--intervalo);
        color:var(--text);
        font-weight:bold;
        text-align:center;
    ">
        <td>AULAS / DIA</td>
        <td>${aulasPorDia["SEGUNDA"]}</td>
        <td>${aulasPorDia["TERÇA"]}</td>
        <td>${aulasPorDia["QUARTA"]}</td>
        <td>${aulasPorDia["QUINTA"]}</td>
        <td>${aulasPorDia["SEXTA"]}</td>
        <td>${aulasPorDia["SÁBADO"]}</td>
    </tr>
    `;

    html += `
        </tbody>
        </table>
    `;
    container.innerHTML = html;
}

// ======================================================
// 🔥 EXPORTAR FICHA DO PROFESSOR (PDF RETRATO)
// ======================================================
function exportarFichaProfessorPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const professor = document.getElementById("selectProfessor")?.value;
    const semana = document.getElementById("selectSemanaProfessor")?.value;
    if (!professor || !semana) return;
    const { dias, horarios, grade } = montarGradeProfessor(BASE_GERAL, professor, semana);
    const aulas = getDadosProfessor(professor, semana);
    const totalAulasSegSex = aulas.filter(a => {
            const [dia, mes, ano] = a.data.split("/");
            const dt = new Date(ano, mes - 1, dia);
            return (dt.getDay() >= 1 && dt.getDay() <= 5);
        }).length;
    const totalAulasSab = aulas.filter(a => {
            const [dia, mes, ano] = a.data.split("/");
            const dt = new Date(ano, mes - 1, dia);
            return dt.getDay() === 6;
        }).length;
    const totalAulas = totalAulasSegSex + totalAulasSab;
    const totalTurmas = new Set(aulas.map(a => a.turma)).size;
    const totalDias = new Set(aulas.map(a => a.data)).size;
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
    pdf.setFont(undefined, "bold");
    pdf.text(
        `FICHA DO PROFESSOR: ${professor}`,
        pageWidth / 2, 22,
        { align: "center" }
    );
    pdf.setFontSize(9);
    pdf.setFont(undefined, "normal");
    pdf.text(
        `Semana de ${semana}`,
        pageWidth / 2, 27,
        { align: "center" }
    );

    // =====================================
    // ESTATÍSTICAS
    // =====================================
    pdf.setDrawColor(180);
    pdf.roundedRect(10, 33, 60, 22, 2, 2);
    pdf.roundedRect(75, 33, 60, 22, 2, 2);
    pdf.roundedRect(140, 33, 60, 22, 2, 2);
    pdf.setFontSize(8);
    pdf.text(
        "TOTAL DE AULAS", 40, 38,
        { align: "center" }
    );
    pdf.text(
        "TURMAS", 105, 38,
        { align: "center" }
    );
    pdf.text(
        "DIAS COM AULA", 170, 38,
        { align: "center" }
    );
    pdf.setFontSize(18);
    pdf.setFont(undefined, "bold");

    pdf.text(String(totalAulas), 40, 46,
        { align: "center" }
    );
    pdf.text(String(totalTurmas), 105, 46,
        { align: "center" }
    );
    pdf.text(String(totalDias), 170, 46,
        { align: "center" }
    );
    pdf.setFontSize(7);
    pdf.setFont(undefined, "normal");
    pdf.text(
        `Seg-Sex: ${totalAulasSegSex} | Sáb: ${totalAulasSab}`,
        40, 52,
        { align: "center" }
    );
    // =====================================
    // CORPO DA TABELA
    // =====================================
    const body = horarios.map(h => {
        const separadores = {
            "__INTERVALO_1__": "INTERVALO",
            "__INTERVALO_2__": "INTERVALO",
            "__INTERVALO_3__": "INTERVALO",
            "__ALMOCO__": "ALMOÇO",
            "__JANTAR__": "JANTAR"
        };

        if (separadores[h]) {
            return [
                separadores[h],
                {
                    content: separadores[h],
                    colSpan: 6,
                    styles: {
                        halign: "center",
                        fontStyle: "bold",
                        fillColor: [241, 245, 249]
                    }
                }
            ];
        }
        const row = [h];
        dias.forEach(d => {
            let conteudo = grade[h]?.[d] || [];
            let texto =
                Array.isArray(conteudo)
                    ? conteudo.join(" ")
                    : String(conteudo);
            texto = texto
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
            row.push(texto);
        });
        return row;
    });

    // =====================================
    // AULAS POR DIA
    // =====================================
    const aulasPorDia = dias.map(d => {
        return aulas.filter(a => {
            const [dia, mes, ano] = a.data.split("/");
            const dt = new Date(ano, mes - 1, dia);
            const nomeDia = [
                    "DOMINGO",
                    "SEGUNDA",
                    "TERÇA",
                    "QUARTA",
                    "QUINTA",
                    "SEXTA",
                    "SÁBADO"
                ][dt.getDay()];
            return nomeDia === d;
        }).length;
    });
    body.push([
        "AULAS/DIA",
        ...aulasPorDia
    ]);
    // =====================================
    // TABELA
    // =====================================
    pdf.autoTable({
        head: [
            [
                "Horário",
                ...dias
            ]
        ],
        body,
        startY: 62,
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
            halign: "center"
        },
        columnStyles: {
        0: {cellWidth: 20,
        halign: 'center'},
        1: {cellWidth: 28},
        2: {cellWidth: 28},
        3: {cellWidth: 28},
        4: {cellWidth: 28},
        5: {cellWidth: 28},
        6: {cellWidth: 28}
        },

        didParseCell: (data) => {
            if (
                data.row.index ===
                body.length - 1
            ) {
                data.cell.styles.fillColor =
                    [232, 245, 233];
                data.cell.styles.fontStyle =
                    "bold";
            }
        }
    });

    // =====================================
    // RODAPÉ
    // =====================================
    pdf.setFontSize(8);
    pdf.text(
        "IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br",
        pageWidth / 2,
        285,
        { align: "center" }
    );
    // =====================================
    // SALVAR
    // =====================================
    const nomeArquivo =
        `${professor.replace(/\s+/g, '_')}_Semana_de_${semana.replace(/\//g, '-')}.pdf`;
    pdf.save(nomeArquivo);
}
