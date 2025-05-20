import { useEffect, useState } from 'react';
import { validarSenhaAssinatura, createEmprestimo, updateEmprestimo, fetchTiposSala, fetchAgendamentos, fetchAgendamentosEmprestimos, fetchPredios, fetchAndaresPorPredio, fetchSalas, fetchKits } from '../services/apiService';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, DoorOpen } from 'lucide-react';

import '@/styles/pages/dashboard.css';
import '@/styles/pages/filters.css';
import '@/styles/pages/modals.css';
import '@/styles/pages/buttons.css';
import '@/styles/pages/status.css';
import '@/styles/mobile.css';

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
  const [andaresFiltro, setAndaresFiltro] = useState([]); 
  const [andaresModal, setAndaresModal] = useState([]);  
  const [predioSelecionado, setPredioSelecionado] = useState('');
  const [salasDisponiveis, setSalasDisponiveis] = useState([]);
  const [tiposSala, setTiposSala] = useState([]);
  const [modalStatus, setModalStatus] = useState(''); 
  const [tipoSalaSelecionado, setTipoSalaSelecionado] = useState('Todos');
  const [opcoesHoraDevolucao, setOpcoesHoraDevolucao] = useState([]);
  const [mensagemErroEmprestimo, setMensagemErroEmprestimo] = useState('');
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [modalSenhaEmprestimoAberto, setModalSenhaEmprestimoAberto] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState('');
  const [erroSenhaEmprestimo, setErroSenhaEmprestimo] = useState(false);
  const [agendamentoParaEmprestimo, setAgendamentoParaEmprestimo] = useState(null);


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


/*
//ESSE CODIGO VAI SAIR

const agora = new Date();
console.log("Hora atual (debug):", agora.toLocaleTimeString());


useEffect(() => {
  const agora = new Date();
  console.log("Hora atual do sistema:", agora.toLocaleTimeString());
}, []);

useEffect(() => {
  const intervalo = setInterval(() => {
    const agora = new Date();
    console.log("Hora atual (loop):", agora.toLocaleTimeString());
  }, 60000); // a cada 60 segundos

  return () => clearInterval(intervalo); // limpar no unmount
}, []);

//ESSE CODIGO VAI SAIR

*/

//MODIFICANDO O CODIGO A PARTIR DE AGORA

useEffect(() => {
  if (modalConfirmacaoAberto) {
    const timeout = setTimeout(() => {
      setModalConfirmacaoAberto(false);
    }, 2000);

    return () => clearTimeout(timeout); // limpa se desmontar antes do tempo
  }
}, [modalConfirmacaoAberto]);

useEffect(() => {
  if (modalSenhaEmprestimoAberto) {
    setSenhaDigitada('');
    setErroSenhaEmprestimo(false);
  }
}, [modalSenhaEmprestimoAberto]);

useEffect(() => {
  if (modalAvulsoAberto && formAvulso.predioId) {
    carregarAndaresPorPredio(formAvulso.predioId);
  }
}, [modalAvulsoAberto]);


useEffect(() => {
  if (modalAvulsoAberto) {
    setUsuarioAvulso('');
    setMensagemErroEmprestimo('');
    setMensagemSucesso('');
    setUsarKit(false);
  }
}, [modalAvulsoAberto]);


useEffect(() => {
  if (modalAvulsoAberto && formAvulso.andarId) {
    carregarSalasPorAndar(formAvulso.andarId);
  }
}, [modalAvulsoAberto, formAvulso.andarId]);



useEffect(() => {
  const carregarTiposSala = async () => {
    try {
      const dados = await fetchTiposSala();
      setTiposSala(dados);
    } catch (erro) {
      console.error("Erro ao carregar tipos de sala:", erro);
    }
  };
  carregarTiposSala();
}, []);


  useEffect(() => {
    const carregarSalas = async () => {
      const dados = await fetchSalas();
      setSalasDisponiveis(dados);
    };
    carregarSalas();
  }, []);


