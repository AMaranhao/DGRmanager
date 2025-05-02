import "@/styles/pages/relatorios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/buttons.css";

import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter } from "date-fns";
import { X, Printer } from "lucide-react";

export default function RelatorioHistoricoUtilizacaoSala() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [salaSelecionada, setSalaSelecionada] = useState("");

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
    const correspondeSala = salaSelecionada ? emp.sala?.numero === salaSelecionada : true;

    return dentroDataInicio && dentroDataFim && correspondeSala;
  });

  const agruparPorSala = () => {
    const agrupado = {};
    emprestimosFiltrados.forEach((emp) => {
      if (!emp.sala?.numero || !emp.usuario) return;
      const sala = emp.sala.numero;
      agrupado[sala] = agrupado[sala] || {};
      agrupado[sala][emp.usuario] = (agrupado[sala][emp.usuario] || 0) + 1;
    });
    return agrupado;
  };

  const dadosAgrupados = agruparPorSala();
  const salasDisponiveis = Array.from(new Set(emprestimos.map(emp => emp.sala?.numero))).filter(Boolean).sort();

  const handleImprimir = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="relatorios-titulo">Histórico de Utilização por Sala</h2>
        <button onClick={handleImprimir} className="btn-imprimir">
          <Printer size={18} />
          Imprimir
        </button>
      </div>

      {/* Filtros */}
      <div className="filtro-container">
        <div className="relatorios-filtro-group relatorios-filtro-text">
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {dataInicio && (
            <button
              type="button"
              onClick={() => setDataInicio("")}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relatorios-filtro-group relatorios-filtro-text">
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {dataFim && (
            <button
              type="button"
              onClick={() => setDataFim("")}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relatorios-filtro-group relatorios-filtro-text">
          <select
            value={salaSelecionada}
            onChange={(e) => setSalaSelecionada(e.target.value)}
            className="dashboard-select"
          >
            <option value="">Todas as Salas</option>
            {salasDisponiveis.map((sala) => (
              <option key={sala} value={sala}>{sala}</option>
            ))}
          </select>
          {salaSelecionada && (
            <button
              type="button"
              onClick={() => setSalaSelecionada("")}
              className="dashboard-filtro-clear"
              title="Limpar Sala"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      {Object.keys(dadosAgrupados).length === 0 ? (
        <div className="relatorios-sem-dados">
          Nenhum empréstimo encontrado.
        </div>
      ) : (
        <div className="relatorios-grid">
          {Object.entries(dadosAgrupados).sort().map(([sala, usuarios]) => {
            const total = Object.values(usuarios).reduce((acc, qtd) => acc + qtd, 0);
            return (
              <div key={sala} className="relatorios-cartao">
                <h3 className="relatorios-cartao-nome">Sala {sala}</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  {Object.entries(usuarios).map(([usuario, qtd]) => (
                    <p key={usuario}>
                      <strong>{usuario}:</strong> {qtd} utilização(ões)
                    </p>
                  ))}
                  <p className="mt-2 font-semibold text-blue-700">
                    Total: {total} utilização(ões)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
