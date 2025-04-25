import { useEffect, useState } from 'react';
import { fetchEmprestimos } from '../services/apiService';

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

    const dataRetirada = new Date(e.horario_retirada);
    const dataFormatada = dataRetirada.toISOString().slice(0, 10); // retorna YYYY-MM-DD

    const atendeDataInicial = dataInicial
      ? dataFormatada >= dataInicial
      : true;

    const atendeDataFinal = dataFinal
      ? dataFormatada <= dataFinal
      : true;

    const atendeTexto = textoPesquisa
      ? e.usuario.toLowerCase().includes(textoPesquisa.toLowerCase()) ||
        e.sala.toLowerCase().includes(textoPesquisa.toLowerCase())
      : true;

    return atendeStatus && atendeDataInicial && atendeDataFinal && atendeTexto;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Histórico de Empréstimos</h1>

      {/* Filtros lado a lado com espaçamento */}
      <div className="grid grid-cols-4 gap-x-8 items-end mb-6">
        {/* Pesquisa por texto */}
        <div className="px-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pesquisar por Usuário ou Sala:
          </label>
          <input
            type="text"
            placeholder="Digite nome ou sala"
            value={textoPesquisa}
            onChange={(e) => setTextoPesquisa(e.target.value)}
            className="border px-3 py-2 rounded h-10"
          />
        </div>

        {/* Filtro por Status */}
        <div className="px-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Status:
          </label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="border px-3 py-2 rounded h-10"
          >
            <option value="">Todos</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Em atraso">Em atraso</option>
          </select>
        </div>

        {/* Data Inicial */}
        <div className="px-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Inicial:
          </label>
          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="border px-3 py-2 rounded h-10"
          />
        </div>

        {/* Data Final */}
        <div className="px-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Final:
          </label>
          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="border px-3 py-2 rounded h-10"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
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