useEffect(() => {
  const carregarAgendamentosEmprestimos = async () => {
    try {
      const dados = await fetchAgendamentosEmprestimos();

      const normalizados = dados.map(ag => ({
        ...ag,
        id: ag.emprestimoId 
      }));

      setAgendamentos(normalizados);

      const andaresUnicos = normalizados
        .map(ag => ag.sala?.andar)
        .filter((a, index, self) =>
          a && self.findIndex(o => o?.id === a.id) === index
        )
        .map(a => ({
          id: a.id,
          nome: a.nome,
          predioId: a.predio?.id || null
        }));

      setAndaresFiltro([{ id: 'Todos', nome: 'Todos os Andares' }, ...andaresUnicos]);
    } catch (erro) {
      console.error("Erro ao carregar agendamentos:", erro);
    }
  };

  carregarAgendamentosEmprestimos();
}, []);

  

  useEffect(() => {
    const carregarPredios = async () => {
      const dados = await fetchPredios();
      setPrediosDisponiveis(dados);
  
      if (dados.length > 0) {
        const menorId = Math.min(...dados.map(p => p.id));
        setPredioSelecionado(menorId.toString());
      }
    };
    carregarPredios();
  }, []);
  

  useEffect(() => {
    if (usarKit && formAvulso.sala?.id) {
      carregarKitsPorSala(formAvulso.sala.id);
    } else {
      setKitsFiltrados([]);
      setKitSelecionado('');
    }
  }, [usarKit, formAvulso.sala]);
  

  useEffect(() => {
    if (modalAvulsoAberto && formAvulso.predioId) {
      carregarAndaresPorPredio(formAvulso.predioId);
    }
  }, [modalAvulsoAberto]);
  //alterando codigo aqui mais uma vez agora mais uma vez
// substitui todo o bloco pela versão abaixo

