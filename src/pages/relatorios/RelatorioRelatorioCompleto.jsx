// src/pages/relatorios/RelatorioRelatorioCompleto.jsx

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

    if (inicio && fim && isAfter(inicio, fim)) {
      [inicio, fim] = [fim, inicio];
    }

    const dentroDataInicio = inicio ? isAfter(retirada, inicio) : true;
    const dentroDataFim = fim ? isAfter(fim, retirada) : true;
    const atendeStatus = statusFiltro ? emp.status ?? 'Indefinido' === statusFiltro : true;
    const atendeUsuario = usuarioFiltro ? emp.usuario?.nome?.toLowerCase().includes(usuarioFiltro.toLowerCase()) : true;
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
        <h2 className="text-2xl font-bold text-gray-800">Relatório Geral Completo</h2>
        <button
          onClick={handleImprimir}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Printer size={18} />
          Imprimir
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-6 bg-gray-50 p-6 rounded-lg shadow-sm">

        {/* Data Início */}
        <div className="flex items-center gap-2 px-2">
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-40 h-8 text-sm"
          />
          {dataInicio && (
            <button
              type="button"
              onClick={() => setDataInicio("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Data Fim */}
        <div className="flex items-center gap-2 px-2">
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-40 h-8 text-sm"
          />
          {dataFim && (
            <button
              type="button"
              onClick={() => setDataFim("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 px-2">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 h-8"
          >
            <option value="">Todos os Status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Em atraso">Em atraso</option>
          </select>
        </div>

        {/* Usuário */}
        <div className="flex items-center gap-2 px-2">
          <Input
            type="text"
            placeholder="Filtrar por Usuário"
            value={usuarioFiltro}
            onChange={(e) => setUsuarioFiltro(e.target.value)}
            className="w-48 h-8 text-sm"
          />
          {usuarioFiltro && (
            <button
              type="button"
              onClick={() => setUsuarioFiltro("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sala */}
        <div className="flex items-center gap-2 px-2">
          <Input
            type="text"
            placeholder="Filtrar por Sala"
            value={salaFiltro}
            onChange={(e) => setSalaFiltro(e.target.value)}
            className="w-48 h-8 text-sm"
          />
          {salaFiltro && (
            <button
              type="button"
              onClick={() => setSalaFiltro("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Andar */}
        <div className="flex items-center gap-2 px-2">
          <Input
            type="text"
            placeholder="Filtrar por Andar (ex: A, B, C)"
            value={andarFiltro}
            onChange={(e) => setAndarFiltro(e.target.value)}
            className="w-48 h-8 text-sm"
          />
          {andarFiltro && (
            <button
              type="button"
              onClick={() => setAndarFiltro("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      {emprestimosFiltrados.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded-md text-gray-600 text-center">
          Nenhum empréstimo encontrado com esses filtros.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {emprestimosFiltrados.map((emp) => (
            <div
              key={emp.id}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-6 transition hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{emp.usuario?.nome}</h3>
              <p className="text-sm text-gray-600 mb-1"><strong>Sala:</strong> {emp.sala?.numero}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Status:</strong> {emp.status ?? 'Indefinido'}</p>
              <p className="text-sm text-gray-600">
                <strong>Horário de Retirada:</strong> {emp.horario_retirada ? format(parseISO(emp.horario_retirada), 'dd/MM/yyyy HH:mm') : "Não informado"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
