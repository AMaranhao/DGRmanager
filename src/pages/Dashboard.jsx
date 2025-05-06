import { useEffect, useState } from 'react';
import { fetchAgendamentos } from '../services/apiService';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, PlusCircle, DoorOpen } from 'lucide-react';

import '@/styles/pages/dashboard.css';
import '@/styles/pages/filters.css';
import '@/styles/pages/modals.css';
import '@/styles/pages/buttons.css';
import '@/styles/pages/status.css';

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
  const [modalAvulsoAberto, setModalAvulsoAberto] = useState(false);

  const [usuarioAvulso, setUsuarioAvulso] = useState('');
  const [tipoSala, setTipoSala] = useState('');
  const [horarioRetirada, setHorarioRetirada] = useState('');
  const [horarioDevolucao, setHorarioDevolucao] = useState('');
  const [predio, setPredio] = useState('');
  const [andar, setAndar] = useState('');
  const [sala, setSala] = useState('');
  const [usarKit, setUsarKit] = useState(false);
  const [kitSelecionado, setKitSelecionado] = useState('');

  useEffect(() => {
    const carregarAgendamentos = async () => {
      const dados = await fetchAgendamentos();
      setAgendamentos(dados);
      const andares = [...new Set(dados.map(item => String(item.sala?.andarId)).filter(Boolean))];
      setAndaresDisponiveis(['Todos', ...andares]);
    };
    carregarAgendamentos();
  }, []);

  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const correspondeAndar = andarSelecionado === 'Todos' || Number(ag.sala?.andarId) === Number(andarSelecionado);
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
      <h3 className="dashboard-heading">Agendamentos Próximos</h3>

      <div className="dashboard-filtro">
        <div className="dashboard-filtro-group">
          <select value={andarSelecionado} onChange={(e) => setAndarSelecionado(e.target.value)} className="dashboard-select">
            {andaresDisponiveis.map((andar, index) => (
              <option key={andar || index} value={andar}>
                {andar === 'Todos' ? 'Todos os Andares' : `Andar ${andar}`}
              </option>
            ))}
          </select>
          {andarSelecionado !== 'Todos' && (
            <button type="button" onClick={() => setAndarSelecionado('Todos')} className="dashboard-filtro-clear" title="Limpar">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="dashboard-filtro-usuario">
          <input
            type="text"
            placeholder="Buscar por usuário ou sala"
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {filtroUsuario && (
            <button onClick={() => setFiltroUsuario('')} className="dashboard-filtro-clear" title="Limpar">
              <X size={14} />
            </button>
          )}
        </div>


        <div className="dashboard-filtro-item" style={{ marginLeft: 'auto' }}>
          <Button className="usuarios-btn-material w-full" onClick={() => setModalAvulsoAberto(true)}>
            Novo Empréstimo
          </Button>
        </div>



        
      </div>

      <div className="dashboard-grid">
        {agendamentosFiltrados.map((ag) => {
          const retirado = ag.retirado === true || ag.retirado === 'true';
          const tileClass = retirado ? 'dashboard-tile dashboard-tile-retirado' : 'dashboard-tile dashboard-tile-aguardando';
          const labelAcao = retirado ? 'Receber' : 'Emprestar';

          return (
            <div key={ag.id} onClick={() => abrirModal(ag)} className={tileClass}>
              <div className="dashboard-sala">
                <DoorOpen className="dashboard-sala-icon"  /> - {ag.sala?.numero}
              </div>
              
              <div className="dashboard-usuario">{ag.usuario}</div>
              <div className="dashboard-acao">{labelAcao}</div>
            </div>
          );
        })}
      </div>

      {modalAberto && (
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogOverlay className="dialog-overlay" />
          <DialogContent className={`dashboard-modal dashboard-no-close ${mensagemSucesso ? 'dashboard-modal-success-bg' : ''}`}>
            <DialogTitle>Confirmação de Senha</DialogTitle>
            <DialogDescription>Digite a senha de 4 dígitos para confirmar a ação.</DialogDescription>
            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

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
                {erroSenha && <div className="dashboard-modal-error">Senha inválida. Digite exatamente 4 dígitos.</div>}
              </>
            )}

            {mensagemSucesso && <div className="dashboard-modal-success-message">{mensagemSucesso}</div>}

            {!mensagemSucesso && (
              <div className="dashboard-modal-actions">
                <Button variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Empréstimo Avulso */}
      {modalAvulsoAberto && (
        <Dialog open={modalAvulsoAberto} onOpenChange={setModalAvulsoAberto}>
          <DialogOverlay className="dialog-overlay" />
          <DialogContent className="dashboard-modal">
            <DialogTitle>Novo Empréstimo Avulso</DialogTitle>
            <DialogDescription></DialogDescription>

            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

            <Input placeholder="CPF" value={usuarioAvulso} onChange={(e) => setUsuarioAvulso(e.target.value)} className="mb-2" />

            <select value={tipoSala} onChange={(e) => setTipoSala(e.target.value)} className="dashboard-select mb-2">
              <option value="">Selecione o tipo de sala</option>
              <option value="auditório">Auditório</option>
              <option value="sala de aula">Sala de Aula</option>
              <option value="laboratório">Laboratório</option>
            </select>

            <Input type="time" placeholder="Horário de Retirada" value={horarioRetirada} onChange={(e) => setHorarioRetirada(e.target.value)} className="mb-2" />
            <Input type="time" placeholder="Horário de Devolução" value={horarioDevolucao} onChange={(e) => setHorarioDevolucao(e.target.value)} className="mb-2" />
            <Input placeholder="Prédio" value={predio} onChange={(e) => setPredio(e.target.value)} className="mb-2" />
            <Input placeholder="Andar" value={andar} onChange={(e) => setAndar(e.target.value)} className="mb-2" />
            <Input placeholder="Sala" value={sala} onChange={(e) => setSala(e.target.value)} className="mb-2" />

            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={usarKit} onChange={(e) => setUsarKit(e.target.checked)} />
              Deseja utilizar um Kit?
            </label>

            {usarKit && (
              <Input placeholder="Kit relacionado à sala" value={kitSelecionado} onChange={(e) => setKitSelecionado(e.target.value)} className="mt-2" />
            )}

            <div className="dashboard-modal-actions mt-4">
              <Button variant="outline" onClick={() => setModalAvulsoAberto(false)}>Cancelar</Button>
              <Button>Confirmar Empréstimo</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
