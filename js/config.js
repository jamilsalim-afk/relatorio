const SHEETS={
INTEGRADO:{id:'1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8',gid:'1357770092'},
SUPERIOR:{id:'14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg',gid:'669887707'},
PROFESSORES:{id:'1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s',gid:'1694280391'}
};

let dadosGlobais = [];

let dadosIntegrado = [];
let dadosSuperior = [];
let dadosProfessores = [];
let listaProfessores = [];

let turmasDaPlanilha = [];
let semanasAgrupadas = [];

let BASE_GERAL = [];
let INDEX_PROFESSOR = {};
let INDEX_TURMA = {};
let RELATORIO_DISCIPLINAS = [];

let semanasIntegrado = {};
let semanasSuperior = {};

let turmasIntegrado = [];
let turmasSuperior = [];

let timerBuscaEstatistica = null;

const FERIADOS=[
"01/01/2026","16/02/2026","17/02/2026","18/02/2026","03/04/2026","20/04/2026","21/04/2026","01/05/2026",
"04/06/2026","05/06/2026","07/09/2026","12/10/2026","02/11/2026",
"15/11/2026","25/12/2026"
];
