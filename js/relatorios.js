// =====================================================
// RELATÓRIOS - IFRO SYSTEM
// Disciplina / Professor / Turma
// =====================================================

window.RELATORIOS_CACHE = [];
window.TIPO_RELATORIO_ATUAL = "DISCIPLINA";

// =====================================================
// INICIALIZAÇÃO
// =====================================================

function initRelatorios() {
    if (!window.BASE_GERAL) {
        console.warn("BASE_GERAL ainda não carregada");
        return;
    }

    montarCacheRelatorios();
    trocarTipoRelatorio();
}

// =====================================================
// CACHE BASE (reutiliza BASE_GERAL)
// =====================================================

function montarCacheRelatorios() {

    const mapa = new Map();

    BASE_GERAL.forEach(a => {

        if (!a.valor || !a.data) return;

        const valor = a.valor.trim();

        if (!valor.includes(" - ")) return;

        let [disciplina, professor] = valor.split(" - ");

        disciplina = (disciplina || "").trim();
        professor = normalizarProfessor(professor);

        const chave = `${disciplina}__${professor}__${a.turma}`;

        if (!mapa.has(chave)) {

            mapa.set(chave, {
                disciplina,
                professor,
                turma: a.turma,
                datas: [],
                eventos: []
            });

        }

        mapa.get(chave).datas.push(a.data);

        // tipo de aula
        const tipo = identificarTipoAula(valor);

        mapa.get(chave).eventos.push({
            data: a.data,
            horario: a.horario,
            tipo,
            valor
        });
    });

    RELATORIOS_CACHE = Array.from(mapa.values());

    console.log("RELATORIOS CACHE:", RELATORIOS_CACHE.length);
}

// =====================================================
// NORMALIZAÇÕES
// =====================================================

function normalizarProfessor(nome) {

    if (!nome) return "";

    return nome
        .replace(/\[.*?\]/g, "")
        .replace(/\*/g, "")
        .replace(/\(.*?\)/g, "")
        .trim();
}

function identificarTipoAula(valor) {

    const v = (valor || "").toUpperCase();

    if (v.includes("[REC]") || v.includes("RECUPERA")) return "REC";
    if (v.includes("[EX]") || v.includes("EXAME")) return "EX";
    if (v.includes("[R]")) return "REP";
    if (v.includes("[+]")) return "EXTRA";

    return "NORMAL";
}

// =====================================================
// TROCA DE TIPO DE RELATÓRIO
// =====================================================

function trocarTipoRelatorio() {

    const tipo = document.getElementById("selectTipoRelatorio").value;

    TIPO_RELATORIO_ATUAL = tipo;

    document.getElementById("filtrosRelatorio").innerHTML = "";

    if (tipo === "DISCIPLINA") {
        renderFiltroDisciplina();
        renderRelatorioDisciplina();
    }

    if (tipo === "PROFESSOR") {
        renderFiltroProfessor();
        renderRelatorioProfessor();
    }

    if (tipo === "TURMA") {
        renderFiltroTurma();
        renderRelatorioTurma();
    }
}

// =====================================================
// FILTROS
// =====================================================

function renderFiltroDisciplina() {

    const container = document.getElementById("filtrosRelatorio");

    const turmas = [...new Set(RELATORIOS_CACHE.map(r => r.turma))];

    container.innerHTML = `
        <select id="filtroTurma" onchange="renderRelatorioDisciplina()">
            <option value="">Selecione Turma</option>
            ${turmas.map(t => `<option value="${t}">${t}</option>`).join("")}
        </select>

        <select id="filtroDisciplina" onchange="renderRelatorioDisciplina()">
            <option value="">Selecione Disciplina</option>
        </select>
    `;
}

function renderFiltroProfessor() {

    const container = document.getElementById("filtrosRelatorio");

    const professores = [...new Set(RELATORIOS_CACHE.map(r => r.professor))];

    container.innerHTML = `
        <select id="filtroProfessor" onchange="renderRelatorioProfessor()">
            <option value="">Selecione Professor</option>
            ${professores.map(p => `<option value="${p}">${p}</option>`).join("")}
        </select>
    `;
}

