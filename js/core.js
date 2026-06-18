function normalizarTexto(txt){
    return (txt || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/\s+/g, " ") // espaços duplos
        .trim()
        .toUpperCase();
}
  
function isFeriado(d){return FERIADOS.includes(d);}
