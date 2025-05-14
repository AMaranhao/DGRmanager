import { useEffect, useState } from "react";
import { fetchEmprestimos } from "../services/apiService";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

import "@/styles/pages/emprestimos.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/tables.css";
import "@/styles/pages/modals.css";
import "@/styles/pages/buttons.css";
import "@/styles/pages/status.css";
import '@/styles/mobile.css';

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [textoPesquisa, setTextoPesquisa] = useState("");

  useEffect(() => {
    const carregarEmprestimos = async () => {
      const dados = await fetchEmprestimos();
      setEmprestimos(dados);
    };
    carregarEmprestimos();
  }, []);

  const emprestimosFiltrados = emprestimos.filter((e) => {
    const atendeStatus = statusFiltro ? e.status === statusFiltro : true;
  
    const dataRetirada = e.horario_retirada ? new Date(e.horario_retirada) : null;
    const dataFormatada = dataRetirada?.toISOString().slice(0, 10) ?? "";
  
    let inicio = dataInicial ? new Date(dataInicial) : null;
    let fim = dataFinal ? new Date(dataFinal) : null;
    if (inicio && fim && inicio > fim) [inicio, fim] = [fim, inicio];
  
    const atendeDataInicial = inicio ? dataFormatada >= inicio.toISOString().slice(0, 10) : true;
    const atendeDataFinal = fim ? dataFormatada <= fim.toISOString().slice(0, 10) : true;
  
    const nomeUsuario = `${e.usuario?.firstName || ""} ${e.usuario?.lastName || ""}`.toLowerCase();
    const numeroSala = e.chave?.sala?.numero?.toLowerCase() || "";
  
    const atendeTexto = textoPesquisa
      ? nomeUsuario.includes(textoPesquisa.toLowerCase()) || numeroSala.includes(textoPesquisa.toLowerCase())
      : true;
  
    return atendeStatus && atendeDataInicial && atendeDataFinal && atendeTexto;
  });
  

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Histórico de Empréstimos</h3>

      {/* Filtros */}
      <div className="dashboard-filtro">
        <div className="dashboard-filtro-group dashboard-filtro-text">
        <label className="relatorio-label">De:</label>
          <Input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {dataInicial && (
            <button
              type="button"
              onClick={() => setDataInicial("")}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="dashboard-filtro-group dashboard-filtro-text">
        <label className="relatorio-label">Até:</label>
          <Input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {dataFinal && (
            <button
              type="button"
              onClick={() => setDataFinal("")}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="dashboard-filtro-group dashboard-filtro-text">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="dashboard-select"
          >
            <option value="">Todos os Status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Em atraso">Em atraso</option>
          </select>
          {statusFiltro && (
            <button
              type="button"
              onClick={() => setStatusFiltro("")}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="dashboard-filtro-group dashboard-filtro-text">
          <input
            type="text"
            placeholder="Usuário ou Sala"
            value={textoPesquisa}
            onChange={(e) => setTextoPesquisa(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {textoPesquisa && (
            <button
              onClick={() => setTextoPesquisa('')}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="emprestimos-tabela-wrapper">
        <table className="emprestimos-tabela">
          <thead>
            <tr>
              <th>Sala</th>
              <th>Usuário</th>
              <th>Status</th>
              <th>Horário Retirada</th>
              <th>Horário Devolução</th>
            </tr>
          </thead>
          <tbody>
            {emprestimosFiltrados.map((e) => (
              <tr key={e.id}>
                <td>{e.chave?.sala?.numero || "-"}</td>
                <td>{`${e.usuario?.firstName || ""} ${e.usuario?.lastName || ""}`.trim() || "-"}</td>
                <td>
                  <span className={
                    e.status === 'Em atraso'
                      ? 'status-atraso'
                      : e.status === 'Em andamento'
                      ? 'status-andamento'
                      : 'status-finalizado'
                  }>
                    {e.status}
                  </span>
                </td>
                <td>{new Date(e.horario_retirada).toLocaleString()}</td>
                <td>{e.horario_devolucao ? new Date(e.horario_devolucao).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
