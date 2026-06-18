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
