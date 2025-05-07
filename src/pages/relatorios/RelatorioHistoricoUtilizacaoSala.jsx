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
      

      {/* Filtros */}
      <div className="filtro-container noprint">
        <div className="relatorios-filtro-group relatorios-filtro-text">
        <label className="relatorio-label">De:</label>
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
        <label className="relatorio-label">Até:</label>
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
              className="dashboard-filtro-clear relatorio-select-clear"
              title="Limpar Sala"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex justify-between items-center">
          <button onClick={handleImprimir} className="btn-imprimir">
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </div>

      {/* Resultado */}
      {Object.keys(dadosAgrupados).length === 0 ? (
        <div className="relatorios-sem-dados">
          Nenhum empréstimo encontrado.
        </div>
        ) : (
        Object.entries(dadosAgrupados).sort().map(([sala, usuarios]) => {
          const total = Object.values(usuarios).reduce((acc, qtd) => acc + qtd, 0);
          return (
            <div key={sala} className="space-y-2">
              <h3 className="relatorios-cartao-nome text-left">Sala {sala}</h3>
              <div className="emprestimos-tabela-wrapper">
                <table className="emprestimos-tabela">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Quantidade de Utilizações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(usuarios).map(([usuario, qtd]) => (
                      <tr key={usuario}>
                        <td>{usuario}</td>
                        <td>{qtd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right text-sm font-medium mt-1">
                  Total de utilizações: {total}
                </div>
              </div>
            </div>
          );
        })
      )}

    </div>
  );
}
