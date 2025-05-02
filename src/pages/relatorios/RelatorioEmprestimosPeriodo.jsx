// src/pages/relatorios/RelatorioEmprestimosPeriodo.jsx

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
        <h2 className="text-2xl font-bold text-gray-800">Relatório de Empréstimos por Período</h2>
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
        {[ 
          { label: "Data Início", value: dataInicio, setValue: setDataInicio, type: "date" },
          { label: "Data Fim", value: dataFim, setValue: setDataFim, type: "date" },
        ].map(({ label, value, setValue, type }, index) => (
          <div key={index} className="flex items-center gap-2 px-2">
            <Input
              type={type}
              placeholder={label}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-48"
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
      {emprestimosFiltrados.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded-md text-gray-600 text-center">
          Nenhum empréstimo encontrado nesse período.
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
