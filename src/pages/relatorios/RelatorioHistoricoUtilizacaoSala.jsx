// src/pages/relatorios/RelatorioHistoricoUtilizacaoSala.jsx

import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter } from "date-fns";
import { X, Printer } from "lucide-react";

export default function RelatorioHistoricoUtilizacaoSala() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [salaSelecionada, setSalaSelecionada] = useState("");

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
    const correspondeSala = salaSelecionada ? emp.sala === salaSelecionada : true;

    return dentroDataInicio && dentroDataFim && correspondeSala;
  });

  const agruparPorSala = () => {
    const agrupado = {};

    emprestimosFiltrados.forEach((emp) => {
      if (!emp.sala || !emp.usuario) return;

      if (!agrupado[emp.sala]) {
        agrupado[emp.sala] = {};
      }
      agrupado[emp.sala][emp.usuario] = (agrupado[emp.sala][emp.usuario] || 0) + 1;
    });

    return agrupado;
  };

  const dadosAgrupados = agruparPorSala();

  const salasDisponiveis = Array.from(new Set(emprestimos.map(emp => emp.sala))).sort();

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Histórico de Utilização por Sala</h2>
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

        {/* Filtro de Sala */}
        <div className="flex items-center gap-2 px-2">
          <select
            value={salaSelecionada}
            onChange={(e) => setSalaSelecionada(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 h-8"
          >
            <option value="">Todas as Salas</option>
            {salasDisponiveis.map((sala) => (
              <option key={sala} value={sala}>{sala}</option>
            ))}
          </select>
          {salaSelecionada && (
            <button
              type="button"
              onClick={() => setSalaSelecionada("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar Sala"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      {Object.keys(dadosAgrupados).length === 0 ? (
        <div className="bg-gray-100 p-3 rounded-md text-gray-600 text-center text-sm">
          Nenhum empréstimo encontrado.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {Object.entries(dadosAgrupados).sort().map(([sala, usuarios]) => {
            const totalUtilizacoes = Object.values(usuarios).reduce((acc, qtd) => acc + qtd, 0);
            return (
              <div
                key={sala}
                className="bg-white border border-gray-200 rounded-md shadow p-3 transition hover:shadow-md"
              >
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Sala {sala}</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  {Object.entries(usuarios).map(([usuario, quantidade]) => (
                    <p key={usuario}>
                      <strong>{usuario}:</strong> {quantidade} utilização(ões)
                    </p>
                  ))}
                  <p className="mt-2 font-semibold text-blue-700">
                    Total: {totalUtilizacoes} utilização(ões)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
