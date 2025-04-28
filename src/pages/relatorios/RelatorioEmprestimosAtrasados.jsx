// src/pages/relatorios/RelatorioEmprestimosAtrasados.jsx

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
    const atrasadosFiltrados = emprestimos.filter((emp) => emp.status === "Em atraso");
    setAtrasados(atrasadosFiltrados);
  };

  const usuariosFiltrados = atrasados.filter((emp) => {
    const horarioRetirada = emp.horario_retirada ? parseISO(emp.horario_retirada) : null;

    let inicio = dataInicio ? parseISO(dataInicio) : null;
    let fim = dataFim ? parseISO(dataFim) : null;

    if (inicio && fim && isAfter(inicio, fim)) {
      [inicio, fim] = [fim, inicio];
    }

    const dentroDataInicio = inicio ? isAfter(horarioRetirada, inicio) : true;
    const dentroDataFim = fim ? isAfter(fim, horarioRetirada) : true;

    return (
      (filtroSala === "" || emp.sala.toLowerCase().includes(filtroSala.toLowerCase())) &&
      (filtroUsuario === "" || emp.usuario.toLowerCase().includes(filtroUsuario.toLowerCase())) &&
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
        <h2 className="text-2xl font-bold text-gray-800">Usuários com Empréstimos em Atraso</h2>
        <button
          onClick={handlePrint}
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
            placeholder="Data Início"
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
            placeholder="Data Fim"
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

        {/* Filtro por Sala */}
        <div className="flex items-center gap-2 px-2">
          <Input
            type="text"
            placeholder="Filtrar por Sala"
            value={filtroSala}
            onChange={(e) => setFiltroSala(e.target.value)}
            className="w-48 h-8 text-sm"
          />
          {filtroSala && (
            <button
              type="button"
              onClick={() => setFiltroSala("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filtro por Usuário */}
        <div className="flex items-center gap-2 px-2">
          <Input
            type="text"
            placeholder="Filtrar por Usuário"
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            className="w-48 h-8 text-sm"
          />
          {filtroUsuario && (
            <button
              type="button"
              onClick={() => setFiltroUsuario("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>

      </div>

      {/* Resultado */}
      {usuariosFiltrados.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded-md text-gray-600 text-center">
          Nenhum usuário encontrado com esses filtros.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {usuariosFiltrados.map((emp) => (
            <div
              key={emp.id}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-6 transition hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{emp.usuario}</h3>
              <p className="text-sm text-gray-600 mb-1"><strong>Sala:</strong> {emp.sala}</p>
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
