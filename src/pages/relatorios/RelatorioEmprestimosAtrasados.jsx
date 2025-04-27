// src/pages/relatorios/RelatorioEmprestimosAtrasados.jsx

import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, isAfter, parseISO } from "date-fns";
import { X } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Usuários com Empréstimos em Atraso</h2>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-x-4 gap-y-4 bg-gray-50 p-6 rounded-lg shadow-sm">
        {[
          { label: "Filtrar por Sala", value: filtroSala, setValue: setFiltroSala, type: "text" },
          { label: "Filtrar por Usuário", value: filtroUsuario, setValue: setFiltroUsuario, type: "text" },
          { label: "Data Início", value: dataInicio, setValue: setDataInicio, type: "date" },
          { label: "Data Fim", value: dataFim, setValue: setDataFim, type: "date" },
        ].map(({ label, value, setValue, type }, index) => (
          <div key={index} className="flex items-center gap-2 px-2">
            <Input
              type={type}
              placeholder={label}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-48 px-2 py-2"
            />
            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-7 h-7 flex items-center justify-center"
                title="Limpar"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
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
