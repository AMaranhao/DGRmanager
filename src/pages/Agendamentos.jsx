import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
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
    carregarSalas();
    carregarAgendamentos();
    carregarUsuario();
  }, [dataSelecionada, tipoSalaFiltro, andarFiltro, predioFiltro]);

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
  };

  const carregarSalas = async () => {
    const todas = await fetchSalas();
    const filtradas = todas.filter(sala =>
      (!tipoSalaFiltro || sala.tipo?.tipo_sala === tipoSalaFiltro) &&
      (!andarFiltro || String(sala.andar?.id) === String(andarFiltro)) &&
      (!predioFiltro || String(sala.andar?.predio?.id) === String(predioFiltro))
    );
    setSalas(filtradas);
  };

  const carregarAgendamentos = async () => {
    const dados = await fetchAgendamentos();
    setAgendamentos(dados.filter(ag => ag.horario_inicio?.startsWith(dataSelecionada)));
  };

  const carregarUsuario = async () => {
    const me = await fetchUsuarioLogado();
    setUsuarioLogado(me);
  };

  const verificarOcupado = (salaId, horario) => {
    return agendamentos.some(ag => {
      if (ag.sala?.id !== salaId) return false;
  
      const horaAtual = new Date(`${dataSelecionada}T${horario}:00`);
      const inicio = new Date(ag.horario_inicio);
      const fim = new Date(ag.horario_fim);
  
      return horaAtual >= inicio && horaAtual < fim;
    });
  };
  

  const alternarCelula = (salaId, hora) => {
    const chave = `${salaId}-${hora}`;
    const index = selecionados.indexOf(chave);
    if (index !== -1) {
      setSelecionados(selecionados.filter(k => k !== chave));
    } else {
      const selecionadosDaSala = selecionados.filter(k => k.startsWith(`${salaId}-`)).map(k => k.split("-")[1]);
      const todasDaMesmaSala = selecionados.every(k => k.startsWith(`${salaId}-`));
      const indexHora = horarios.indexOf(hora);
      const adjacente = selecionadosDaSala.some(h => Math.abs(horarios.indexOf(h) - indexHora) === 1);
      if (selecionados.length === 0 || (todasDaMesmaSala && (selecionadosDaSala.length === 0 || adjacente))) {
        setSelecionados([...selecionados, chave]);
      }
    }
  };

  const grupoSelecionado = () => {
    if (selecionados.length === 0) return null;
    const [salaId] = selecionados[0].split("-");
    const sala = salas.find(s => s.id === parseInt(salaId));
    const horas = selecionados.map(k => k.split("-")[1]).sort((a, b) => horarios.indexOf(a) - horarios.indexOf(b));
    return { sala, inicio: horas[0], fim: horas[horas.length - 1] };
  };

  const confirmarAgendamento = async () => {
    const grupo = grupoSelecionado();
    if (!grupo || !usuarioLogado) return;
    const body = {
      usuarioId: usuarioLogado.id,
      salaId: grupo.sala.id,
      data: dataSelecionada,
      horario_inicio: `${dataSelecionada}T${grupo.inicio}:00`,
      horario_fim: `${dataSelecionada}T${grupo.fim}:00`
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
      alert("Erro ao agendar. Tente novamente.");
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
            <option value="">Todos os Prédios</option>
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
            const ocupado = verificarOcupado(sala.id, hora);
            const chave = `${sala.id}-${hora}`;
            const selecionado = selecionados.includes(chave);
            return (
              <div
                key={chave}
                className={`celula-sala ${ocupado ? "ocupado" : selecionado ? "selecionado" : "livre"}`}
                onClick={() => {
                  if (ocupado) {
                    const ag = agendamentos.find(ag =>
                      ag.sala?.id === sala.id && ag.horario_inicio.slice(11, 16) === hora
                    );
                    if (ag) abrirModalVisualizar(ag);
                  } else {
                    alternarCelula(sala.id, hora);
                  }
                }}
              />
            );
          })}
        </div>
      ))}
    </div>

    {/* Modal: Confirmar Agendamento */}
    <Dialog open={modalAberto} onOpenChange={setModalAberto}>
      <DialogOverlay className="dialog-overlay" />
      <DialogContent className="dashboard-modal dashboard-no-close">
        <DialogTitle>Confirmar Agendamento</DialogTitle>
        <DialogDescription className="usuarios-modal-descricao">Verifique as informações abaixo:</DialogDescription>
        <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

        {mensagemSucesso ? (
          <div className="dashboard-modal-success-message">{mensagemSucesso}</div>
        ) : grupoSelecionado() && (
          <div className="agendamentos-input-wrapper">
            <p><strong>Usuário:</strong> {usuarioLogado?.firstName} {usuarioLogado?.lastName}</p>
            <p><strong>Sala:</strong> {grupoSelecionado().sala.numero}</p>
            <p><strong>Tipo:</strong> {grupoSelecionado().sala.tipo?.tipo_sala}</p>
            <p><strong>Data:</strong> {new Date(dataSelecionada).toLocaleDateString("pt-BR")}</p>
            <p><strong>Horário:</strong> {grupoSelecionado().inicio} às {grupoSelecionado().fim}</p>
          </div>
        )}

        {!mensagemSucesso && (
          <div className="usuarios-modal-actions">
            <Button variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button onClick={confirmarAgendamento}>Confirmar Agendamento</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Modal: Visualizar Agendamento */}
    <Dialog open={modalVisualizar} onOpenChange={setModalVisualizar}>
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

        {!mensagemSucesso && (
          <div className="usuarios-modal-actions">
            <Button onClick={abrirModalEditar}>Editar</Button>
            <Button variant="destructive" onClick={cancelarAgendamento}>Cancelar Agendamento</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Modal: Editar Agendamento */}
    <Dialog open={modalEditar} onOpenChange={setModalEditar}>
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

        {!mensagemSucesso && (
          <div className="usuarios-modal-actions">
            <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
            <Button onClick={salvarEdicao}>Salvar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </div>
);

}
