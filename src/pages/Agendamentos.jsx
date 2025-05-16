import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { startOfWeek, addDays, format } from "date-fns";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  fetchAgendamentos,
  fetchSalas,
  fetchAndares,
  fetchTiposSala,
  fetchUsuarioLogado,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento
} from "@/services/apiService";
import { X } from "lucide-react";

import "@/styles/pages/agendamentos.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/modals.css";
import "@/styles/pages/buttons.css";
import "@/styles/pages/status.css";
import "@/styles/mobile.css";

export default function Agendamentos() {
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date().toISOString().slice(0, 10));
  const [tipoSalaFiltro, setTipoSalaFiltro] = useState("");
  const [andarFiltro, setAndarFiltro] = useState("");
  const [predioFiltro, setPredioFiltro] = useState("");
  const [salas, setSalas] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [andares, setAndares] = useState([]);
  const [tiposSala, setTiposSala] = useState([]);
  const [predios, setPredios] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [abaSelecionada, setAbaSelecionada] = useState("porSala");
  const [salaSelecionada, setSalaSelecionada] = useState("");
  const [offsetQuinzena, setOffsetQuinzena] = useState(0);


  useEffect(() => {
    setSelecionados([]);
  }, [abaSelecionada, dataSelecionada, salaSelecionada]);
  
  useEffect(() => {
    carregarSalas();
    carregarAgendamentos();
  }, [dataSelecionada, tipoSalaFiltro, andarFiltro, predioFiltro]);
  
  
  function calcularQuinzenaCompleta(dataBase) {
    const segunda = startOfWeek(new Date(dataBase), { weekStartsOn: 1 });
    const inicio = addDays(segunda, offsetQuinzena * 12); 
    const dias = [];
  
    for (let i = 0; i < 12; i++) {
      const dia = addDays(inicio, i);
      dias.push({
        data: dia,
        label: format(dia, "dd/MM"),
        iso: format(dia, "yyyy-MM-dd"),
      });
    }
  
    return dias;
  }
  

  const grupoSelecionado = () => {
    if (selecionados.length === 0) return null;
  
    const primeiroSplit = selecionados[0].split("-");
    const isPorData = primeiroSplit.length === 3;
  
    const salaId = primeiroSplit[0];
    const data = isPorData ? primeiroSplit[1] : dataSelecionada;
  
    const chavesValidas = selecionados
      .filter(k => {
        const partes = k.split("-");
        return partes[0] === salaId && (isPorData ? partes[1] === data : true);
      })
      .sort((a, b) => {
        const horaA = a.split("-").at(-1);
        const horaB = b.split("-").at(-1);
        return horarios.indexOf(horaA) - horarios.indexOf(horaB);
      });
  
    if (chavesValidas.length === 0) return null;
  
    const horaInicio = chavesValidas[0].split("-").at(-1);
    const horaFimRaw = chavesValidas[chavesValidas.length - 1].split("-").at(-1);
    const indexFim = horarios.indexOf(horaFimRaw);
    const horaFim = horarios[indexFim + 1] || horaFimRaw;
  
    // Verifica se são horários consecutivos
    const indices = chavesValidas.map(c => horarios.indexOf(c.split("-").at(-1)));
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] - indices[i - 1] !== 1) return null;
    }
  
    const sala = salas.find(s => s.id.toString() === salaId.toString());
    return { sala, data, inicio: horaInicio, fim: horaFim };
  };
  
  
  const [formEdicao, setFormEdicao] = useState({
    data: "",
    horario_inicio: "",
    horario_fim: ""
  });

  const horarios = [
    "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00"
  ];

  useEffect(() => {
    carregarFiltros();
    carregarUsuario();
  }, []);
  
  

  const carregarFiltros = async () => {
    const [dadosAndares, dadosTipos, dadosPredios] = await Promise.all([
      fetchAndares(),
      fetchTiposSala(),
      fetchSalas().then(salas => {
        const prediosUnicos = salas.map(s => s.andar?.predio)
          .filter((p, i, arr) => p && arr.findIndex(o => o.id === p.id) === i);
        return prediosUnicos;
      })
    ]);
  
    setAndares(dadosAndares);
    setTiposSala(dadosTipos);
    setPredios(dadosPredios);
  
    if (dadosPredios.length > 0) {
      const menorPredioId = dadosPredios.reduce((min, p) => p.id < min ? p.id : min, dadosPredios[0].id);
      setPredioFiltro(String(menorPredioId));
    }
  };
  

  const carregarSalas = async () => {
    const todas = await fetchSalas();
    const filtradas = todas.filter(sala =>
      (!tipoSalaFiltro || sala.tipo?.tipo_sala === tipoSalaFiltro) &&
      (!andarFiltro || String(sala.andar?.id) === String(andarFiltro)) &&
      (!predioFiltro || String(sala.andar?.predio?.id) === String(predioFiltro))
    );
    setSalas(filtradas);
  
    if (abaSelecionada === "porData" && filtradas.length > 0) {
      const menorSalaId = filtradas.reduce((min, s) => s.id < min ? s.id : min, filtradas[0].id);
      setSalaSelecionada(String(menorSalaId));
    }
  };
  

  const carregarAgendamentos = async () => {
    const dados = await fetchAgendamentos();
    setAgendamentos(dados.filter(ag => ag.horario_inicio?.startsWith(dataSelecionada)));
  };

  const carregarUsuario = async () => {
    const me = await fetchUsuarioLogado();
    setUsuarioLogado(me);
  };

  const verificarOcupado = (salaId, horario, dataISO) => {
    return agendamentos.some(ag => {
      if (ag.sala?.id !== salaId) return false;
  
      const horaAtual = new Date(`${dataISO}T${horario}:00`);
      const inicio = new Date(ag.horario_inicio);
      const fim = new Date(ag.horario_fim);
  
      return horaAtual >= inicio && horaAtual < fim;
    });
  };




  
 const alternarCelulaPorSala = (salaId, hora) => {
  const chave = `${salaId}-${hora}`;
  const index = selecionados.indexOf(chave);

  if (index !== -1) {
    setSelecionados(selecionados.filter(k => k !== chave));
  } else {
    const selecionadosDaSala = selecionados
      .filter(k => k.startsWith(`${salaId}-`))
      .map(k => k.split("-")[1]);

    const todasDaMesmaSala = selecionados.every(k => k.startsWith(`${salaId}-`));
    const indexHora = horarios.indexOf(hora);

    const adjacente = selecionadosDaSala.some(h =>
      Math.abs(horarios.indexOf(h) - indexHora) === 1
    );

    if (
      selecionados.length === 0 ||
      (todasDaMesmaSala && (selecionadosDaSala.length === 0 || adjacente))
    ) {
      setSelecionados([...selecionados, chave]);
    }
  }
};

  




  
  const alternarCelulaPorData = (salaId, dataISO, hora) => {
    const chave = `${salaId}-${dataISO}-${hora}`;
  
    setSelecionados((prev) => {

        if (prev.includes(chave)) {
        return prev.filter((k) => k !== chave);
      }
  
      if (prev.length === 0) return [chave];
  
      const primeiroSelecionado = prev[0];
      const partes = primeiroSelecionado.split("-");
      if (partes.length < 3) return prev; // segurança extra
  
      const primeiroDia = partes.slice(1, -1).join("-"); // junta corretamente o dataISO
  
      if (dataISO !== primeiroDia) {
        console.log("⚠️ Dia diferente da seleção inicial.");
        return prev;
      }
  
      return [...prev, chave];
    });
  };
  
  
  
  
  
  
  

  const confirmarAgendamento = async () => {
    setMensagemErro("");
  
    const grupo = grupoSelecionado();

  
    if (!grupo) {
      setMensagemErro("Selecione horários consecutivos válidos para agendamento.");
      return;
    }
  
    if (!usuarioLogado) return;
  
    const dataAgendamento = grupo.data || dataSelecionada;
    const horarioFinal = new Date(`${dataAgendamento}T${grupo.fim}:00`);
    const agora = new Date();
  
    if (horarioFinal < agora) {
      setMensagemErro("Não é possível agendar para data ou horário passado.");
      return;
    }
  
    const body = {
      usuarioId: usuarioLogado.id,
      salaId: grupo.sala.id,
      data: dataAgendamento,
      horario_inicio: `${dataAgendamento}T${grupo.inicio}:00`,
      horario_fim: `${dataAgendamento}T${grupo.fim}:00`
    };
  
    try {
      await createAgendamento(body);
      setMensagemSucesso("Agendamento realizado com sucesso!");
      await carregarAgendamentos();
      setSelecionados([]);
      setTimeout(() => {
        setMensagemSucesso("");
        setModalAberto(false);
      }, 2000);
    } catch {
      setMensagemErro("Erro ao agendar. Tente novamente.");
    }
  };
  

  const abrirModalVisualizar = (ag) => {
    setAgendamentoSelecionado(ag);
    setModalVisualizar(true);
  };

  const abrirModalEditar = () => {
    setFormEdicao({
      data: agendamentoSelecionado.horario_inicio.slice(0, 10),
      horario_inicio: agendamentoSelecionado.horario_inicio.slice(11, 16),
      horario_fim: agendamentoSelecionado.horario_fim.slice(11, 16)
    });
    setModalVisualizar(false);
    setModalEditar(true);
  };

  const salvarEdicao = async () => {
    setMensagemErro("");

    const fimEditado = new Date(`${formEdicao.data}T${formEdicao.horario_fim}:00`);
    const agora = new Date();
  
    if (fimEditado < agora) {
        setMensagemErro("Não é possível editar para um horário passado.");
        return;
    }
      
  
    try {
      await updateAgendamento(agendamentoSelecionado.id, {
        data: formEdicao.data,
        horario_inicio: `${formEdicao.data}T${formEdicao.horario_inicio}:00`,
        horario_fim: `${formEdicao.data}T${formEdicao.horario_fim}:00`
      });
      setMensagemSucesso("Agendamento atualizado com sucesso!");
      await carregarAgendamentos();
      setTimeout(() => {
        setMensagemSucesso("");
        setModalEditar(false);
      }, 2000);
    } catch {
      alert("Erro ao editar. Tente novamente.");
    }
  };
  

  const cancelarAgendamento = async () => {
    setMensagemErro("");

    const fim = new Date(agendamentoSelecionado.horario_fim);
    const agora = new Date();
  
    if (fim < agora) {
        setMensagemErro("Não é possível cancelar um angendamento anterior a data atual");
        return;
    }
  
    try {
      await deleteAgendamento(agendamentoSelecionado.id);
      setMensagemSucesso("Agendamento cancelado com sucesso!");
      await carregarAgendamentos();
      setTimeout(() => {
        setMensagemSucesso("");
        setModalVisualizar(false);
      }, 2000);
    } catch {
      alert("Erro ao cancelar. Tente novamente.");
    }
  };
  

  return (
  <div className="agendamentos-wrapper">
    <h3 className="dashboard-heading">Grade de Agendamentos</h3>
    <div className="dashboard-picklist-wrapper">
        <select
            value={abaSelecionada}
            onChange={(e) => setAbaSelecionada(e.target.value)}
            className="dashboard-select-relatorio"
        >
            <option value="porSala">Visualização pelas Salas</option>
            <option value="porData">Visualização pelas Datas</option>
        </select>
        </div>
            {abaSelecionada === "porSala" && (
        <div className="grade-agendamentos">

        {/* Filtros */}  
        
        <div className="dashboard-filtro" style={{ alignItems: "flex-end" }}>
            <Input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
            />

            <div className="dashboard-filtro-group dashboard-filtro-text">
            <select
                value={predioFiltro}
                onChange={(e) => setPredioFiltro(e.target.value)}
                className="dashboard-select"
            >
                {predios.map((p) => (
                <option key={`predio-${p.id}`} value={p.id}>{p.nome}</option>
                ))}
            </select>
            {predioFiltro && (
                <button onClick={() => setPredioFiltro("")} className="dashboard-filtro-clear" title="Limpar">
                <X size={14} />
                </button>
            )}
            </div>

            <div className="dashboard-filtro-group dashboard-filtro-text">
            <select
                value={andarFiltro}
                onChange={(e) => setAndarFiltro(e.target.value)}
                className="dashboard-select"
            >
                <option value="">Todos os Andares</option>
                {andares
                .filter(a => !predioFiltro || String(a.predio?.id) === predioFiltro)
                .map((a) => (
                    <option key={`andar-${a.id}`} value={a.id}>{a.nome}</option>
                ))}
            </select>
            {andarFiltro && (
                <button onClick={() => setAndarFiltro("")} className="dashboard-filtro-clear" title="Limpar">
                <X size={14} />
                </button>
            )}
            </div>

            <div className="dashboard-filtro-group dashboard-filtro-text">
            <select
                value={tipoSalaFiltro}
                onChange={(e) => setTipoSalaFiltro(e.target.value)}
                className="dashboard-select"
            >
                <option value="">Tipos de Sala</option>
                {tiposSala.map((tipo) => (
                <option key={`tipo-${tipo.id}`} value={tipo.tipo_sala}>
                    {tipo.tipo_sala}
                </option>
                ))}
            </select>
            {tipoSalaFiltro && (
                <button onClick={() => setTipoSalaFiltro("")} className="dashboard-filtro-clear" title="Limpar">
                <X size={14} />
                </button>
            )}
            </div>

            <div style={{ marginLeft: "auto" }}>
            <Button
                className="usuarios-btn-material"
                onClick={() => setModalAberto(true)}
                disabled={selecionados.length === 0}
            >
                Agendar
            </Button>
            </div>
        </div>

        {/* Grade de agendamentos */}
        <div className="grade-agendamentos">
        <div className="linha-header">
            <div className="celula-hora">Horário</div>
            {salas.map(sala => (
            <div key={sala.id} className="celula-sala">{sala.numero}</div>
            ))}
        </div>
        {horarios.map(hora => (
            <div key={hora} className="linha-horario">
            <div className="celula-hora">{hora}</div>
            {salas.map(sala => {
                const ocupado = verificarOcupado(sala.id, hora, dataSelecionada);

                  const agendamentoDoUsuario = agendamentos.some(ag =>
                    ag.sala?.id === sala.id &&
                    ag.usuario?.id === usuarioLogado?.id &&
                    new Date(`${dataSelecionada}T${hora}:00`) >= new Date(ag.horario_inicio) &&
                    new Date(`${dataSelecionada}T${hora}:00`) < new Date(ag.horario_fim)
                  );
                  
                  const chave = `${sala.id}-${hora}`;
                    const selecionado = selecionados.includes(chave);


                    const classes = ocupado
                    ? agendamentoDoUsuario
                        ? "ocupado-usuario"
                        : "ocupado"
                    : selecionado
                        ? "selecionado"
                        : "livre";

                return (
                <div
                    key={chave}
                    className={`celula-sala ${classes}`}
                        onClick={() => {
                        if (ocupado) {
                            const horaAtual = new Date(`${dataSelecionada}T${hora}:00`);
                            const ag = agendamentos.find(ag =>
                            ag.sala?.id === sala.id &&
                            horaAtual >= new Date(ag.horario_inicio) &&
                            horaAtual < new Date(ag.horario_fim)
                            );
                            if (ag) abrirModalVisualizar(ag);
                        }else {
                            alternarCelulaPorSala(sala.id, hora);
                    }
                    }}
                />
                );
            })}
            </div>
        ))}
        </div>
    </div>
    )}

    {abaSelecionada === "porData" && (
    
    <div className="grade-agendamentos">
        {/* Filtro de data */}
        

        <div className="dashboard-filtro" style={{ alignItems: "flex-end" }}>
            <Input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="dashboard-select dashboard-filtro-usuario-input"
            />

            <div className="dashboard-filtro-group dashboard-filtro-text">
                <select
                value={predioFiltro}
                onChange={(e) => setPredioFiltro(e.target.value)}
                className="dashboard-select"
                >
                {predios.map((p) => (
                    <option key={`predio-${p.id}`} value={p.id}>{p.nome}</option>
                ))}
                </select>
                {predioFiltro && (
                <button onClick={() => setPredioFiltro("")} className="dashboard-filtro-clear" title="Limpar">
                    <X size={14} />
                </button>
                )}
            </div>

            <div className="dashboard-filtro-group dashboard-filtro-text">
                <select
                    value={salaSelecionada}
                    onChange={(e) => setSalaSelecionada(e.target.value)}
                    className="dashboard-select"
                    >
                    {salas
                        .filter(sala => !predioFiltro || String(sala.andar?.predio?.id) === predioFiltro)
                        .map((sala) => (
                        <option key={`sala-${sala.id}`} value={sala.id}>
                            {sala.numero} - {sala.tipo?.tipo_sala}
                        </option>
                        ))}
                </select>

                {salaSelecionada && (
                <button onClick={() => setSalaSelecionada("")} className="dashboard-filtro-clear" title="Limpar">
                    <X size={14} />
                </button>
                )}
            </div>

            <div style={{ marginLeft: "auto" }}>
                <Button
                className="usuarios-btn-material"
                onClick={() => setModalAberto(true)}
                disabled={selecionados.length === 0}
                >
                Agendar
                </Button>
            </div>
        </div>

        <div className="dashboard-paginacao-quinzena">
            <Button variant="outline" onClick={() => setOffsetQuinzena(offsetQuinzena - 1)}>
                ← Quinzena anterior
            </Button>
            <Button variant="outline" onClick={() => setOffsetQuinzena(0)}>
                Atual
            </Button>
            <Button variant="outline" onClick={() => setOffsetQuinzena(offsetQuinzena + 1)}>
                Próxima quinzena →
            </Button>
        </div>


        {/* Grade de agendamentos */}
        <div className="grade-agendamentos">
            {/* Cabeçalho com dias da quinzena */}
            <div className="linha-header">
            <div className="celula-hora">Horário</div>
            {calcularQuinzenaCompleta(dataSelecionada).map((dia) => (
                <div key={dia.iso} className="celula-sala">{dia.label}</div>
            ))}
            </div>

            {/* Linhas de horários */}
            {horarios.map((hora) => (
            <div key={hora} className="linha-horario">
                <div className="celula-hora">{hora}</div>
                {calcularQuinzenaCompleta(dataSelecionada).map((dia) => {
                const chave = `${salaSelecionada}-${dia.iso}-${hora}`;
                const selecionado = selecionados.includes(chave);

                const ocupado = agendamentos.some(ag => {
                    return ag.sala?.id === parseInt(salaSelecionada) &&
                           new Date(`${dia.iso}T${hora}:00`) >= new Date(ag.horario_inicio) &&
                           new Date(`${dia.iso}T${hora}:00`) < new Date(ag.horario_fim);
                  });
                  
                  const agendamentoDoUsuario = agendamentos.some(ag => {
                    return ag.sala?.id === parseInt(salaSelecionada) &&
                           ag.usuario?.id === usuarioLogado?.id &&
                           new Date(`${dia.iso}T${hora}:00`) >= new Date(ag.horario_inicio) &&
                           new Date(`${dia.iso}T${hora}:00`) < new Date(ag.horario_fim);
                  });
                  
                  const classes = ocupado
                    ? agendamentoDoUsuario
                      ? "ocupado-usuario"
                      : "ocupado"
                    : selecionado
                      ? "selecionado"
                      : "livre";
                  

                const agendamentoClicado = agendamentos.find(ag => {
                    if (String(ag.sala?.id) !== salaSelecionada) return false;
                    const horaAtual = new Date(`${dia.iso}T${hora}:00`);
                    return horaAtual >= new Date(ag.horario_inicio) && horaAtual < new Date(ag.horario_fim);
                });

                return (
                    <div
                        key={chave}
                        className={`celula-sala ${classes}`}
                        onClick={() => {
                            if (ocupado) {
                              if (agendamentoClicado) abrirModalVisualizar(agendamentoClicado);
                            } else {
                              alternarCelulaPorData(salaSelecionada, dia.iso, hora); // 👈 use esta
                            }
                          }}
                          
                        />
                );
                })}
            </div>
            ))}
        </div>



    </div>
    )}





    {/* Modal: Confirmar Agendamento */}
            <Dialog
                open={modalAberto}
                onOpenChange={(open) => {
                    setModalAberto(open);
                    if (!open) setMensagemErro("");
                }}
                >
                <DialogOverlay className="dialog-overlay" />
                <DialogContent className="dashboard-modal dashboard-no-close">
                    <DialogTitle>Confirmar Agendamento</DialogTitle>
                    <DialogDescription className="usuarios-modal-descricao">
                    Verifique as informações abaixo:
                    </DialogDescription>
                    <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

                    {/* Define o grupo fora do JSX */}
                    {(() => {
                    const grupo = grupoSelecionado();


                    if (mensagemErro) {
                        return <p className="erro-modal">{mensagemErro}</p>;
                    }

                    if (!grupo) return null;

                    return (
                        <>
                        <div className="agendamentos-input-wrapper">
                            <p><strong>Usuário:</strong> {usuarioLogado?.firstName}{" "}{usuarioLogado?.lastName}</p>
                            <p><strong>Sala:</strong> {grupo.sala?.numero || "Indefinida"}</p>
                            <p><strong>Tipo:</strong> {grupo.sala?.tipo?.tipo_sala || "Indefinido"}</p>
                            <p><strong>Data:</strong>{" "}{new Date(grupo.data || dataSelecionada).toLocaleDateString( "pt-BR" )}</p>
                            <p><strong>Horário:</strong> {grupo.inicio} às {grupo.fim}</p>
                        </div>

                        <div className="usuarios-modal-actions">
                            <Button
                            variant="outline"
                            onClick={() => setModalAberto(false)}
                            >
                            Cancelar
                            </Button>
                            <Button onClick={confirmarAgendamento}>
                            Confirmar Agendamento
                            </Button>
                        </div>
                        </>
                    );
                    })()}

                    {mensagemSucesso && (
                    <div className="dashboard-modal-success-message">
                        {mensagemSucesso}
                    </div>
                    )}
                </DialogContent>
                </Dialog>




     {/* Modal: Editar Agendamento */}   
        <Dialog open={modalEditar} onOpenChange={(open) => {
            setModalEditar(open);
            if (!open) setMensagemErro("");
            }}>
            <DialogOverlay className="dialog-overlay" />
            <DialogContent className="dashboard-modal dashboard-no-close">
                <DialogTitle>Editar Agendamento</DialogTitle>
                <DialogDescription className="usuarios-modal-descricao">Atualize os dados abaixo:</DialogDescription>
                <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

                {mensagemSucesso ? (
                <div className="dashboard-modal-success-message">{mensagemSucesso}</div>
                ) : (
                <div className="agendamentos-input-wrapper">
                    <Input type="date" value={formEdicao.data} onChange={e => setFormEdicao({ ...formEdicao, data: e.target.value })} />
                    <Input type="time" value={formEdicao.horario_inicio} onChange={e => setFormEdicao({ ...formEdicao, horario_inicio: e.target.value })} />
                    <Input type="time" value={formEdicao.horario_fim} onChange={e => setFormEdicao({ ...formEdicao, horario_fim: e.target.value })} />
                </div>
                )}

                {mensagemErro && <p className="erro-modal">{mensagemErro}</p>}

                {!mensagemSucesso && (
                <div className="usuarios-modal-actions">
                    <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
                    <Button onClick={salvarEdicao}>Salvar</Button>
                </div>
                )}
            </DialogContent>
        </Dialog>



    {/* Modal: Visualizar Agendamento */}
        <Dialog open={modalVisualizar} onOpenChange={(open) => {
            setModalVisualizar(open);
            if (!open) setMensagemErro("");
            }}>
            <DialogOverlay className="dialog-overlay" />
            <DialogContent className="dashboard-modal dashboard-no-close">
                <DialogTitle>Agendamento</DialogTitle>
                <DialogDescription className="usuarios-modal-descricao">Dados do Agendamento</DialogDescription>
                <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

                {mensagemSucesso ? (
                <div className="dashboard-modal-success-message">{mensagemSucesso}</div>
                ) : agendamentoSelecionado && (
                <div className="agendamentos-input-wrapper">
                    <p><strong>Usuário:</strong> {agendamentoSelecionado.usuario?.firstName} {agendamentoSelecionado.usuario?.lastName}</p>
                    <p><strong>Sala:</strong> {agendamentoSelecionado.sala?.numero}</p>
                    <p><strong>Tipo:</strong> {agendamentoSelecionado.sala?.tipo?.tipo_sala}</p>
                    <p><strong>Data:</strong> {new Date(agendamentoSelecionado.horario_inicio).toLocaleDateString("pt-BR")}</p>
                    <p><strong>Horário:</strong> {agendamentoSelecionado.horario_inicio.slice(11, 16)} às {agendamentoSelecionado.horario_fim.slice(11, 16)}</p>
                </div>
                )}

                {mensagemErro && <p className="erro-modal">{mensagemErro}</p>}

                {!mensagemSucesso && (
                <div className="usuarios-modal-actions">
                    <Button onClick={abrirModalEditar}>Editar</Button>
                    <Button variant="destructive" onClick={cancelarAgendamento}>Cancelar Agendamento</Button>
                </div>
                )}
            </DialogContent>
        </Dialog>



  </div>
);

}
