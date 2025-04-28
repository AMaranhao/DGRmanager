// src/pages/relatorios/RelatorioSalasMaisUtilizadas.jsx

import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter } from "date-fns";
import { X, Printer } from "lucide-react";

export default function RelatorioSalasMaisUtilizadas() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ordem, setOrdem] = useState("desc"); // desc = mais usadas primeiro

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

  const agruparPorSala = () => {
    const agrupado = {};

    emprestimosFiltrados.forEach((emp) => {
      if (!emp.sala) return;
      agrupado[emp.sala] = (agrupado[emp.sala] || 0) + 1;
    });

    return agrupado;
  };

  const dadosAgrupados = agruparPorSala();

  const salasOrdenadas = Object.entries(dadosAgrupados)
    .sort(([_, a], [__, b]) => (ordem === "desc" ? b - a : a - b));

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Salas Mais Utilizadas</h2>
        <button
          onClick={handleImprimir}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm"
        >
          <Printer size={16} /> Imprimir
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4 bg-gray-50 p-4 rounded-lg shadow-sm">
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
              className="w-40 h-8 text-sm"
            />
            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
                title="Limpar"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}

        {/* Filtro de Ordem */}
        <div className="flex items-center gap-2 px-2">
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 h-8"
          >
            <option value="desc">Mais utilizadas primeiro</option>
            <option value="asc">Menos utilizadas primeiro</option>
          </select>
        </div>
      </div>

      {/* Resultado */}
      {salasOrdenadas.length === 0 ? (
        <div className="bg-gray-100 p-3 rounded-md text-gray-600 text-center text-sm">
          Nenhum dado encontrado nesse período.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {salasOrdenadas.map(([sala, quantidade]) => (
            <div
              key={sala}
              className="bg-white border border-gray-200 rounded-md shadow p-3 transition hover:shadow-md"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Sala: {sala}</h3>
              <p className="text-xs text-gray-600">
                Utilizações: {quantidade}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Total Geral */}
      <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-center text-sm font-semibold">
        Total Geral de Utilizações: {salasOrdenadas.reduce((acc, [_, quant]) => acc + quant, 0)}
      </div>
    </div>
  );
}
