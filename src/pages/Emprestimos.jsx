// src/pages/Emprestimos.jsx

import { useEffect, useState } from "react";
import { fetchEmprestimos } from "../services/apiService";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [textoPesquisa, setTextoPesquisa] = useState("");

  useEffect(() => {
    const carregarEmprestimos = async () => {
      const dados = await fetchEmprestimos();
      setEmprestimos(dados);
    };

    carregarEmprestimos();
  }, []);

  const emprestimosFiltrados = emprestimos.filter((e) => {
    const atendeStatus = statusFiltro ? e.status === statusFiltro : true;

    const dataRetirada = new Date(e.horario_retirada);
    const dataFormatada = dataRetirada.toISOString().slice(0, 10);

    let inicio = dataInicial ? new Date(dataInicial) : null;
    let fim = dataFinal ? new Date(dataFinal) : null;

    if (inicio && fim && inicio > fim) {
      [inicio, fim] = [fim, inicio];
    }

    const atendeDataInicial = inicio ? dataFormatada >= inicio.toISOString().slice(0, 10) : true;
    const atendeDataFinal = fim ? dataFormatada <= fim.toISOString().slice(0, 10) : true;

    const atendeTexto = textoPesquisa
      ? e.usuario.toLowerCase().includes(textoPesquisa.toLowerCase()) ||
        e.sala.toLowerCase().includes(textoPesquisa.toLowerCase())
      : true;

    return atendeStatus && atendeDataInicial && atendeDataFinal && atendeTexto;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Histórico de Empréstimos</h1>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-6 bg-gray-100 p-6 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Usuário ou Sala"
            value={textoPesquisa}
            onChange={(e) => setTextoPesquisa(e.target.value)}
            className="w-48 rounded-lg"
          />
          {textoPesquisa && (
            <button
              type="button"
              onClick={() => setTextoPesquisa("")}
              className="text-gray-500 hover:text-black border border-gray-300 rounded-full p-1 w-7 h-7 flex items-center justify-center hover:bg-gray-200 transition"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="border px-3 py-2 rounded-lg h-10 w-48 text-gray-700"
          >
            <option value="">Todos os Status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Em atraso">Em atraso</option>
          </select>
          {statusFiltro && (
            <button
              type="button"
              onClick={() => setStatusFiltro("")}
              className="text-gray-500 hover:text-black border border-gray-300 rounded-full p-1 w-7 h-7 flex items-center justify-center hover:bg-gray-200 transition"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="w-48 rounded-lg"
          />
          {dataInicial && (
            <button
              type="button"
              onClick={() => setDataInicial("")}
              className="text-gray-500 hover:text-black border border-gray-300 rounded-full p-1 w-7 h-7 flex items-center justify-center hover:bg-gray-200 transition"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="w-48 rounded-lg"
          />
          {dataFinal && (
            <button
              type="button"
              onClick={() => setDataFinal("")}
              className="text-gray-500 hover:text-black border border-gray-300 rounded-full p-1 w-7 h-7 flex items-center justify-center hover:bg-gray-200 transition"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-4 border">Sala</th>
              <th className="py-2 px-4 border">Usuário</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Horário Retirada</th>
              <th className="py-2 px-4 border">Horário Devolução</th>
            </tr>
          </thead>
          <tbody>
            {emprestimosFiltrados.map((e, idx) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{e.sala}</td>
                <td className="py-2 px-4 border">{e.usuario}</td>
                <td className="py-2 px-4 border">
                  <span
                    className={`font-semibold ${
                      e.status === 'Em atraso'
                        ? 'text-red-600'
                        : e.status === 'Em andamento'
                        ? 'text-blue-600'
                        : 'text-green-600'
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="py-2 px-4 border">
                  {new Date(e.horario_retirada).toLocaleString()}
                </td>
                <td className="py-2 px-4 border">
                  {e.horario_devolucao
                    ? new Date(e.horario_devolucao).toLocaleString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
