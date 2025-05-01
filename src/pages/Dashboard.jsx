// src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import { fetchAgendamentos } from '../services/apiService';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [andarSelecionado, setAndarSelecionado] = useState('Todos');
  const [andaresDisponiveis, setAndaresDisponiveis] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => {
    const carregarAgendamentos = async () => {
      const dados = await fetchAgendamentos();
      setAgendamentos(dados);

      const andares = [...new Set(
        dados.map(item => String(item.sala?.andar)).filter(Boolean)
      )];

      setAndaresDisponiveis(['Todos', ...andares]);
    };

    carregarAgendamentos();
  }, []);

  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const correspondeAndar = andarSelecionado === 'Todos' || String(ag.sala?.andar) === String(andarSelecionado);
    const correspondeTexto =
      ag.usuario.toLowerCase().includes(filtroUsuario.toLowerCase()) ||
      ag.sala?.numero.toString().toLowerCase().includes(filtroUsuario.toLowerCase());

    return correspondeAndar && correspondeTexto;
  });

  const abrirModal = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setModalAberto(true);
    setSenha('');
    setErroSenha(false);
    setMensagemSucesso('');
  };

  const confirmarAcao = () => {
    if (senha.length === 4) {
      setMensagemSucesso(`Ação realizada para a sala ${agendamentoSelecionado.sala.numero} com senha ${senha}`);
      setErroSenha(false);
      setTimeout(() => setModalAberto(false), 1500);
    } else {
      setErroSenha(true);
      setMensagemSucesso('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') confirmarAcao();
  };

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Agendamentos do horário atual</h3>

      <div className="dashboard-filtro">
        <select
          value={andarSelecionado}
          onChange={(e) => setAndarSelecionado(e.target.value)}
          className="dashboard-select"
        >
          {andaresDisponiveis.map((andar, index) => (
            <option key={andar || index} value={andar}>
              {andar === 'Todos' ? 'Todos os Andares' : `Andar ${andar}`}
            </option>
          ))}
        </select>

        <div className="dashboard-filtro-usuario">
          <input
            type="text"
            placeholder="Buscar por usuário ou sala"
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {filtroUsuario && (
            <button
              onClick={() => setFiltroUsuario('')}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        {agendamentosFiltrados.map((ag) => {
          const retirado = ag.retirado === true || ag.retirado === "true";
          const tileClass = retirado
            ? 'dashboard-tile dashboard-tile-retirado'
            : 'dashboard-tile dashboard-tile-aguardando';

          const labelAcao = retirado ? 'Receber' : 'Emprestar';

          return (
            <div
              key={ag.id}
              onClick={() => abrirModal(ag)}
              className={tileClass}
            >
              <div className="dashboard-sala">Sala {ag.sala?.numero}</div>
              <div className="dashboard-usuario">{ag.usuario}</div>
              <div className="dashboard-acao">{labelAcao}</div>
            </div>
          );
        })}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogOverlay className="dialog-overlay" />
        <DialogContent className={`dashboard-modal dashboard-no-close ${mensagemSucesso ? 'dashboard-modal-success-bg' : ''}`}>
          <div className="dashboard-modal-title">Confirmação de Senha</div>
          <div className="dashboard-modal-description">
            Digite a senha de 4 dígitos para confirmar a ação.
          </div>
          {!mensagemSucesso && (
            <>
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Senha de 4 dígitos"
                maxLength={4}
                className="dashboard-modal-input"
              />
              {erroSenha && (
                <div className="dashboard-modal-error">Senha inválida. Digite exatamente 4 dígitos.</div>
              )}
            </>
          )}
          {mensagemSucesso && (
            <div className="dashboard-modal-success-message">{mensagemSucesso}</div>
          )}
          {!mensagemSucesso && (
            <div className="dashboard-modal-actions">
              <Button variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
