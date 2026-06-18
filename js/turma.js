  function carregarSelectTurmas() {

    const select =
        document.getElementById(
            "selectTurma"
        );

    if (!select)
        return;

    select.innerHTML =
        `<option value="">
            Selecione uma Turma
        </option>`;

    Object.keys(INDEX_TURMA)
        .sort()
        .forEach(turma => {

            select.innerHTML += `
                <option value="${turma}">
                    ${turma}
                </option>
            `;

        });

}

function carregarListaTurmas() {

    const select =
        document.getElementById("selectTurma");

    if (!select) return;

    select.innerHTML =
        '<option value="">Selecione uma turma</option>';

    Object.keys(INDEX_TURMA)
        .sort((a,b)=>
            a.localeCompare(
                b,
                'pt-BR'
            )
        )
        .forEach(turma => {

            select.innerHTML += `
                <option value="${turma}">
                    ${turma}
                </option>
            `;

        });

}

  function carregarSemanasTurma(){

    const origem =
        document.getElementById(
            "selectSemana"
        );

    const destino =
        document.getElementById(
            "selectSemanaTurma"
        );

    if(!origem || !destino) return;

    destino.innerHTML =
        origem.innerHTML;

    destino.value =
        origem.value;

    destino.dataset.ready =
        "true";
}
  
  function getDadosTurma(turma, semana) {

    return (
        INDEX_TURMA[turma] || []
    ).filter(aula => {

        const data =
            aula.data;

        const semanaAula =
            obterInicioSemana(data);

        return semanaAula === semana;
    });
}

  function montarGradeTurma(
    dados,
    turmaSelecionada,
    semanaSelecionada
) {

    const aulas =
        getDadosTurma(
            turmaSelecionada,
            semanaSelecionada
        );

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

        dias.forEach(d => {

            grade[h][d] = [];

        });

    });

    aulas.forEach(aula => {

        const [d, m, a] =
            aula.data.split("/");

        const dt =
            new Date(a, m - 1, d);

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

        const horario =
            horarios.find(h =>
                h.trim() ===
                (aula.horario || "").trim()
            );

        if (!horario) return;

        const disciplina =
            aula.disciplina || "";

        const professor =
            aula.professor || "";

        grade[horario][diaSemana].push(`

            <div style="
                margin-bottom:4px;
                padding:3px;
                border-left:3px solid #1565c0;
            ">

                <b>${disciplina}</b><br>

                ${professor}

            </div>

        `);

    });

    return {
        dias,
        horarios,
        grade
    };
}

  function renderTurma(){

    const semanaEl =
        document.getElementById(
            "selectSemanaTurma"
        );

    if (
        semanaEl &&
        semanaEl.dataset.ready !== "true"
    ){
        return;
    }

    const turma =
        document.getElementById(
            "selectTurma"
        )?.value;

    const semana =
        semanaEl?.value;

    if (!turma || !semana) return;

    const container =
        document.getElementById(
            "tabelaTurma"
        );

    const {
        dias,
        horarios,
        grade
    } =
        montarGradeTurma(
            BASE_GERAL,
            turma,
            semana
        );

    const aulas =
        getDadosTurma(
            turma,
            semana
        );

    const totalAulas =
        aulas.length;

    const totalProfessores =
        new Set(
            aulas.map(
                a => a.professor
            )
        ).size;

    const totalDias =
        new Set(
            aulas.map(
                a => a.data
            )
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
            <div style="
                font-size:12px;
                color:var(--text-soft)
            ">
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
            <div style="
                font-size:12px;
                color:var(--text-soft)
            ">
                PROFESSORES
            </div>

            <div style="
                font-size:30px;
                font-weight:bold;
                color:#1565c0;
            ">
                ${totalProfessores}
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
            <div style="
                font-size:12px;
                color:var(--text-soft)
            ">
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
    `;

    html += `
    <thead>

        <tr style="
            background:#15803d;
            color:white;
        ">

            <th style="
                padding:8px;
                border:1px solid #ccc;
            ">
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

        if (
            h === "__INTERVALO_1__" ||
            h === "__INTERVALO_2__" ||
            h === "__INTERVALO_3__"
        ) {

            html += `
            <tr style="
                background:var(--intervalo);
                color:var(--text);
                font-weight:bold;
                text-align:center;
            ">
                <td>INTERVALO</td>
                <td colspan="6">
                    INTERVALO
                </td>
            </tr>
            `;

            return;
        }

        if (
            h === "__ALMOCO__" ||
            h === "__JANTAR__"
        ) {

            html += `
            <tr style="
                background:var(--caed);
                color:var(--text);
                font-weight:bold;
                text-align:center;
            ">
                <td>${h === "__ALMOCO__" ? "ALMOÇO" : "JANTAR"}</td>
                <td colspan="6">
                    ${h === "__ALMOCO__" ? "ALMOÇO" : "JANTAR"}
                </td>
            </tr>
            `;

            return;
        }

        html += `
        <tr>
        `;

        html += `
        <td style="
            border:1px solid #ccc;
            padding:6px;
            text-align:center;
            font-weight:bold;
            background:var(--time-bg);
            color:var(--text);
        ">
            ${h}
        </td>
        `;

        dias.forEach(d => {

            html += `
            <td style="
                border:1px solid #ccc;
                padding:6px;
                vertical-align:top;
            ">
                ${grade[h]?.[d] || ""}
            </td>
            `;

        });

        html += `
        </tr>
        `;

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

        const [d,m,a] =
            aula.data.split("/");

        const dt =
            new Date(a,m-1,d);

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

        if (
            aulasPorDia[dia]
            !== undefined
        ) {
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

function exportarFichaTurmaPDF() {

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth =  pdf.internal.pageSize.getWidth();
    const turma = document.getElementById("selectTurma")?.value;
    const semana = document.getElementById("selectSemanaTurma")?.value;
    if (!turma || !semana) return;
    const { dias, horarios, grade } =
        montarGradeTurma(
            BASE_GERAL,
            turma,
            semana
        );

    const aulas = getDadosTurma(turma, semana);
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
    const totalProfessores = new Set(aulas.map(a => a.professor)).size;
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
        `FICHA DA TURMA: ${turma}`,
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
    // CARDS
    // =====================================

    pdf.setDrawColor(180);
    pdf.roundedRect(15, 33, 55, 22, 2, 2);
    pdf.roundedRect(78, 33, 55, 22, 2, 2);
    pdf.roundedRect(141, 33, 55, 22, 2, 2);
    pdf.setFontSize(8);
    pdf.text("TOTAL DE AULAS",
        42.5, 38,
        { align: "center" }
    );

    pdf.text("PROFESSORES",
        105.5, 38,
        { align: "center" }
    );

    pdf.text("DIAS COM AULA",
        168.5, 38,
        { align: "center" }
    );

    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");

    pdf.text(String(totalAulas),
        42.5, 44,
        { align: "center" }
    );

    pdf.text(String(totalProfessores),
        105.5, 44,
        { align: "center" }
    );

    pdf.text(String(totalDias),
        168.5, 44,
        { align: "center" }
    );

    pdf.setFontSize(7);
    pdf.text(`Seg-Sex: ${totalAulasSegSex}`,
        42.5, 49,
        { align: "center" }
    );

    pdf.text(`Sáb: ${totalAulasSab}`,
        42.5, 53,
        { align: "center" }
    );

    pdf.setFont(undefined, "normal");

    // =====================================
    // CORPO
    // =====================================
    const body = horarios.map(h => {
        const separadores = {

            "__INTERVALO_1__":
                "INTERVALO",
            "__INTERVALO_2__":
                "INTERVALO",
            "__INTERVALO_3__":
                "INTERVALO",
            "__ALMOCO__":
                "ALMOÇO",
            "__JANTAR__":
                "JANTAR"
        };

        if (separadores[h]) {
            return [
                separadores[h],
                {
                    content:
                        separadores[h],
                    colSpan: 6,
                    styles: {halign:"center",
                    fontStyle:"bold",
                    fillColor:[241,245,249]
                    }
                }
            ];
        }

        const row = [h];

        dias.forEach(d => {
            let conteudo =
                grade[h]?.[d] || [];
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
                const nomeDia =
                    [
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
        head: [["Horário",...dias]
        ],

        body,
        startY: 60,
        theme: "grid",
        styles: {
            fontSize: 6,
            cellPadding: 1,
            valign: "middle",
            halign: "center"
        },

        headStyles: {
            fillColor: [21,128,61],
            textColor: [255,255,255]
        },

        columnStyles: {
            0: {cellWidth: 18},
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
                    [232,245,233];

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
        `${turma.replace(/\s+/g, '_')}_Semana_de_${semana.replace(/\//g, '-')}.pdf`;
    pdf.save(nomeArquivo);

}
