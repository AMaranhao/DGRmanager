import { useEffect, useState } from 'react';
import { fetchAgendamentos, fetchPredios, fetchAndaresPorPredio, fetchSalas, fetchKits } from '../services/apiService';
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
  const [andaresFiltro, setAndaresFiltro] = useState([]); // Para o filtro superior
  const [andaresModal, setAndaresModal] = useState([]);   // Para o modal avulso


  const [usuarioAvulso, setUsuarioAvulso] = useState('');
  const [tipoSala, setTipoSala] = useState('');
  const [horarioRetirada, setHorarioRetirada] = useState('');
  const [horarioDevolucao, setHorarioDevolucao] = useState('');
  const [predio, setPredio] = useState('');
  const [andar, setAndar] = useState('');
  const [sala, setSala] = useState('');
  const [usarKit, setUsarKit] = useState(false);
  const [kitSelecionado, setKitSelecionado] = useState('');
  const [prediosDisponiveis, setPrediosDisponiveis] = useState([]);
  const [salasFiltradas, setSalasFiltradas] = useState([]);
  const [kitsFiltrados, setKitsFiltrados] = useState([]);
  const [formAvulso, setFormAvulso] = useState({ predioId: '', andarId: '', sala: null });


  useEffect(() => {
    const carregarAgendamentos = async () => {
      const dados = await fetchAgendamentos();
      setAgendamentos(dados);
      const andares = [...new Set(dados.map(item => String(item.sala?.andarId)).filter(Boolean))];
      setAndaresFiltro(['Todos', ...andares]);
    };
    carregarAgendamentos();
  }, []);

  useEffect(() => {
    const carregarPredios = async () => {
      const dados = await fetchPredios();
      setPrediosDisponiveis(dados);
    };
    carregarPredios();
  }, []);

  useEffect(() => {
    if (usarKit && sala) {
      carregarKitsPorSala(sala);
    } else {
      setKitsFiltrados([]);
      setKitSelecionado('');
    }
  }, [usarKit, sala]);

  useEffect(() => {
    if (modalAvulsoAberto && formAvulso.predioId) {
      carregarAndaresPorPredio(formAvulso.predioId);
    }
  }, [modalAvulsoAberto]);
  

  const carregarAndaresPorPredio = async (predioId) => {
    const dados = await fetchAndaresPorPredio(predioId);
    setAndaresModal(dados); // Agora atualiza o estado certo
  };
  
  

  const carregarSalasPorAndar = async (andarId) => {
    const dados = await fetchSalas();
    const filtradas = dados.filter(s => s.andar?.id === Number(andarId));
    setSalasFiltradas(filtradas);
  };

  const carregarKitsPorSala = async (salaId) => {
    const dados = await fetchKits();
    const filtrados = dados.filter(k => k.sala?.id === Number(salaId));
    setKitsFiltrados(filtrados);
  };

  const renderOptionWithKey = (item, valueField = 'id', labelField = 'nome') => {
    if (!item || !item[valueField] || !item[labelField]) return null;
  
    const value = item[valueField];
    const label = item[labelField];
    const key = `${value}-${label}`; // Combinação segura
  
    return (
      <option key={key} value={value}>
        {label}
      </option>
    );
  };
  
  
  
  
  

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
          {andaresFiltro.map((andar, index) => (
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

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogOverlay className="dialog-overlay" />
          <DialogContent className={`dashboard-modal dashboard-no-close ${mensagemSucesso ? 'dashboard-modal-success-bg' : ''}`}>
            <DialogTitle>Confirmação de Senha</DialogTitle>
            <DialogDescription>Digite a senha de 4 dígitos.</DialogDescription>
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
      

      {/* Modal de Empréstimo Avulso */}

        <Dialog open={modalAvulsoAberto} onOpenChange={setModalAvulsoAberto}>
          <DialogOverlay className="dialog-overlay" />
          <DialogContent className="dashboard-modal dashboard-no-close">
            <DialogTitle>Novo Empréstimo Avulso</DialogTitle>
            <DialogDescription className="usuarios-modal-descricao"></DialogDescription>
            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

            <div className="usuarios-input-wrapper">
              <Input placeholder="CPF" value={usuarioAvulso} onChange={(e) => setUsuarioAvulso(e.target.value)} className="usuarios-modal-input" />
              {usuarioAvulso && (
                <button onClick={() => setUsuarioAvulso('')} className="dashboard-filtro-clear" title="Limpar">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="usuarios-input-wrapper">
              <select value={tipoSala} onChange={(e) => setTipoSala(e.target.value)} className="usuarios-modal-select">
                <option value="">Selecione o tipo de sala</option>
                <option value="auditório">Auditório</option>
                <option value="sala de aula">Sala de Aula</option>
                <option value="laboratório">Laboratório</option>
              </select>
            </div>

            <div className="usuarios-input-wrapper">
              <Input type="time" value={horarioRetirada} onChange={(e) => setHorarioRetirada(e.target.value)} className="usuarios-modal-input" />
            </div>

            <div className="usuarios-input-wrapper">
              <Input type="time" value={horarioDevolucao} onChange={(e) => setHorarioDevolucao(e.target.value)} className="usuarios-modal-input" />
            </div>

            <select
              value={formAvulso.predioId}
              onChange={e => {
                const id = e.target.value;
                setFormAvulso({ ...formAvulso, predioId: id, andarId: '', sala: null });
                carregarAndaresPorPredio(id);
              }}
              className="usuarios-modal-select"
            >
              <option value="">Selecione o Prédio</option>
              {prediosDisponiveis.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>


            <select
              value={formAvulso.andarId || ''}
              onChange={e => {
                const id = e.target.value;
                setFormAvulso({ ...formAvulso, andarId: id, sala: null });
                carregarSalasPorAndar(id);
              }}
              className="usuarios-modal-select"
              disabled={!formAvulso.predioId}
            >
              <option value="">Selecione o Andar</option>
              {andaresModal.map(a => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>



            <select
              value={formAvulso.sala?.id || ''}
              onChange={e => setFormAvulso({
                ...formAvulso,
                sala: salasFiltradas.find(s => s.id === Number(e.target.value))
              })}
              className="usuarios-modal-select"
              disabled={!formAvulso.andarId}
            >
              <option value="">Selecione a Sala</option>
              {salasFiltradas.map(s => (
                <option key={s.id} value={s.id}>{s.numero}</option>
              ))}
            </select>


            <div className="usuarios-input-wrapper mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={usarKit} onChange={(e) => setUsarKit(e.target.checked)} />
                Deseja utilizar um Kit?
              </label>
            </div>

            {usarKit && (
              <div className="usuarios-input-wrapper mt-2">
                <select
                  value={kitSelecionado}
                  onChange={(e) => setKitSelecionado(e.target.value)}
                  className="usuarios-modal-select"
                >
                  <option value="">Selecione o Kit</option>
                  {kitsFiltrados.map((k) => renderOptionWithKey(k, 'id', 'nome'))}

                </select>
              </div>
            )}

            <div className="usuarios-modal-actions mt-4">
              <Button variant="outline" onClick={() => setModalAvulsoAberto(false)}>Cancelar</Button>
              <Button>Confirmar Empréstimo</Button>
            </div>
          </DialogContent>

        </Dialog>
      
    </div>
  );
}
