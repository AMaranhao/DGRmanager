import "@/styles/pages/relatorios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/buttons.css";

import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, isAfter, parseISO } from "date-fns";
import { X, Printer } from "lucide-react";

export default function RelatorioEmprestimosAtrasados() {
  const [atrasados, setAtrasados] = useState([]);
  const [filtroSala, setFiltroSala] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    carregarUsuariosAtrasados();
  }, []);

  const carregarUsuariosAtrasados = async () => {
    const emprestimos = await fetchEmprestimos();
    const atrasadosFiltrados = emprestimos.filter(
      (emp) => (emp.status ?? "Indefinido") === "Em atraso"
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

    return (
      (filtroSala === "" ||
        emp.sala?.numero.toLowerCase().includes(filtroSala.toLowerCase())) &&
      (filtroUsuario === "" ||
        emp.usuario?.toLowerCase().includes(filtroUsuario.toLowerCase())) &&
      dentroDataInicio &&
      dentroDataFim
    );
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="relatorios-titulo">
          Usuários com Empréstimos em Atraso
        </h2>
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

        <div className="relatorios-filtro-group relatorios-filtro-text">
          <Input
            type="text"
            placeholder="Filtrar por Sala"
            value={filtroSala}
            onChange={(e) => setFiltroSala(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {filtroSala && (
            <button
              type="button"
              onClick={() => setFiltroSala("")}
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
            placeholder="Filtrar por Usuário"
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {filtroUsuario && (
            <button
              type="button"
              onClick={() => setFiltroUsuario("")}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      {usuariosFiltrados.length === 0 ? (
        <div className="relatorios-sem-dados">
          Nenhum usuário encontrado com esses filtros.
        </div>
      ) : (
        <div className="relatorios-grid">
          {usuariosFiltrados.map((emp) => (
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
