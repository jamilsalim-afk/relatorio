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

function parseCSV(text){
return text.split(/\r?\n/).map(l=>{
let r=[],c='',q=false;
for(let i=0;i<l.length;i++){
let ch=l[i];
if(ch=='"') q=!q;
else if(ch==','&&!q){r.push(c.trim());c='';}
else c+=ch;
}
r.push(c.trim());
return r;
});
}

  function aplicarPreenchimentoParaBaixo(data) {
    // Começa de 1 para pular o cabeçalho
    let ultimaData = "";
    let ultimoHorario = "";

    for (let i = 1; i < data.length; i++) {
        let row = data[i];
        // Coluna 0 = Data, Coluna 1 = Horário (ajuste se a ordem for diferente no seu CSV)
        if (row[0] && row[0].trim() !== "") ultimaData = row[0];
        else row[0] = ultimaData;

        if (row[1] && row[1].trim() !== "") ultimoHorario = row[1];
        else row[1] = ultimoHorario;
    }
    return data;
}
