import "@/styles/pages/relatorios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/buttons.css";

import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter } from "date-fns";
import { X, Printer } from "lucide-react";

export default function RelatorioRelatorioCompleto() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [usuarioFiltro, setUsuarioFiltro] = useState("");
  const [salaFiltro, setSalaFiltro] = useState("");
  const [andarFiltro, setAndarFiltro] = useState("");

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
    const atendeStatus = statusFiltro ? (emp.status ?? "Indefinido") === statusFiltro : true;
    
    const atendePesquisaGeral = usuarioFiltro
      ? (emp.usuario?.toLowerCase().includes(usuarioFiltro.toLowerCase()) ||
        emp.sala?.numero?.toLowerCase().includes(usuarioFiltro.toLowerCase()))
      : true;

    const atendeAndar = andarFiltro ? emp.sala?.numero?.startsWith(andarFiltro.toUpperCase()) : true;

    return dentroDataInicio && dentroDataFim && atendeStatus && atendePesquisaGeral && atendeAndar;
  });

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      

      {/* Filtros */}
      <div className="filtro-container noprint">
      <div className="filtros-esquerda">
        {/* Data Início */}
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

        {/* Data Fim */}
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

        {/* Status */}
        <div className="relatorios-filtro-group relatorios-filtro-text">
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
        </div>

        {/* Andar */}
        <div className="relatorios-filtro-group relatorios-filtro-text">
          <select
            value={andarFiltro}
            onChange={(e) => setAndarFiltro(e.target.value)}
            className="dashboard-select"
          >
            <option value="">Todos os Andares</option>
            {[...new Set(emprestimos.map(emp => emp.sala?.numero?.charAt(0).toUpperCase()))]
              .filter(Boolean)
              .sort()
              .map((andar) => (
                <option key={andar} value={andar}>
                  Andar {andar}
                </option>
              ))}
          </select>
          {andarFiltro && (
            <button
              type="button"
              onClick={() => setAndarFiltro("")}
              className="dashboard-filtro-clear relatorio-select-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Usuário */}
        <div className="relatorios-filtro-group relatorios-filtro-text">
          <Input
            type="text"
            placeholder="Usuário ou Sala"
            value={usuarioFiltro}
            onChange={(e) => setUsuarioFiltro(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {usuarioFiltro && (
            <button
              type="button"
              onClick={() => setUsuarioFiltro("")}
              className="dashboard-filtro-clear"
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
      {emprestimosFiltrados.length === 0 ? (
        <div className="relatorios-sem-dados">
          Nenhum empréstimo encontrado com esses filtros.
        </div>
       ) : (
        <div className="emprestimos-tabela-wrapper">
          <table className="emprestimos-tabela">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Sala</th>
                <th>Status</th>
                <th>Horário de Retirada</th>
                <th>Horário de Devolução</th>
              </tr>
            </thead>
            <tbody>
              {emprestimosFiltrados.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.usuario}</td>
                  <td>{emp.sala?.numero}</td>
                  <td>{emp.status ?? "Indefinido"}</td>
                  <td>
                    {emp.horario_retirada
                      ? format(parseISO(emp.horario_retirada), "dd/MM/yyyy HH:mm")
                      : "Não informado"}
                  </td>
                  <td>
                    {emp.horario_devolucao
                      ? format(parseISO(emp.horario_devolucao), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right text-sm font-medium mt-2">
            Total de registros: {emprestimosFiltrados.length}
          </div>
        </div>
      )}


    </div>
  );
}
