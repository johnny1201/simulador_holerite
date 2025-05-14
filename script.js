function calcularValorHora() {
  const salario = parseFloat(document.getElementById("salario").value);
  const horasSemana = parseFloat(document.getElementById("horasSemana").value);
  const resultadoEl = document.getElementById("resultado");

  if (isNaN(salario) || isNaN(horasSemana) || salario <= 0 || horasSemana <= 0) {
    resultadoEl.textContent = "Por favor, preencha todos os campos corretamente.";
    return;
  }

  const horasMes = horasSemana * 4.5; // Aproximando mês como 4.5 semanas
  const valorHora = salario / horasMes;

  resultadoEl.textContent = `Valor estimado da sua hora trabalhada: R$ ${valorHora.toFixed(2)}`;
}
