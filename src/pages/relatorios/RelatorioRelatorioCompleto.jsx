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
    const atendeUsuario = usuarioFiltro ? emp.usuario?.toLowerCase().includes(usuarioFiltro.toLowerCase()) : true;
    const atendeSala = salaFiltro ? emp.sala?.numero?.toLowerCase().includes(salaFiltro.toLowerCase()) : true;
    const atendeAndar = andarFiltro ? emp.sala?.numero?.startsWith(andarFiltro.toUpperCase()) : true;

    return dentroDataInicio && dentroDataFim && atendeStatus && atendeUsuario && atendeSala && atendeAndar;
  });

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="relatorios-titulo">Relatório Geral Completo</h2>
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

        {/* Usuário */}
        <div className="relatorios-filtro-group relatorios-filtro-text">
          <Input
            type="text"
            placeholder="Filtrar por Usuário"
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

        {/* Sala */}
        <div className="relatorios-filtro-group relatorios-filtro-text">
          <Input
            type="text"
            placeholder="Filtrar por Sala"
            value={salaFiltro}
            onChange={(e) => setSalaFiltro(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {salaFiltro && (
            <button
              type="button"
              onClick={() => setSalaFiltro("")}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Andar */}
        <div className="relatorios-filtro-group relatorios-filtro-text">
          <Input
            type="text"
            placeholder="Filtrar por Andar (ex: A, B, C)"
            value={andarFiltro}
            onChange={(e) => setAndarFiltro(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {andarFiltro && (
            <button
              type="button"
              onClick={() => setAndarFiltro("")}
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
          Nenhum empréstimo encontrado com esses filtros.
        </div>
      ) : (
        <div className="relatorios-grid">
          {emprestimosFiltrados.map((emp) => (
            <div key={emp.id} className="relatorios-cartao">
              <h3 className="relatorios-cartao-nome">{emp.usuario}</h3>
              <p className="relatorios-info"><strong>Sala:</strong> {emp.sala?.numero}</p>
              <p className="relatorios-info"><strong>Status:</strong> {emp.status ?? "Indefinido"}</p>
              <p className="relatorios-info">
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