function renderFiltroTurma() {

    const container = document.getElementById("filtrosRelatorio");

    const turmas = [...new Set(RELATORIOS_CACHE.map(r => r.turma))];

    container.innerHTML = `
        <select id="filtroTurma" onchange="renderRelatorioTurma()">
            <option value="">Selecione Turma</option>
            ${turmas.map(t => `<option value="${t}">${t}</option>`).join("")}
        </select>
    `;
}

// =====================================================
// RELATÓRIO POR DISCIPLINA
// =====================================================

function renderRelatorioDisciplina() {

    const turma = document.getElementById("filtroTurma")?.value;
    const disciplinaSelect = document.getElementById("filtroDisciplina");

    let base = RELATORIOS_CACHE;

    if (turma) {
        base = base.filter(b => b.turma === turma);
    }

    const disciplinas = [...new Set(base.map(b => b.disciplina))];

    if (disciplinaSelect) {
        disciplinaSelect.innerHTML = `
            <option value="">Selecione Disciplina</option>
            ${disciplinas.map(d => `<option value="${d}">${d}</option>`).join("")}
        `;
    }

    const disciplina = disciplinaSelect?.value;

    let dados = base;

    if (disciplina) {
        dados = dados.filter(d => d.disciplina === disciplina);
    }

    renderTabelaRelatorio(dados);
}

// =====================================================
// RELATÓRIO POR PROFESSOR
// =====================================================

function renderRelatorioProfessor() {

    const professor = document.getElementById("filtroProfessor")?.value;

    let dados = RELATORIOS_CACHE;

    if (professor) {
        dados = dados.filter(d => d.professor === professor);
    }

    renderTabelaRelatorio(dados);
}

// =====================================================
// RELATÓRIO POR TURMA
// =====================================================

function renderRelatorioTurma() {

    const turma = document.getElementById("filtroTurma")?.value;

    let dados = RELATORIOS_CACHE;

    if (turma) {
        dados = dados.filter(d => d.turma === turma);
    }

    renderTabelaRelatorio(dados);
}

// =====================================================
// TABELA PRINCIPAL (REAPROVEITÁVEL)
// =====================================================

function renderTabelaRelatorio(dados) {

    const container = document.getElementById("tabelaRelatorio");

    container.innerHTML = "";

    const tabela = document.createElement("table");

    tabela.style.width = "100%";
    tabela.style.borderCollapse = "collapse";

    tabela.innerHTML = `
        <thead>
            <tr>
                <th>Disciplina</th>
                <th>Professor</th>
                <th>Turma</th>
                <th>Período</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = tabela.querySelector("tbody");

    dados.forEach(item => {

        const datas = item.datas
            .map(d => parseDataBR(d))
            .filter(Boolean)
            .sort((a,b) => a - b);

        const inicio = datas[0];
        const fim = datas[datas.length - 1];

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.disciplina}</td>
            <td>${item.professor}</td>
            <td>${item.turma}</td>
            <td>${formatarData(inicio)} → ${formatarData(fim)}</td>
        `;

        tbody.appendChild(tr);
    });

    container.appendChild(tabela);

    document.getElementById("resumoRelatorio").innerText =
        `Total de registros: ${dados.length}`;
}

// =====================================================
// HELPERS (reaproveitando padrão do seu sistema)
// =====================================================

function parseDataBR(str) {
    if (!str) return null;
    const [d,m,a] = str.split("/");
    return new Date(a, m-1, d);
}

function formatarData(d) {
    if (!d) return "";
    return d.toLocaleDateString("pt-BR");
}

// =====================================================
// EXPORT PDF (placeholder pronto)
// =====================================================

function exportarRelatorioAtualPDF() {

    alert("PDF será implementado na próxima etapa (já estruturado)");
}

// =====================================================
// INIT AUTOMÁTICO
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initRelatorios, 500);
});
