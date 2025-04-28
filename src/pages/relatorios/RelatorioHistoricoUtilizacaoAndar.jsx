// src/pages/relatorios/RelatorioHistoricoUtilizacaoAndar.jsx

import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter } from "date-fns";
import { X, Printer } from "lucide-react";

export default function RelatorioHistoricoUtilizacaoAndar() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [andarSelecionado, setAndarSelecionado] = useState(""); // agora é apenas 1 andar selecionado

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

  const todosAndares = Array.from(new Set(emprestimos.map(emp => emp.sala?.charAt(0).toUpperCase()))).filter(Boolean).sort();

  const agruparPorAndar = () => {
    const agrupado = {};

    emprestimosFiltrados.forEach((emp) => {
      if (!emp.sala) return;
      const andar = emp.sala.charAt(0).toUpperCase();
      if (!agrupado[andar]) {
        agrupado[andar] = [];
      }
      agrupado[andar].push(emp);
    });

    return agrupado;
  };

  const dadosAgrupados = agruparPorAndar();

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Histórico de Utilização por Andar</h2>
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

        {/* Filtro de Andar - PICKLIST */}
        <div className="flex items-center gap-2 px-2">
          <select
            value={andarSelecionado}
            onChange={(e) => setAndarSelecionado(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 h-8"
          >
            <option value="">Todos os andares</option>
            {todosAndares.map((andar) => (
              <option key={andar} value={andar}>
                Andar {andar}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultado */}
      {Object.keys(dadosAgrupados).length === 0 ? (
        <div className="bg-gray-100 p-3 rounded-md text-gray-600 text-center text-sm">
          Nenhum empréstimo encontrado nesse período.
        </div>
      ) : (
        Object.keys(dadosAgrupados)
          .filter((andar) => andarSelecionado === "" || andar === andarSelecionado)
          .sort()
          .map((andar) => {
            const totalUtilizacoes = dadosAgrupados[andar].length;
            return (
              <div key={andar} className="bg-white border border-gray-200 rounded-md shadow p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-700 mb-3">
                  Andar {andar} - Total: {totalUtilizacoes} utilizações
                </h3>

                <div className="grid md:grid-cols-2 gap-3">
                  {dadosAgrupados[andar].map((emp) => (
                    <div
                      key={emp.id}
                      className="bg-gray-50 border border-gray-200 rounded-md p-3 transition hover:shadow-sm"
                    >
                      <p className="text-sm font-semibold text-gray-700 mb-1">{emp.usuario}</p>
                      <p className="text-xs text-gray-600 mb-1"><strong>Sala:</strong> {emp.sala}</p>
                      <p className="text-xs text-gray-600">
                        <strong>Retirada:</strong> {emp.horario_retirada ? format(parseISO(emp.horario_retirada), 'dd/MM/yyyy HH:mm') : "Não informado"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
      )}
    </div>
  );
}
