const CALENDARIO_LETIVO = {
  INTEGRADO: {
    semestres: [
      { inicio: "10/02/2026", fim: "20/06/2026" },
      { inicio: "22/07/2026", fim: "27/11/2026" }
    ]
  },

  SUPERIOR: {
    semestres: [
      { inicio: "09/02/2026", fim: "26/06/2026" },
      { inicio: "22/07/2026", fim: "04/12/2026" }
    ]
  }
};

function dentroPeriodoLetivo(dataStr, modalidade){

  const [d,m,a] = dataStr.split('/');
  const data = new Date(a, m-1, d);
  data.setHours(0,0,0,0);

  const periodos = CALENDARIO_LETIVO[modalidade].semestres;

  return periodos.some(p => {

    const [di,mi,ai] = p.inicio.split('/');
    const inicio = new Date(ai, mi-1, di);

    const [df,mf,af] = p.fim.split('/');
    const fim = new Date(af, mf-1, df);

    inicio.setHours(0,0,0,0);
    fim.setHours(23,59,59,999);

    return data >= inicio && data <= fim;
  });
}

function gerarDashboard(){

    const integrado = calcularIndicadores(dadosIntegrado, "INTEGRADO");

    const superior = calcularIndicadores(dadosSuperior, "SUPERIOR");

    const agora =
        new Date().toLocaleString("pt-BR");

    document.getElementById(
        "dashboardContent"
    ).innerHTML = `

    <div class="dashboard-header">

        <h1>📊 Dashboard Acadêmico 2026</h1>

        <p>
            Última atualização:
            ${agora}
        </p>

    </div>

    <div class="dashboard-grid">

        <!-- COLUNA INTEGRADO -->

        <div class="dashboard-column">

            <div class="dashboard-panel">

                <h2>🎓 Integrado</h2>

                <div class="dashboard-card card-dias">
                    Dias Letivos
                    <strong>${integrado.diasLetivos}</strong>
                    ${gerarBarraProgresso(integrado.diasLetivos,200)}
                </div>

                <div class="dashboard-card card-aulas">
                    Quantidade de Aulas
                    <strong>${integrado.aulas}</strong>
                </div>

                <div class="dashboard-card card-vagas">
                    Aulas Vagas
                    <strong>${integrado.vagas}</strong>
                </div>

                <div class="dashboard-card card-sabados">
                    Sábados Letivos
                    <strong>${integrado.sabados}</strong>
                </div>

            </div>

        </div>

        <!-- COLUNA SUPERIOR -->

        <div class="dashboard-column">

            <div class="dashboard-panel">

                <h2>🎓 Superior</h2>

                <div class="dashboard-card card-dias">
                    Dias Letivos
                    <strong>${superior.diasLetivos}</strong>
                    ${gerarBarraProgresso(superior.diasLetivos,100)}
                </div>

                <div class="dashboard-card card-aulas">
                    Quantidade de Aulas
                    <strong>${superior.aulas}</strong>
                </div>

                <div class="dashboard-card card-vagas">
                    Aulas Vagas
                    <strong>${superior.vagas}</strong>
                </div>

                <div class="dashboard-card card-sabados">
                    Sábados Letivos
                    <strong>${superior.sabados}</strong>
                </div>

            </div>

        </div>

        <!-- COLUNA GERAL -->

<div class="dashboard-column">

    <div class="dashboard-panel">

        <h2>📋 Informações Gerais</h2>

       <div class="info-card">
            📚 1º Semestre
            <br>
            Fevereiro → Julho
        </div>

        <div class="info-card">
            📚 2º Semestre
            <br>
            Julho → Dezembro
        </div>

    </div>

    <div class="dashboard-panel">

        <h2>🔄 Recuperação Integrado</h2>

        <div class="recuperacao-card">
            22/06 → 04/07
        </div>

        <div class="recuperacao-card">
            30/11 → 08/12
        </div>

    </div>

    <div class="dashboard-panel">

        <h2>📝 Exames</h2>

        <div class="exame-card">
            Integrado
            <br>
            09/12 → 11/12
        </div>

        <div class="exame-card">
            Superior
            <br>
            29/06 → 04/07
        </div>

        <div class="exame-card">
            Superior
            <br>
            07/12 → 11/12
        </div>

    </div>

</div>
    `;
}
  
function cardDashboard(titulo,d){

return `
<div class="dash-card">

<h2>${titulo}</h2>

<div class="dash-item">
  <span>Dias Letivos</span>
  <strong>${d.diasLetivos}</strong>
</div>

<div class="dash-item">
  <span>Quantidade de Aulas</span>
  <strong>${d.aulas}</strong>
</div>

<div class="dash-item">
  <span>Aulas Vagas</span>
  <strong>${d.vagas}</strong>
</div>

<div class="dash-item">
  <span>Sábados Letivos</span>
  <strong>${d.sabados}</strong>
</div>

</div>
`;
}

function calcularIndicadores(dados, modalidade){

  let diasLetivos = new Set();
  let sabadosComAula = new Set();

  let aulas = 0;
  let vagas = 0;

  const hoje = new Date();
  hoje.setHours(23,59,59,999);

  let ultimaData = "";

  for(let i=1;i<dados.length;i++){

      const row = dados[i];

      if(row[0]) ultimaData = row[0];

      const dataStr = ultimaData;
      if(!dataStr) continue;

      const [d,m,a] = dataStr.split('/');
const data = new Date(a,m-1,d);

// ignora datas futuras
if(data > hoje) continue;

// 🔥 NOVO: ignora fora do período letivo real
if(!dentroPeriodoLetivo(dataStr, modalidade)) continue;

// ignora feriados
if(isFeriado(dataStr)) continue;

      const horario = normalizarTexto(row[1] || "");

      // ignora linhas especiais
      const linhaIgnorada =
        horario.includes("INTERVALO") ||
        horario.includes("[+]") ||
        horario.includes("[R]") ||
        horario.includes("*");

      let temAulaNoDia = false;

      if(!linhaIgnorada){

          for(let j=2;j<row.length;j++){

              const val = (row[j] || "").trim();

              if(!val) continue;

              temAulaNoDia = true;

              aulas++;

              const norm = normalizarTexto(val);

              if(
                  norm.includes("RESERVA ENSINO") ||
                  norm.includes("ESTUDOS INDIVIDUAIS")
              ){
                  vagas++;
              }
          }
      }

      // 🔥 só conta o dia se tiver aula REAL
      if(temAulaNoDia){
          diasLetivos.add(dataStr);

          // 🔥 sábado letivo real (com aula)
          if(data.getDay() === 6){
              sabadosComAula.add(dataStr);
          }
      }
  }

  return {
      diasLetivos: diasLetivos.size,
      aulas,
      vagas,
      sabados: sabadosComAula.size
  };
}

function gerarBarraProgresso(valor,total){

    const percentual =
        Math.min(
            (valor/total)*100,
            100
        );

    return `
        <div class="progress-container">

            <div
                class="progress-bar"
                style="width:${percentual}%">
            </div>

        </div>

        <small>
            ${percentual.toFixed(1)}%
        </small>
    `;
}
