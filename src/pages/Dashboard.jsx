import { useEffect, useState } from 'react';
import { fetchAgendamentos } from '../services/apiService';

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [andarSelecionado, setAndarSelecionado] = useState('');
  const [andaresDisponiveis, setAndaresDisponiveis] = useState([]);

  useEffect(() => {
    const carregarAgendamentos = async () => {
      const dados = await fetchAgendamentos();
      setAgendamentos(dados);

      const andares = [...new Set(
        dados.map(item => item.sala?.numero?.charAt(0)).filter(Boolean)
      )];

      setAndaresDisponiveis(andares);
      setAndarSelecionado(andares[0] || '');
    };

    carregarAgendamentos();
  }, []);

  const agendamentosFiltrados = agendamentos.filter(
    (ag) => ag.sala?.numero?.startsWith(andarSelecionado)
  );

  const handleClickTile = (agendamento) => {
    const senha = prompt("Digite a senha de 4 dígitos:");
    if (senha && senha.length === 4) {
      alert(`Ação realizada para a sala ${agendamento.sala.numero} com senha ${senha}`);
    } else {
      alert("Senha inválida.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Agendamentos do horário atual</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar andar:</label>
        <select
          value={andarSelecionado}
          onChange={(e) => setAndarSelecionado(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {andaresDisponiveis.map((andar, index) => (
            <option key={andar || index} value={andar}>
              Andar {andar}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {agendamentosFiltrados.map((ag) => {
          const retirado = ag.retirado === true || ag.retirado === "true";
          const bgColor = retirado ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]';
          const textColor = retirado ? 'text-red-800' : 'text-blue-900';

          return (
            <div
              key={ag.id}
              onClick={() => handleClickTile(ag)}
              className={`cursor-pointer p-6 rounded-lg shadow-md text-center transition-transform duration-200 hover:scale-[1.03] ${bgColor} ${textColor} w-full max-w-[260px] min-h-[140px] mx-auto`}
            >
              <div className="text-xl font-bold mb-2">
                Sala {ag.sala?.numero}
              </div>
              <div className="text-sm font-medium">{ag.usuario}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
