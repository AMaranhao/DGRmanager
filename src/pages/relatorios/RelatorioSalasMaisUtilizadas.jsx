import "@/styles/pages/relatorios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/buttons.css";

import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter } from "date-fns";
import { X, Printer } from "lucide-react";

export default function RelatorioSalasMaisUtilizadas() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ordem, setOrdem] = useState("desc");

  useEffect(() => {
    carregarEmprestimos();
  }, []);

  const carregarEmprestimos = async () => {
    const dados = await fetchEmprestimos();
    setEmprestimos(dados);
  };

  const emprestimosFiltrados = emprestimos.filter((emp) => {
    const retirada = emp.horario_retirada ? parseISO(emp.horario_retirada) : null;
    let inicio = dataInicio ? parseISO(dataInicio) : null;
    let fim = dataFim ? parseISO(dataFim) : null;
    if (inicio && fim && isAfter(inicio, fim)) [inicio, fim] = [fim, inicio];

    const dentroDataInicio = inicio ? isAfter(retirada, inicio) : true;
    const dentroDataFim = fim ? isAfter(fim, retirada) : true;

    return dentroDataInicio && dentroDataFim;
  });

  const agruparPorSala = () => {
    const agrupado = {};
    emprestimosFiltrados.forEach((emp) => {
      if (!emp.sala?.numero) return;
      agrupado[emp.sala.numero] = (agrupado[emp.sala.numero] || 0) + 1;
    });
    return agrupado;
  };

  const dadosAgrupados = agruparPorSala();
  const salasOrdenadas = Object.entries(dadosAgrupados).sort(
    ([, a], [, b]) => (ordem === "desc" ? b - a : a - b)
  );

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="relatorios-titulo">Salas Mais Utilizadas</h2>
        <button onClick={handleImprimir} className="btn-imprimir">
          <Printer size={18} />
          Imprimir
        </button>
      </div>

      {/* Filtros */}
      <div className="filtro-container">
        {/* Data Início */}
        <div className="relatorios-filtro-group relatorios-filtro-text">
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {dataInicio && (
            <button type="button" onClick={() => setDataInicio("")} className="dashboard-filtro-clear" title="Limpar">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Data Fim */}
        <div className="relatorios-filtro-group relatorios-filtro-text">
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {dataFim && (
            <button type="button" onClick={() => setDataFim("")} className="dashboard-filtro-clear" title="Limpar">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Ordem */}
        <div className="relatorios-filtro-group relatorios-filtro-text">
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className="dashboard-select"
          >
            <option value="desc">Mais utilizadas primeiro</option>
            <option value="asc">Menos utilizadas primeiro</option>
          </select>
        </div>
      </div>

      {/* Resultado */}
      {salasOrdenadas.length === 0 ? (
        <div className="relatorios-sem-dados">
          Nenhum dado encontrado nesse período.
        </div>
      ) : (
        <div className="relatorios-grid">
          {salasOrdenadas.map(([sala, quantidade]) => (
            <div key={sala} className="relatorios-cartao">
              <h3 className="relatorios-cartao-nome">Sala: {sala}</h3>
              <p className="relatorios-info">Utilizações: {quantidade}</p>
            </div>
          ))}
        </div>
      )}

      {/* Total geral */}
      {salasOrdenadas.length > 0 && (
        <div className="relatorios-total-final">
          Total Geral de Utilizações: {salasOrdenadas.reduce((acc, [, quant]) => acc + quant, 0)}
        </div>
      )}
    </div>
  );
}
