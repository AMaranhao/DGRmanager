import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter } from "date-fns";
import { X, Printer } from "lucide-react";

import "@/styles/pages/relatorios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/buttons.css";
import "@/styles/pages/tables.css";
import '@/styles/mobile.css';

export default function RelatorioHistoricoUtilizacaoAndar() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [andarSelecionado, setAndarSelecionado] = useState("");

  useEffect(() => {
    carregarEmprestimos();
  }, []);

  const carregarEmprestimos = async () => {
    const dados = await fetchEmprestimos();
    setEmprestimos(dados);
  };

  const todosAndares = Array.from(
    new Set(emprestimos.map((emp) => emp.sala?.numero?.charAt(0).toUpperCase()))
  ).filter(Boolean).sort();

  const emprestimosFiltrados = emprestimos.filter((emp) => {
    const retirada = emp.horario_retirada ? parseISO(emp.horario_retirada) : null;
    let inicio = dataInicio ? parseISO(dataInicio) : null;
    let fim = dataFim ? parseISO(dataFim) : null;

    if (inicio && fim && isAfter(inicio, fim)) {
      [inicio, fim] = [fim, inicio];
    }

    const dentroDataInicio = inicio ? isAfter(retirada, inicio) : true;
    const dentroDataFim = fim ? isAfter(fim, retirada) : true;

    return dentroDataInicio && dentroDataFim;
  });

  const agruparPorAndar = () => {
    const agrupado = {};
    emprestimosFiltrados.forEach((emp) => {
      const andar = emp.sala?.numero?.charAt(0).toUpperCase();
      if (!andar) return;
      if (!agrupado[andar]) agrupado[andar] = [];
      agrupado[andar].push(emp);
    });
    return agrupado;
  };

  const dadosAgrupados = agruparPorAndar();

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      

      {/* Filtros */}
      <div className="filtro-container noprint">
      <div className="filtros-esquerda">
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
            value={andarSelecionado}
            onChange={(e) => setAndarSelecionado(e.target.value)}
            className="dashboard-select"
          >
            <option value="">Todos os Andares</option>
            {todosAndares.map((andar) => (
              <option key={andar} value={andar}>
                Andar {andar}
              </option>
            ))}
          </select>
          {andarSelecionado && (
            <button
              type="button"
              onClick={() => setAndarSelecionado("")}
              className="dashboard-filtro-clear relatorio-select-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>
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
          Nenhum empréstimo encontrado nesse período.
        </div>
       ) : (
        Object.keys(dadosAgrupados)
          .filter((andar) => andarSelecionado === "" || andar === andarSelecionado)
          .sort()
          .map((andar) => {
            const emprestimosDoAndar = dadosAgrupados[andar];
            return (
              <div key={andar} className="space-y-2">
                <h3 className="relatorios-cartao-nome text-left">
                  Andar {andar}
                </h3>
                <div className="emprestimos-tabela-wrapper">
                  <table className="emprestimos-tabela">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Sala</th>
                        <th>Horário de Retirada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emprestimosDoAndar.map((emp) => (
                        <tr key={emp.id}>
                          <td>{emp.usuario}</td>
                          <td>{emp.sala?.numero}</td>
                          <td>
                            {emp.horario_retirada
                              ? format(parseISO(emp.horario_retirada), "dd/MM/yyyy HH:mm")
                              : "Não informado"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-right text-sm font-medium mt-1">
                    Total de utilizações: {emprestimosDoAndar.length}
                  </div>
                </div>
              </div>
            );
          })
      )}


    </div>
  );
}