const validarSenhaERegistrarEmprestimo = async () => {
  setErroSenhaEmprestimo(false);
  if (!senhaDigitada || senhaDigitada.length !== 4) {
    setErroSenhaEmprestimo(true);
    return;
  }

  try {
    // Detecta se é um agendamento real (com `usuario`) ou um avulso
    const cpf =
      agendamentoParaEmprestimo?.usuario?.cpf || agendamentoParaEmprestimo?.cpf;

    const resposta = await validarSenhaAssinatura(cpf, senhaDigitada);

    if (resposta.status !== 200 && resposta.status !== 201) {
      setErroSenhaEmprestimo(true);
      return;
    }

    const isDevolucao = agendamentoParaEmprestimo?.retirado === true;

    if (isDevolucao) {
      await updateEmprestimo(agendamentoParaEmprestimo.id, {
        horario_devolucao: new Date().toISOString(),
      });
    } else {
      await createEmprestimo(agendamentoParaEmprestimo);
    }

    setModalSenhaEmprestimoAberto(false);
    setModalConfirmacaoAberto(true);
  } catch (erro) {
    console.error("Erro ao validar senha ou registrar empréstimo:", erro);
    setErroSenhaEmprestimo(true);
  }
};


  const gerarHorasRedondas = (inicioRaw, fimRaw) => {
    const inicio = new Date(inicioRaw);
    const fim = new Date(fimRaw);
  
    const opcoes = [];
    const atual = new Date(inicio);
    atual.setMinutes(0, 0, 0);
  
    if (inicio.getMinutes() > 0) {
      atual.setHours(atual.getHours() + 1);
    }
  
    while (atual <= fim) {
      opcoes.push(atual.toTimeString().slice(0, 5));
      atual.setHours(atual.getHours() + 1);
    }
  
    return opcoes;
  };
  
  
  
  const abrirModalNovoEmprestimo = async (sala, status) => {
    setModalStatus(status);
    const now = new Date();
    const horarioAtual = now.toTimeString().slice(0, 5);
  
    // Define tipo de sala, prédio, andar, sala
    setTipoSala(sala.tipo?.tipo_sala || '');
    setPredio(sala.andar?.predio?.id || '');
    setAndar(sala.andar?.id || '');
    setSala(sala.id);
    setHorarioRetirada(horarioAtual);
  
    // Preenche campos no formulário do modal
    setFormAvulso({
      predioId: sala.andar?.predio?.id || '',
      andarId: sala.andar?.id || '',
      sala: sala
    });
  
    // Se for "Indisponível", calcula apenas a próxima hora cheia
    if (status === 'futuro') {
      const minutos = now.getMinutes();
      const proximaHoraCheia = new Date(now);
      proximaHoraCheia.setMinutes(0, 0, 0);
      if (minutos > 0) {
        proximaHoraCheia.setHours(proximaHoraCheia.getHours() + 1);
      }
  
      const horaFinal = proximaHoraCheia.toTimeString().slice(0, 5);
      setOpcoesHoraDevolucao([horaFinal]);
      setHorarioDevolucao(horaFinal);
      setModalAvulsoAberto(true);
      return;
    }
  
    // Se for "Disponível", calcula todas as horas redondas até o próximo agendamento ou até 19:00
    try {
      const ags = await fetchAgendamentosEmprestimos();
      const hoje = new Date().toISOString().slice(0, 10);
  
      const proxAg = ags
        .filter(ag =>
          ag.sala?.id === sala.id &&
          ag.horario_inicio.startsWith(hoje) &&
          new Date(ag.horario_inicio) > now
        )
        .sort((a, b) => new Date(a.horario_inicio) - new Date(b.horario_inicio))[0];
  
      const fimLimite = proxAg
        ? new Date(proxAg.horario_inicio)
        : new Date(new Date().setHours(19, 0, 0, 0));
  
      // Gerar opções como ["08:00", "09:00", ...]
      const opcoes = gerarHorasRedondas(now, fimLimite);
      setOpcoesHoraDevolucao(opcoes);
      setHorarioDevolucao(opcoes[0]);
      setModalAvulsoAberto(true);
    } catch (erro) {
      console.error("Erro ao buscar agendamentos futuros:", erro);
      const fallback = gerarHorasRedondas(now, new Date(new Date().setHours(19, 0, 0, 0)));
      setOpcoesHoraDevolucao(fallback);
      setHorarioDevolucao(fallback[0]);
      setModalAvulsoAberto(true);
    }
  };
  
  



  const now = new Date();
  const inicioHoraAtual = new Date(now.setMinutes(0, 0, 0));
  const fimHoraAtual = new Date(inicioHoraAtual.getTime() + 60 * 60 * 1000);
  const inicioProximaHora = new Date(fimHoraAtual);
  const fimProximaHora = new Date(inicioProximaHora.getTime() + 60 * 60 * 1000);


  

  

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
    const key = `${value}-${label}`; 
  
    return (
      <option key={key} value={value}>
        {label}
      </option>
    );
  };

  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const correspondePredio = predioSelecionado === 'Todos' || 
      Number(ag.sala?.andar?.predio?.id) === Number(predioSelecionado);
    
    const correspondeAndar = andarSelecionado === 'Todos' ||
      Number(ag.sala?.andar?.id) === Number(andarSelecionado);
    
    const nomeUsuario = 
      `${ag.usuario?.firstName || ''} ${ag.usuario?.lastName || ''}`.toLowerCase();
    const numeroSala = ag.sala?.numero?.toString().toLowerCase() || '';
    const filtro = filtroUsuario.toLowerCase();

    const correspondeTexto =
      nomeUsuario.includes(filtro) || numeroSala.includes(filtro);

      return correspondePredio && correspondeAndar && correspondeTexto;
  });

  const abrirModal = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setModalAberto(true);
    setSenha('');
    setErroSenha(false);
    setMensagemSucesso('');
  };

  const confirmarAcao = async () => {
    if (senha.length === 4) {
      try {
        await updateEmprestimo(agendamentoSelecionado.id, {
          retirado: true,
          horario_devolucao: new Date().toISOString()
        });
  
        setMensagemSucesso(`Devolução registrada para a sala ${agendamentoSelecionado.sala.numero}`);
        setErroSenha(false);
        setTimeout(() => setModalAberto(false), 1500);
      } catch (e) {
        console.error("Erro ao atualizar empréstimo:", e);
        setMensagemSucesso('');
        setErroSenha(true);
      }
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
          <select
            value={predioSelecionado}
            onChange={(e) => {
              setPredioSelecionado(e.target.value);
              setAndarSelecionado('Todos'); 
            }}
            className="dashboard-select"
          >
            
            {prediosDisponiveis.map((p) => (
              <option key={`predio-${p.id}`} value={p.id}>{p.nome}</option>
            ))}
          </select>

          
        </div>
        <div className="dashboard-filtro-group">
          <select
            value={andarSelecionado}
            onChange={(e) => setAndarSelecionado(e.target.value)}
            className="dashboard-select"
            disabled={predioSelecionado === 'Todos'}
            >
            {andaresFiltro
              .filter(andar =>
                andar.id === 'Todos' ||
                (predioSelecionado !== 'Todos' && Number(andar.predioId) === Number(predioSelecionado))
              )
              .map((andar, index) => (
                <option key={`andar-${andar.id}`} value={andar.id}>
                  {andar.nome}
                </option>
              ))}
            </select>
              {andarSelecionado !== 'Todos' && (
                <button type="button" onClick={() => setAndarSelecionado('Todos')} className="dashboard-filtro-clear" title="Limpar">
                  <X size={14} />
                </button>
              )}
         </div>
         <div className="dashboard-filtro-group">
            <select
              value={tipoSalaSelecionado}
              onChange={(e) => setTipoSalaSelecionado(e.target.value)}
              className="dashboard-select"
            >
              <option value="Todos">Todos os Tipos</option>
              {tiposSala.map((tipo) => (
                <option key={`tipo-${tipo.id}`} value={tipo.tipo_sala}>
                  {tipo.tipo_sala}
                </option>
              ))}
            </select>
            {tipoSalaSelecionado !== 'Todos' && (
              <button
                type="button"
                onClick={() => setTipoSalaSelecionado('Todos')}
                className="dashboard-filtro-clear"
                title="Limpar"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="dashboard-filtro-usuario">
            <input
              type="text"
              placeholder="Usuário ou Sala"
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

          {/*}
          <div className="dashboard-filtro-item" style={{ marginLeft: 'auto' }}>
            <Button className="usuarios-btn-material w-full" onClick={() => setModalAvulsoAberto(true)}>
              Novo Empréstimo
            </Button>
          </div>
          {*/}

        
      </div>

          {/*alterando o codigo aqui*/ }

          <div className="dashboard-grid">
            {salasDisponiveis
              .filter((sala) => {
                const andarCorresponde = andarSelecionado === 'Todos' ||
                  sala.andar?.id === Number(andarSelecionado);
              
                const predioCorresponde = predioSelecionado === 'Todos' ||
                  sala.andar?.predio?.id === Number(predioSelecionado);
              
                const tipoCorresponde = tipoSalaSelecionado === 'Todos' ||
                  sala.tipo?.tipo_sala === tipoSalaSelecionado;
              
                  const nomeSala = sala.numero?.toString().toLowerCase() || '';
                  const filtro = filtroUsuario.toLowerCase();
                  
                  const agendamentoAtual = agendamentos.find((ag) =>
                    ag.sala?.id === sala.id &&
                    new Date(ag.horario_inicio) >= new Date(inicioHoraAtual) &&
                    new Date(ag.horario_inicio) < new Date(fimHoraAtual)
                  );
                  
                  const nomeUsuario = agendamentoAtual?.usuario
                    ? `${agendamentoAtual.usuario.firstName} ${agendamentoAtual.usuario.lastName}`.toLowerCase()
                    : '';
                  
                  const textoCorresponde =
                    nomeSala.includes(filtro) || nomeUsuario.includes(filtro);
                  
              
                return andarCorresponde && predioCorresponde && tipoCorresponde && textoCorresponde;
              })
              
              .map((sala) => {
                const agHoraAtual = agendamentos.filter((ag) =>
                  ag.sala?.id === sala.id &&
                  new Date(ag.horario_inicio) >= new Date(inicioHoraAtual) &&
                  new Date(ag.horario_inicio) < new Date(fimHoraAtual)
                );

                const agProximaHora = agendamentos.filter((ag) =>
                  ag.sala?.id === sala.id &&
                  new Date(ag.horario_inicio) >= new Date(inicioProximaHora) &&
                  new Date(ag.horario_inicio) < new Date(fimProximaHora)
                );

                let tileClass = 'dashboard-tile dashboard-tile-passado';
                let labelAcao = '';
                let infoSecundaria = ''; // Nome do usuário ou tipo de sala

                if (agHoraAtual.length > 0) {
                  const agendamento = agHoraAtual[0];
                  const retirado = agendamento.retirado === true || agendamento.retirado === 'true';

                  tileClass = retirado
                    ? 'dashboard-tile dashboard-tile-retirado'
                    : 'dashboard-tile dashboard-tile-aguardando';

                  labelAcao = retirado ? 'Receber' : 'Emprestar';

                  infoSecundaria = agendamento.usuario
                    ? `${agendamento.usuario.firstName} ${agendamento.usuario.lastName}`
                    : '';
                } else {
                  if (agProximaHora.length > 0) {
                    tileClass = 'dashboard-tile dashboard-tile-futuro';
                    labelAcao = 'Indisponível';
                  } else {
                    tileClass = 'dashboard-tile dashboard-tile-passado';
                    labelAcao = 'Disponível';
                  }

                  infoSecundaria = sala.tipo?.tipo_sala || '';
                }

                return (
                  <div
                    key={sala.id}
                    onClick={() => {
                      if (agHoraAtual.length > 0) {
                        const agendamento = agHoraAtual[0];
                        const retirado = agendamento.retirado === true || agendamento.retirado === 'true';
                      
                        const payload = {
                          ...agendamento,
                          retirado: retirado, // usado para decidir se é PUT ou POST
                        };
                      
                        setAgendamentoParaEmprestimo(payload);
                        setModalSenhaEmprestimoAberto(true);
                      }
                      else {
                        abrirModalNovoEmprestimo(sala, agProximaHora.length > 0 ? 'futuro' : 'livre');
                      }
                    }}
                    
                    className={tileClass}
                  >
                    <div className="dashboard-sala">
                      <DoorOpen className="dashboard-sala-icon" /> - {sala.numero}
                    </div>
                    <div className="dashboard-usuario">{infoSecundaria}</div>
                    <div className="dashboard-acao">{labelAcao}</div>
                  </div>
                );
              })}
          </div>



        <div className="dashboard-legenda">
            <span className="legenda-item"><span className="legenda-cor ocupado"></span> Aguardando Devolução</span>
            <span className="legenda-item"><span className="legenda-cor selecionada"></span> Aguardando Retirada</span>
            <span className="legenda-item"><span className="legenda-cor passado"></span> Sala Disponível</span>
            <span className="legenda-item"><span className="legenda-cor futuro"></span> Sala Disponível apenas até próximo horário</span>
        </div>
{/* alterando codigo*/}
        
      

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
              <select
                value={tipoSala}
                onChange={(e) => setTipoSala(e.target.value)}
                className="usuarios-modal-select"
                disabled={modalStatus === 'futuro' || modalStatus === 'livre'}
              >
                <option value="">Selecione o tipo de sala</option>
                {tiposSala.map((tipo) => (
                  <option key={tipo.id} value={tipo.tipo_sala}>
                    {tipo.tipo_sala}
                  </option>
                ))}
              </select>
            </div>


            <div className="usuarios-input-wrapper">
              <Input
                type="time"
                value={horarioRetirada}
                onChange={(e) => setHorarioRetirada(e.target.value)}
                className="usuarios-modal-input"
                disabled={modalStatus === 'futuro' || modalStatus === 'livre'}
              />
            </div>


            <div className="usuarios-input-wrapper">
  <select
    value={horarioDevolucao}
    onChange={(e) => setHorarioDevolucao(e.target.value)}
    className="usuarios-modal-select"
    disabled={modalStatus === 'futuro'}
  >
    {opcoesHoraDevolucao.map((hora) => (
      <option key={hora} value={hora}>{hora}</option>
    ))}
  </select>
</div>



            <select
              value={formAvulso.predioId}
              onChange={e => {
                const id = e.target.value;
                setFormAvulso({ ...formAvulso, predioId: id, andarId: '', sala: null });
                carregarAndaresPorPredio(id);
              }}
              className="usuarios-modal-select"
              disabled={modalStatus === 'futuro' || modalStatus === 'livre'}
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
              disabled={!formAvulso.predioId || modalStatus === 'futuro' || modalStatus === 'livre'}
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
              disabled={!formAvulso.andarId || modalStatus === 'futuro' || modalStatus === 'livre'}
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
                    {kitsFiltrados.map((kit) => (
                      <option key={kit.id} value={kit.id}>
                        {kit.numero}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {mensagemErroEmprestimo && (
                <p className="erro-modal">{mensagemErroEmprestimo}</p>
              )}

            <div className="usuarios-modal-actions mt-4">
              <Button variant="outline" onClick={() => setModalAvulsoAberto(false)}>Cancelar</Button>
              <Button
                onClick={() => {
                  setMensagemErroEmprestimo('');

                  const payload = {
                    cpf: usuarioAvulso,
                    salaId: sala,
                    kitId: usarKit ? kitSelecionado : null,
                    agendamentoId: modalStatus === 'emprestar' ? agendamentoSelecionado?.id || null : null,
                    horario_recepcao: `${new Date().toISOString().slice(0,10)}T${horarioRetirada}:00`,
                    horario_esperado_devolucao: `${new Date().toISOString().slice(0,10)}T${horarioDevolucao}:00`
                  };

                  setAgendamentoParaEmprestimo(payload);
                  setModalAvulsoAberto(false);
                  setModalSenhaEmprestimoAberto(true);
                  }}
                  >
                Confirmar Empréstimo
              </Button>



            </div>
          </DialogContent>

          <Dialog open={modalSenhaEmprestimoAberto} onOpenChange={setModalSenhaEmprestimoAberto}>
            <DialogOverlay className="dialog-overlay" />
            <DialogContent className="dashboard-modal dashboard-no-close">
              <DialogTitle>Confirmação de Senha</DialogTitle>
              <DialogDescription>Digite a senha de 4 dígitos</DialogDescription>
              <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

              <Input
                type="password"
                value={senhaDigitada}
                onChange={(e) => setSenhaDigitada(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    validarSenhaERegistrarEmprestimo();
                  }
                }}
                maxLength={4}
                className="dashboard-modal-input"
              />

              {erroSenhaEmprestimo && (
                <div className="dashboard-modal-error">
                  Senha inválida. Tente novamente.
                </div>
              )}
            </DialogContent>
          </Dialog>
          </Dialog>
            <Dialog open={modalConfirmacaoAberto} onOpenChange={setModalConfirmacaoAberto}>
              <DialogOverlay className="dialog-overlay" />
              <DialogContent className="dashboard-modal dashboard-no-close">
                <DialogTitle>Empréstimo Confirmado</DialogTitle>
                <DialogDescription className="usuarios-modal-descricao dashboard-modal-success-message">
                <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>
                    O empréstimo foi registrado com sucesso!
                </DialogDescription>
            </DialogContent>
          </Dialog>

      
    </div>
  );
}
