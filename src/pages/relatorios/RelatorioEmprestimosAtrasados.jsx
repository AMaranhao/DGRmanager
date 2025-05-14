import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, isAfter, parseISO } from "date-fns";
import { X, Printer } from "lucide-react";

import "@/styles/pages/relatorios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/buttons.css";
import "@/styles/pages/tables.css";
import '@/styles/mobile.css';

export default function RelatorioEmprestimosAtrasados() {
  const [atrasados, setAtrasados] = useState([]);
  const [filtroGeral, setFiltroGeral] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    carregarUsuariosAtrasados();
  }, []);

  const carregarUsuariosAtrasados = async () => {
    const emprestimos = await fetchEmprestimos();
    const atrasadosFiltrados = emprestimos.filter(
      (emp) => (emp.status?.toLowerCase().trim() || "") === "em atraso"
    );
    setAtrasados(atrasadosFiltrados);
  };

  const usuariosFiltrados = atrasados.filter((emp) => {
    const horarioRetirada = emp.horario_retirada
      ? parseISO(emp.horario_retirada)
      : null;

    let inicio = dataInicio ? parseISO(dataInicio) : null;
    let fim = dataFim ? parseISO(dataFim) : null;

    if (inicio && fim && isAfter(inicio, fim)) {
      [inicio, fim] = [fim, inicio];
    }

    const dentroDataInicio = inicio ? isAfter(horarioRetirada, inicio) : true;
    const dentroDataFim = fim ? isAfter(fim, horarioRetirada) : true;

    const nomeUsuario = `${emp.usuario?.firstName || ''} ${emp.usuario?.lastName || ''}`.toLowerCase();
    const numeroSala = emp.chave?.sala?.numero?.toString().toLowerCase() || "";

    return (
      (filtroGeral === "" ||
        nomeUsuario.includes(filtroGeral.toLowerCase()) ||
        numeroSala.includes(filtroGeral.toLowerCase())) &&
      dentroDataInicio &&
      dentroDataFim
    );
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
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
            <Input
              type="text"
              placeholder="Usuário ou Sala"
              value={filtroGeral}
              onChange={(e) => setFiltroGeral(e.target.value)}
              className="dashboard-select dashboard-filtro-usuario-input"
            />
            {filtroGeral && (
              <button
                type="button"
                onClick={() => setFiltroGeral("")}
                className="dashboard-filtro-clear relatorio-select-clear"
                title="Limpar"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button onClick={handlePrint} className="btn-imprimir">
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </div>

      {usuariosFiltrados.length === 0 ? (
        <div className="relatorios-sem-dados">
          Nenhum usuário encontrado com esses filtros.
        </div>
      ) : (
        <div className="emprestimos-tabela-wrapper">
          <table className="emprestimos-tabela">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Sala</th>
                <th>Horário de Retirada</th>
                <th>Tempo de Atraso</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((emp) => {
                const retirada = emp.horario_retirada ? parseISO(emp.horario_retirada) : null;
                const agora = new Date();
                let atraso = "";

                if (retirada) {
                  const diffMs = agora - retirada;
                  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffMin = Math.floor((diffMs / (1000 * 60)) % 60);
                  const diffDias = Math.floor(diffHoras / 24);

                  if (diffDias > 0) {
                    atraso = `${diffDias}d ${diffHoras % 24}h ${diffMin}min`;
                  } else if (diffHoras > 0) {
                    atraso = `${diffHoras}h ${diffMin}min`;
                  } else {
                    atraso = `${diffMin}min`;
                  }
                } else {
                  atraso = "N/A";
                }

                return (
                  <tr key={emp.id}>
                    <td>{`${emp.usuario?.firstName || ""} ${emp.usuario?.lastName || ""}`.trim() || "Não informado"}</td>
                    <td>{emp.chave?.sala?.numero || "Não informado"}</td>
                    <td>
                      {emp.horario_retirada
                        ? format(parseISO(emp.horario_retirada), "dd/MM/yyyy HH:mm")
                        : "Não informado"}
                    </td>
                    <td>{atraso}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
