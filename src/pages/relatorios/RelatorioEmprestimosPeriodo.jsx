import "@/styles/pages/relatorios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/buttons.css";

import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, isAfter, parseISO } from "date-fns";
import { X, Printer } from "lucide-react";

export default function RelatorioEmprestimosPeriodo() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

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

    if (inicio && fim && isAfter(inicio, fim)) {
      [inicio, fim] = [fim, inicio];
    }

    const dentroDataInicio = inicio ? isAfter(retirada, inicio) : true;
    const dentroDataFim = fim ? isAfter(fim, retirada) : true;

    return dentroDataInicio && dentroDataFim;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="relatorios-titulo">Relatório de Empréstimos por Período</h2>
        <button onClick={handlePrint} className="btn-imprimir">
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
      </div>

      {/* Resultado */}
      {emprestimosFiltrados.length === 0 ? (
        <div className="relatorios-sem-dados">
          Nenhum empréstimo encontrado nesse período.
        </div>
      ) : (
        <div className="relatorios-grid">
          {emprestimosFiltrados.map((emp) => (
            <div key={emp.id} className="relatorios-cartao">
              <h3 className="relatorios-cartao-nome">{emp.usuario}</h3>
              <p className="relatorios-cartao-info">
                <strong>Sala:</strong> {emp.sala?.numero}
              </p>
              <p className="relatorios-cartao-info">
                <strong>Retirada:</strong>{" "}
                {emp.horario_retirada
                  ? format(parseISO(emp.horario_retirada), "dd/MM/yyyy HH:mm")
                  : "Não informado"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
