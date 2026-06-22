async function carregarIntegrado(){
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS.INTEGRADO.id}/export?format=csv&gid=${SHEETS.INTEGRADO.gid}`;
  const res = await fetch(url);
  
  // 🔥 Aplica o preenchimento aqui
  dadosIntegrado = aplicarPreenchimentoParaBaixo(parseCSV(await res.text()));

  const processado = processarBaseModalidade(dadosIntegrado);
  semanasIntegrado = processado.semanas;
  turmasIntegrado = processado.turmas;
}

async function carregarSuperior(){
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS.SUPERIOR.id}/export?format=csv&gid=${SHEETS.SUPERIOR.gid}`;
  const res = await fetch(url);
  
  // 🔥 Aplica o preenchimento aqui
  dadosSuperior = aplicarPreenchimentoParaBaixo(parseCSV(await res.text()));

  const processado = processarBaseModalidade(dadosSuperior);
  semanasSuperior = processado.semanas;
  turmasSuperior = processado.turmas;
}

async function carregarProfessores(){
    const url = 
      `https://docs.google.com/spreadsheets/d/${SHEETS.PROFESSORES.id}/export?format=csv&gid=${SHEETS.PROFESSORES.gid}`;

    const res = await fetch(url);
    const text = await res.text();

    const raw = parseCSV(text);

    console.log("PROF RAW:", raw);

    dadosProfessores = raw;

    listaProfessores = raw
        .slice(1)
        .map(l => l[0])
        .filter(n => n && n.trim() !== "");

    console.log("LISTA PROFESSORES:", listaProfessores);
}
  
async function init(){

  document.getElementById('searchProf').value = "";

  limparSnapshotsInvalidos();

  const mod = document.getElementById('selectModalidade').value;

  document.getElementById("painelAlteracoes").style.display = "none";

  window.trocouModalidade = true;

  const url = `https://docs.google.com/spreadsheets/d/${SHEETS[mod].id}/export?format=csv&gid=${SHEETS[mod].gid}`;
  const res = await fetch(url);

  dadosGlobais = parseCSV(await res.text());

  processarDados();

  await carregarIntegrado();
  await carregarSuperior();

  // 🔥 FALTAVA AQUI
  await carregarProfessores();

montarBaseGeral(
    dadosIntegrado,
    dadosSuperior
);
montarRelatorioBase();
montarCacheRelatorioDisciplinas();

// PROFESSORES
carregarListaProfessores();
carregarSemanasProfessor();

// TURMAS
carregarListaTurmas();
carregarSemanasTurma();

gerarDashboard();

esconderLoaderAbas();

  setTimeout(() => {
    verificarMudancaAoAbrir();
  }, 200);
}
  
function processarDados(){
semanasAgrupadas={};
turmasDaPlanilha=dadosGlobais[0].slice(2).filter(t=>t);
let ultima="";
for(let i=1;i<dadosGlobais.length;i++){
let r=[...dadosGlobais[i]];
if(r[0]) ultima=r[0];
r[0]=ultima;
if(!r[0]) continue;

const [d,m,a]=r[0].split('/');
const dt=new Date(a,m-1,d);
const seg=new Date(dt.setDate(dt.getDate()-dt.getDay()+1)).toLocaleDateString('pt-BR');

if(!semanasAgrupadas[seg]) semanasAgrupadas[seg]={dias:{}};
if(!semanasAgrupadas[seg].dias[r[0]]) semanasAgrupadas[seg].dias[r[0]]=[];
semanasAgrupadas[seg].dias[r[0]].push(r);
}

const sel=document.getElementById('selectSemana');
sel.innerHTML="";
const semanaAtual = getSemanaAtual();

ordenarDatasBR(Object.keys(semanasAgrupadas)).forEach(s=>{
  sel.innerHTML+=`<option value="${s}">Semana de ${s}</option>`;
});

/* 🔥 SELECIONA SEMANA ATUAL SE EXISTIR */
if(semanasAgrupadas[semanaAtual]){
  sel.value = semanaAtual;
}

renderizarTabela();
}
