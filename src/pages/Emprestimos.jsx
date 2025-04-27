import { useEffect, useState } from 'react';
import { fetchEmprestimos } from '../services/apiService';
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { parseISO, isAfter } from "date-fns";

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [textoPesquisa, setTextoPesquisa] = useState('');

  useEffect(() => {
    const carregarEmprestimos = async () => {
      const dados = await fetchEmprestimos();
      setEmprestimos(dados);
    };
    carregarEmprestimos();
  }, []);

  const emprestimosFiltrados = emprestimos.filter((e) => {
    const atendeStatus = statusFiltro ? e.status === statusFiltro : true;

    const dataRetirada = e.horario_retirada ? parseISO(e.horario_retirada) : null;

    let inicio = dataInicial ? parseISO(dataInicial) : null;
    let fim = dataFinal ? parseISO(dataFinal) : null;

    if (inicio && fim && isAfter(inicio, fim)) {
      [inicio, fim] = [fim, inicio];
    }

    const dentroDataInicio = inicio ? isAfter(dataRetirada, inicio) : true;
    const dentroDataFim = fim ? isAfter(fim, dataRetirada) : true;

    const atendeTexto = textoPesquisa
      ? e.usuario.toLowerCase().includes(textoPesquisa.toLowerCase()) ||
        e.sala.toLowerCase().includes(textoPesquisa.toLowerCase())
      : true;

      return atendeStatus && dentroDataInicio && dentroDataFim && atendeTexto;

  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Histórico de Empréstimos</h1>

      {/* Filtros com botões de limpar */}
      <div className="flex flex-wrap items-end gap-6 px-10 bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
        {/* Campo de Pesquisa */}
        <div className="flex items-center gap-2 px-20">
          <Input
            type="text"
            placeholder="Usuário ou Sala"
            value={textoPesquisa}
            onChange={(e) => setTextoPesquisa(e.target.value)}
            className="w-56"
          />
          {textoPesquisa && (
            <button
              type="button"
              onClick={() => setTextoPesquisa("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-7 h-7 flex items-center justify-center"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Select de Status */}
        <div className="flex items-center gap-2 px-20">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="border rounded h-10 px-3"
          >
            <option value="">Todos</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Em atraso">Em atraso</option>
          </select>
          {statusFiltro && (
            <button
              type="button"
              onClick={() => setStatusFiltro("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-7 h-7 flex items-center justify-center"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Data Inicial */}
        <div className="flex items-center gap-2 px-2">
          <Input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="w-40"
          />
          {dataInicial && (
            <button
              type="button"
              onClick={() => setDataInicial("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-7 h-7 flex items-center justify-center"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Data Final */}
        <div className="flex items-center gap-2 px-2">
          <Input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="w-40"
          />
          {dataFinal && (
            <button
              type="button"
              onClick={() => setDataFinal("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-7 h-7 flex items-center justify-center"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left py-2 px-4">Sala</th>
              <th className="text-left py-2 px-4">Usuário</th>
              <th className="text-left py-2 px-4">Status</th>
              <th className="text-left py-2 px-4">Horário Retirada</th>
              <th className="text-left py-2 px-4">Horário Devolução</th>
            </tr>
          </thead>
          <tbody>
            {emprestimosFiltrados.map((e) => (
              <tr key={e.id} className="border-b">
                <td className="py-2 px-4">{e.sala}</td>
                <td className="py-2 px-4">{e.usuario}</td>
                <td className="py-2 px-4">
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
                <td className="py-2 px-4">
                  {new Date(e.horario_retirada).toLocaleString()}
                </td>
                <td className="py-2 px-4">
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
