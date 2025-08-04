// Novo módulo adaptado de `Usuarios`, focado em funcionários do sistema jurídico
// Baseado na estrutura da tabela `colaboradores`

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X, Trash, Pencil, Eye } from "lucide-react";
import {
  fetchColaboradores,
  createColaborador,
  updateStatusColaborador,
  updateColaborador,
} from "@/services/ENDPOINTS_ServiceColaboradores";
import {
  fetchCargos,
  fetchEquipes,
} from "@/services/ENDPOINTS_ServiceReferenciais";

import "@/styles/unified_styles.css";

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formColaborador, setFormColaborador] = useState({
    nome: "",
    cpf: "",
    email: "",
    cargoId: "",
    equipeId: "",
    oab: "",
    telefone: "",
    data_admissao: "",
  });

  const nomeInputRef = useRef(null);
  const [cargos, setCargos] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ativo");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [tituloSucesso, setTituloSucesso] = useState("");
  const [confirmarModalAberto, setConfirmarModalAberto] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
  const [erroFormulario, setErroFormulario] = useState("");



  
  useEffect(() => {
    carregarColaboradores();
  }, []);
  
  useEffect(() => {
    if (modalAberto) {
      fetchCargos().then(data => {
        setCargos(data || []);
      });
      fetchEquipes().then(data => {
        setEquipes(data || []);
      });
    }
  }, [modalAberto]);
  
  useEffect(() => {
    if (modalAberto) {
      requestAnimationFrame(() => {
        nomeInputRef.current?.focus(); 
      });
    }
  }, [modalAberto]);
  
  

  const carregarColaboradores = async () => {
    const dados = await fetchColaboradores();
    setColaboradores(dados);
  };

  const limparFormulario = () => {
    setFormColaborador({
      nome: "",
      cpf: "",
      email: "",
      cargoId: "",
      equipeId: "",
      oab: "",
      telefone: "",
      data_admissao: "",
    });
    setErroFormulario("");
    setColaboradorSelecionado(null);
    setEditando(false);
    setModoVisualizacao(false);
  };

  const handleSalvarColaborador = async () => {
    const { nome, cpf, email, cargoId, equipeId, oab, telefone, data_admissao } = formColaborador;
    if (!nome.trim() || !email.includes("@") || !cpf.trim()) {
      setErroFormulario("Preencha os campos obrigatórios corretamente.");
      return;
    }
    const payload = {
      nome,
      cpf: cpf.replace(/\D/g, ""),
      email,
      cargo_id: cargoId,
      equipe_id: equipeId,
      oab,
      telefone,
      data_admissao,
    };

    if (editando && colaboradorSelecionado) {
      await updateColaborador(colaboradorSelecionado.id, payload);
      setTituloSucesso("Funcionário Atualizado");
      setMensagemSucesso("Funcionário atualizado com sucesso!");
    } else {
      await createColaborador(payload);
      setTituloSucesso("Funcionário Cadastrado");
      setMensagemSucesso("Funcionário criado com sucesso!");
    }

    setModalAberto(false);
    limparFormulario();
    setTimeout(() => setMensagemSucesso(""), 2000);
    carregarColaboradores();
  };

  const handleAtivarDesativar = (colaborador) => {
    setColaboradorSelecionado(colaborador);
    setConfirmarModalAberto(true);
  };

  const confirmarAtivarDesativar = async () => {
    if (colaboradorSelecionado) {
      const newStatus = !colaboradorSelecionado.ativo;
      await updateStatusColaborador(colaboradorSelecionado.id, newStatus);
      setConfirmarModalAberto(false);
      setColaboradorSelecionado(null);
      setTituloSucesso(newStatus ? "Funcionário Ativado" : "Funcionário Desativado");
      setMensagemSucesso(`Funcionário ${newStatus ? "ativado" : "desativado"} com sucesso!`);
      setTimeout(() => setMensagemSucesso(""), 2000);
      carregarColaboradores();
    }
  };

  const abrirModalEditar = (colaborador) => {
    setFormColaborador({
      nome: colaborador.nome,
      cpf: colaborador.cpf,
      email: colaborador.email,
      cargoId: colaborador.cargo?.id || "",
      equipeId: colaborador.equipe?.id || "",
      oab: colaborador.oab,
      telefone: colaborador.telefone,
      data_admissao: colaborador.data_admissao,
    });
    setColaboradorSelecionado(colaborador);
    setEditando(true);
    setModoVisualizacao(false);
    setModalAberto(true);
  };

  const abrirModalDetalhar = (colaborador) => {
    abrirModalEditar(colaborador);
    setModoVisualizacao(true);
  };

  const colaboradoresFiltrados = colaboradores.filter((f) => {
    const texto = `${f.nome} ${f.email} ${f.cargo?.nome || ''} ${f.equipe?.nome || ''}`.toLowerCase();
    const atendeTexto = texto.includes(filtroTexto.toLowerCase());
    const atendeStatus = filtroStatus ? (filtroStatus === "ativo" ? f.ativo : !f.ativo) : true;
    return atendeTexto && atendeStatus;
  });

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Colaboradores do Escritório</h3>

      <div className="usuarios-header">
        <div className="usuarios-filtros">
          <div className="dashboard-filtro-group">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="dashboard-select"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="">Todos os Status</option>
            </select>
            {filtroStatus && (
              <button onClick={() => setFiltroStatus("")} className="dashboard-filtro-clear"><X size={14} /></button>
            )}
          </div>

          <div className="dashboard-filtro-group">
            <input
              type="text"
              placeholder="Nome, Email, Cargo ou Equipe"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="dashboard-select dashboard-filtro-usuario-input"
            />
            {filtroTexto && (
              <button onClick={() => setFiltroTexto("")} className="dashboard-filtro-clear"><X size={14} /></button>
            )}
          </div>
        </div>

        <Dialog open={modalAberto} onOpenChange={(v) => {
          setModalAberto(v);
          if (!v) limparFormulario();
        }}>
          <DialogOverlay className="dialog-overlay" />
          <DialogTrigger asChild>
            <Button 
              className="usuarios-btn-material" 
              onClick={(e) => e.currentTarget.blur()}
            >
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="dashboard-modal dashboard-no-close" onOpenAutoFocus={(e) => e.preventDefault()}>
            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>
            <DialogTitle>{modoVisualizacao ? "Detalhes do Colaborador" : editando ? "Editar Colaborador" : "Novo Colaborador"}</DialogTitle>
            <DialogDescription className="usuarios-modal-descricao">{modoVisualizacao ? "Visualize os dados" : "Preencha as informações do funcionário."}</DialogDescription>

            <div className="usuarios-input-wrapper">
              <label htmlFor="input-nome" className="usuarios-label">Nome</label>
              <Input
                id="input-nome"
                ref={editando || modoVisualizacao ? null : nomeInputRef}
                type="text"
                value={formColaborador.nome}
                onChange={(e) => setFormColaborador({ ...formColaborador, nome: e.target.value })}
                className="usuarios-modal-input"
                readOnly={modoVisualizacao}
              />
            </div>

            <div className="usuarios-input-wrapper">
              <label htmlFor="cpf" className="usuarios-label">CPF</label>
              <Input
                id="cpf"
                type="text"
                value={formColaborador.cpf}
                onChange={(e) => setFormColaborador({ ...formColaborador, cpf: e.target.value })}
                className="usuarios-modal-input"
                readOnly={modoVisualizacao}
              />
            </div>

            <div className="usuarios-input-wrapper">
              <label htmlFor="email" className="usuarios-label">Email</label>
              <Input
                id="email"
                type="text"
                value={formColaborador.email}
                onChange={(e) => setFormColaborador({ ...formColaborador, email: e.target.value })}
                className="usuarios-modal-input"
                readOnly={modoVisualizacao}
              />
            </div>

            <div className="usuarios-input-wrapper">
              <label htmlFor="oab" className="usuarios-label">OAB</label>
              <Input
                id="oab"
                type="text"
                value={formColaborador.oab}
                onChange={(e) => setFormColaborador({ ...formColaborador, oab: e.target.value })}
                className="usuarios-modal-input"
                readOnly={modoVisualizacao}
              />
            </div>

            <div className="usuarios-input-wrapper">
              <label htmlFor="telefone" className="usuarios-label">Telefone</label>
              <Input
                id="telefone"
                type="text"
                value={formColaborador.telefone}
                onChange={(e) => setFormColaborador({ ...formColaborador, telefone: e.target.value })}
                className="usuarios-modal-input"
                readOnly={modoVisualizacao}
              />
            </div>

            {modoVisualizacao && (
              <div className="usuarios-input-wrapper">
                <label htmlFor="data_admissao" className="usuarios-label">Data de Admissão</label>
                <Input
                  id="data_admissao"
                  type="date"
                  value={formColaborador.data_admissao}
                  className="usuarios-modal-input"
                  readOnly
                />
              </div>
            )}

            <div className="usuarios-input-wrapper">
              <label htmlFor="select-cargo" className="usuarios-label">Cargo</label>
              <select 
                id="select-cargo"
                disabled={modoVisualizacao} 
                value={formColaborador.cargoId} 
                onChange={(e) => setFormColaborador({ ...formColaborador, cargoId: e.target.value })} 
                className="usuarios-modal-select">
                <option value="">Selecione o Cargo</option>
                {cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div className="usuarios-input-wrapper">
              <label htmlFor="select-equipe" className="usuarios-label">Equipe</label>
              <select 
              id="select-equipe"
              disabled={modoVisualizacao} 
              value={formColaborador.equipeId} 
              onChange={(e) => setFormColaborador({ ...formColaborador, equipeId: e.target.value })} 
              className="usuarios-modal-select">
              <option value="">Selecione a Equipe</option>
              {equipes.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
            </div>

            {!modoVisualizacao && (
              <div className="usuarios-modal-actions">
                <Button onClick={handleSalvarColaborador}>Salvar</Button>
              </div>
            )}
            {erroFormulario && <div className="dashboard-modal-error">{erroFormulario}</div>}
          </DialogContent>
        </Dialog>
      </div>

      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Cargo</th>
              <th>Equipe</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {colaboradoresFiltrados.map((f) => (
              <tr key={f.id}>
                <td>{f.nome}</td>
                <td>{f.email}</td>
                <td>{f.cargo?.nome || "-"}</td>
                <td>{f.equipe?.nome || "-"}</td>
                <td><span className={f.ativo ? "" : "usuarios-status-inativo"}>{f.ativo ? "Ativo" : "Inativo"}</span></td>
                <td className="usuarios-acoes">
                  <Button variant={f.ativo ? "destructive" : "default"} onClick={() => handleAtivarDesativar(f)} className="ativar-desativar-btn">
                    <Trash size={18} className="mr-2" />{f.ativo ? "Desativar" : "Ativar"}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={(e) => { 
                      e.currentTarget.blur(); 
                      abrirModalEditar(f); 
                    }} 
                    className="ml-2"
                  >
                    <Pencil size={16} className="mr-1" />Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={(e) => { 
                      e.currentTarget.blur(); 
                      abrirModalDetalhar(f); 
                    }} 
                    className="ml-2"
                  >
                    <Eye size={16} className="mr-1" />Detalhar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={confirmarModalAberto} onOpenChange={setConfirmarModalAberto}>
        <DialogOverlay className="dialog-overlay" />
        <DialogContent className="dashboard-modal dashboard-no-close">
          <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>
          <DialogTitle>Confirmação</DialogTitle>
          <DialogDescription className="usuarios-modal-descricao">
            {colaboradorSelecionado?.ativo ? `Deseja desativar ${colaboradorSelecionado?.nome}?` : `Deseja ativar ${colaboradorSelecionado?.nome}?`}
          </DialogDescription>
          <div className="usuarios-modal-actions">
            <Button variant={colaboradorSelecionado?.ativo ? "destructive" : "default"} onClick={confirmarAtivarDesativar}>Desativar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!mensagemSucesso} onOpenChange={(open) => !open && setMensagemSucesso("")}>
        <DialogOverlay className="dialog-overlay" />
        <DialogContent className="dashboard-modal dashboard-no-close">
          <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>
          <DialogTitle>{tituloSucesso || "Ação Confirmada"}</DialogTitle>
          <DialogDescription className="usuarios-modal-descricao dashboard-modal-success-message">{mensagemSucesso}</DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
