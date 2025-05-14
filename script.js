let valorHora = 0;
const registros = [];

document.getElementById("calcularValorHora").addEventListener("click", () => {
  const salario = parseFloat(document.getElementById("salario").value);
  const horasMensais = parseFloat(document.getElementById("horasMensais").value);
  if (salario > 0 && horasMensais > 0) {
    valorHora = salario / horasMensais;
    document.getElementById("valorHora").innerText = valorHora.toFixed(2);
  }
});

document.getElementById("registrarJornada").addEventListener("click", () => {
  const data = document.getElementById("data").value;
  const entrada = document.getElementById("entrada").value;
  const saidaIntervalo = document.getElementById("saidaIntervalo").value;
  const retornoIntervalo = document.getElementById("retornoIntervalo").value;
  const saidaFinal = document.getElementById("saidaFinal").value;

  if (!data || !entrada || !saidaIntervalo || !retornoIntervalo || !saidaFinal) {
    alert("Preencha todos os campos de horário.");
    return;
  }

  processarJornada(data, entrada, saidaIntervalo, retornoIntervalo, saidaFinal);
  atualizarTabela();
});

function processarJornada(data, entrada, saidaIntervalo, retornoIntervalo, saidaFinal) {
  const horas1 = calcularDiferenca(entrada, saidaIntervalo);
  const horas2 = calcularDiferenca(retornoIntervalo, saidaFinal);
  const totalHoras = horas1 + horas2;

  const horasExtras = totalHoras > 8 ? totalHoras - 8 : 0;
  const horasNoturnas = calcularHorasNoturnas(entrada, saidaIntervalo) + calcularHorasNoturnas(retornoIntervalo, saidaFinal);
  const tempoExtraNoturno = calcularTempoExtraNoturno(horasNoturnas);

  const adicionalNoturnoInput = parseFloat(document.getElementById("adicionalNoturno").value);
  const adicionalPercentual = isNaN(adicionalNoturnoInput) ? 0.2 : adicionalNoturnoInput / 100;

  const horasNormais = totalHoras - horasNoturnas;
  let ganho = (horasNormais * valorHora) + ((horasNoturnas + tempoExtraNoturno) * valorHora * (1 + adicionalPercentual));

  // Verificar se o dia é domingo (domingo é o índice 0 na função getDay())
  const diaDaSemana = new Date(data).getDay();
  if (diaDaSemana === 6) { // Se for domingo
    ganho *= 2; // Aplicar 100% de adicional, ou seja, dobrar o valor
    console.log(data);
    console.log(" dia da semana: ");
    console.log(diaDaSemana);
  }

  const registro = {
    data,
    totalHoras,
    horasExtras,
    horasNoturnas,
    tempoExtraNoturno,
    ganho
  };

  registros.push(registro);
}

function calcularDiferenca(horaInicio, horaFim) {
  const [h1, m1] = horaInicio.split(":").map(Number);
  const [h2, m2] = horaFim.split(":").map(Number);
  const hoje = new Date();
  let inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), h1, m1);
  let fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), h2, m2);
  if (fim <= inicio) fim.setDate(fim.getDate() + 1);
  return (fim - inicio) / (1000 * 60 * 60);
}

function calcularHorasNoturnas(horaInicio, horaFim) {
  const [h1, m1] = horaInicio.split(":").map(Number);
  const [h2, m2] = horaFim.split(":").map(Number);
  let inicio = new Date(2000, 0, 1, h1, m1);
  let fim = new Date(2000, 0, 1, h2, m2);
  if (fim <= inicio) fim.setDate(fim.getDate() + 1);

  let horasNoturnas = 0;
  const passo = 15 * 60 * 1000;
  for (let t = inicio.getTime(); t < fim.getTime(); t += passo) {
    const hora = new Date(t).getHours();
    if (hora >= 22 || hora < 5) {
      horasNoturnas += passo;
    }
  }
  return horasNoturnas / (1000 * 60 * 60);
}

function calcularTempoExtraNoturno(horasNoturnas) {
  return horasNoturnas / 7;
}

function formatarHorasEmTempo(horas) {
  const horasInteiras = Math.floor(horas);
  const minutos = Math.round((horas - horasInteiras) * 60);
  return `${String(horasInteiras).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function atualizarTabela() {
  const corpoTabela = document.getElementById("corpoTabela");
  corpoTabela.innerHTML = "";

  let totalHoras = 0;
  let totalExtras = 0;
  let totalNoturnas = 0;
  let totalAdicional = 0;
  let totalGanhos = 0;

  registros.forEach(reg => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${reg.data}</td>
      <td>${formatarHorasEmTempo(reg.totalHoras)}</td>
      <td>${formatarHorasEmTempo(reg.horasExtras)}</td>
      <td>${formatarHorasEmTempo(reg.horasNoturnas)}</td>
      <td>${formatarHorasEmTempo(reg.tempoExtraNoturno)}</td>
      <td>R$ ${reg.ganho.toFixed(2)}</td>
    `;
    corpoTabela.appendChild(tr);

    totalHoras += reg.totalHoras;
    totalExtras += reg.horasExtras;
    totalNoturnas += reg.horasNoturnas;
    totalAdicional += reg.tempoExtraNoturno;
    totalGanhos += reg.ganho;
  });

  document.getElementById("totalHoras").textContent = formatarHorasEmTempo(totalHoras);
  document.getElementById("totalExtras").textContent = formatarHorasEmTempo(totalExtras);
  document.getElementById("totalNoturnas").textContent = formatarHorasEmTempo(totalNoturnas);
  document.getElementById("totalAdicional").textContent = formatarHorasEmTempo(totalAdicional);
  document.getElementById("totalGanhos").textContent = `R$ ${totalGanhos.toFixed(2)}`;
}

document.getElementById("inputExcel").addEventListener("change", handleFile, false);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

      const headers = jsonData[0].map(h => h.toLowerCase().trim());
      const colIndex = name => headers.indexOf(name.toLowerCase());

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const data = row[colIndex("data")];
        const entrada = row[colIndex("entrada")];
        const saidaIntervalo = row[colIndex("saidaintervalo")];
        const retornoIntervalo = row[colIndex("retornointervalo")];
        const saidaFinal = row[colIndex("saidafinal")];

        if (data && entrada && saidaIntervalo && retornoIntervalo && saidaFinal) {
          processarJornada(data, entrada, saidaIntervalo, retornoIntervalo, saidaFinal);
        }
      }

      atualizarTabela();
    } catch (err) {
      alert("Erro ao processar planilha: " + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}
