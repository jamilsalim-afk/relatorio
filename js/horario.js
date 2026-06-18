function renderizarTabela(){

    const sem = document.getElementById('selectSemana').value;
    const dias = semanasAgrupadas[sem].dias;
    const container = document.getElementById('tabelaHorario');

    const modalidade =
        document.getElementById('selectModalidade').value;

    let alerta = '';

    if (
        modalidade === 'INTEGRADO' &&
        (
            sem === '22/06/2026' ||
            sem === '29/06/2026' ||
            sem === '30/11/2026' ||
            sem === '07/12/2026'
        )
    ) {
        alerta = `
        <div style="
            background:#fff3cd;
            border:3px solid #ff9800;
            color:#7a4f00;
            padding:15px;
            margin-bottom:10px;
            border-radius:8px;
            font-weight:bold;
            text-align:center;
            font-size:18px;
        ">
            ⚠️ ATENÇÃO: ESTA É UMA SEMANA DE RECUPERAÇÃO DOS CURSOS TÉCNICOS INTEGRADOS
        </div>`;
    }

    if (
        modalidade === 'SUPERIOR' &&
        (
            sem === '29/06/2026' ||
            sem === '07/12/2026'
        )
    ) {
        alerta = `
        <div style="
            background:#ffebee;
            border:3px solid #d32f2f;
            color:#b71c1c;
            padding:15px;
            margin-bottom:10px;
            border-radius:8px;
            font-weight:bold;
            text-align:center;
            font-size:18px;
        ">
            🚨 ATENÇÃO: ESTA É UMA SEMANA DE EXAMES DOS CURSOS SUPERIORES
        </div>`;
    }

    document.getElementById('alertaSemanaEspecial').innerHTML = alerta;

    const busca =
        normalizarTexto(
            document.getElementById('searchProf')?.value || ''
        );

    let turmasAtivas =
        modalidade === "SUPERIOR"
            ? getTurmasAtivasNaSemana(dias)
            : [...turmasDaPlanilha];

    // ======================================================
    // 🔥 FILTRO - OCULTAR TURMAS SEM OCORRÊNCIA
    // ======================================================

    if (busca) {

        turmasAtivas = turmasAtivas.filter(turma => {

            const idx =
                dadosGlobais[0].indexOf(turma);

            return Object.values(dias).some(linhas => {

                return linhas.some(r => {

                    const val =
                        normalizarTexto(
                            r[idx] || ""
                        );

                    return val.includes(busca);

                });

            });

        });

    }

    const nomes = [
        "DOMINGO",
        "SEGUNDA-FEIRA",
        "TERÇA-FEIRA",
        "QUARTA-FEIRA",
        "QUINTA-FEIRA",
        "SEXTA-FEIRA",
        "SÁBADO"
    ];

    const regrasDestaque = [
        { match: v => v.includes("RESERVA ENSINO"), classe: "reserva-ensino" },
        { match: v => v.includes("PPS/ATENDIMENTO"), classe: "pps" },
        { match: v => v.includes("ESTUDOS INDIVIDUAIS"), classe: "estudos" },
        { match: v => v.includes("REUNIAO DE SERVIDORES"), classe: "reuniao" },
        { match: v => v.includes("CAED") || v.includes("PRE-CONSELHO"), classe: "caed" },
        { match: v => v.includes("_REP -"), classe: "reposicao" }
    ];

    let html = "";

    Object.keys(dias).forEach(dia => {

        const p = dia.split('/');
        const dObj = new Date(
            p[2],
            p[1] - 1,
            p[0]
        );

        // ======================================================
        // 🔥 FILTRO - OCULTAR HORÁRIOS SEM OCORRÊNCIA
        // ======================================================

        let linhas = dias[dia];

        if (busca) {

            linhas = linhas.filter(r => {

                return r.some(c =>
                    normalizarTexto(
                        String(c || "")
                    ).includes(busca)
                );

            });

            // 🔥 OCULTA DIA INTEIRO
            if (!linhas.length) {
                return;
            }

        }

        if (isFeriado(dia)) {

            html += `
            <table>
                <tr class="day-divider">
                    <td colspan="${turmasAtivas.length + 1}">
                        ${nomes[dObj.getDay()]} - ${dia}
                    </td>
                </tr>

                <tr>
                    <td colspan="${turmasAtivas.length + 1}" class="feriado">
                        FERIADO
                    </td>
                </tr>
            </table><br>`;

            return;
        }

        html += `<table>`;

        html += `
        <tr class="day-divider">
            <td colspan="${turmasAtivas.length + 1}">
                ${nomes[dObj.getDay()]} - ${dia}
            </td>
        </tr>`;

        html += `
        <tr>
            <th class="time-col">Horário</th>`;

        turmasAtivas.forEach(t => {

            html += `
            <th
    class="${getCursoInfo(t).cl}"
    title="${t}"
    style="width:180px"
>
                ${typeof abreviarTurma === 'function'
                    ? abreviarTurma(t)
                    : t}
            </th>`;
        });

        html += `</tr>`;

        linhas.forEach(r => {

            const horario = r[1] || "";

            const isInt =
                horario.toUpperCase().includes("INTERVALO");

            html += `
            <tr class="${isInt ? 'intervalo' : ''}">
                <td class="time-col">${horario}</td>`;

            turmasAtivas.forEach(turma => {

                const idx =
                    dadosGlobais[0].indexOf(turma);

                let val =
                    (r[idx] || "").trim();

                const valNorm =
                    normalizarTexto(val);

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

                // ======================================================
                // 🔥 MESMO EFEITO DOS SÁBADOS
                // ======================================================

                if (busca) {

                    if (contemBusca) {
                        classesExtras.push("highlight");
                    } else {
                        classesExtras.push("opaco");
                    }

                }

                html += `
                <td class="
                    aula-cell
                    ${getCursoInfo(turma).cl}
                    ${classesExtras.join(" ")}
                ">
                    ${val}
                </td>`;
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
            Nenhum resultado encontrado.
        </div>`;
    }

container.innerHTML = html;

criarBotoesDias();
  
}

function exportarPDF(){
const { jsPDF } = window.jspdf;
const pdf = new jsPDF('l','mm','a4');

const sem = document.getElementById('selectSemana').value;
const diasObj = semanasAgrupadas[sem].dias;

const turmasAtivas = document.getElementById('selectModalidade').value === "SUPERIOR"
? getTurmasAtivasNaSemana(diasObj)
: turmasDaPlanilha;

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

Object.keys(diasObj).forEach((dia,i)=>{

if(i>0) pdf.addPage();

const pageWidth = pdf.internal.pageSize.getWidth();

/* =========================
   🔥 SEU CABEÇALHO ORIGINAL
========================= */
pdf.setFontSize(9);
pdf.text("INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO",pageWidth/2,8,{align:'center'});
pdf.text("CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE",pageWidth/2,12,{align:'center'});
pdf.text(`SEMANA: ${sem}`,pageWidth/2,16,{align:'center'});

/* DIA */
const p = dia.split('/');
const dObj = new Date(p[2],p[1]-1,p[0]);

pdf.setFontSize(14);
pdf.setTextColor(46,125,50);
pdf.setFont(undefined,'bold');
pdf.text(`${nomes[dObj.getDay()]} - ${dia}`, pageWidth/2, 24, {align:'center'});
pdf.setTextColor(0,0,0);
pdf.setFont(undefined,'normal');

/* FERIADO */
if(isFeriado(dia)){
pdf.setFontSize(60);
pdf.text("FERIADO", pageWidth/2, 100, {align:'center'});
return;
}

/* DADOS */
const body = diasObj[dia].map(r=>{
let line=[r[1]];
turmasAtivas.forEach(t=>{
const idx = dadosGlobais[0].indexOf(t);
line.push((r[idx]||"").trim());
});
return line;
});

/* =========================
   🔥 TABELA OTIMIZADA
========================= */
pdf.autoTable({
head:[['Horário',...turmasAtivas]],
body:body,
startY:28,

theme:'grid',

/* 🔥 MARGENS 0,2cm (2mm) */
margin:{ top: 28, left: 2, right: 2, bottom: 2 },

/* 🔥 GRADE MAIS LEVE */
tableLineColor:[200,200,200],
tableLineWidth:0.1,

styles:{
fontSize:4.5,
halign:'center',
valign:'middle',
cellPadding:1
},

/* 🔥 CABEÇALHO LIMPO */
headStyles:{
fillColor:[46,125,50],
textColor:[0,0,0],
fontStyle:'bold',
lineColor:[200,200,200],
lineWidth:0.1
},

/* 🔥 COLUNA HORÁRIO MENOR */
columnStyles:{
0:{ cellWidth:16 }
},

didParseCell:(data)=>{

const col = data.column.index;

/* cores por curso */
if(col>0){
const curso = getCursoInfo(turmasAtivas[col-1]);
data.cell.styles.fillColor = curso.rgb;
}

/* regras de destaque */
const txt = (data.cell.raw||"").toString();
const classe = detectarClasse(txt);

if(classe && coresPDF[classe]){
data.cell.styles.fillColor = coresPDF[classe];

if(classe==="pps" || classe==="reposicao"){
data.cell.styles.textColor=[255,255,255];
data.cell.styles.fontStyle="bold";
}
}

/* 🔥 LINHAS VAZIAS MENOR POSSÍVEL */
const vazio = data.row.raw.slice(1).every(v=>!v||v.trim()==="");

if(vazio){
data.cell.styles.minCellHeight = 1.5;
data.cell.styles.fontSize = 3.5;
}

/* intervalo leve */
const t = txt.toUpperCase();
if(t.includes("INTERVALO")||t.includes("[+]")||t.includes("*")||t.includes("[R]")){
data.cell.styles.fillColor=[235,235,235];
}
}
});

/* =========================
   🔥 SEU RODAPÉ ORIGINAL
========================= */
pdf.setFontSize(8);
pdf.text(
"IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br",
pageWidth/2,
205,
{align:'center'}
);

});

const mod = document.getElementById('selectModalidade').value;
const nomeArquivo = `HORÁRIO ${mod} - SEMANA DE ${sem}`;
pdf.save(nomeArquivo);
}
