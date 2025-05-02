import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription,DialogOverlay,} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchUsuarios,criarUsuario,desativarUsuario, fetchCursos, fetchCargos} from "@/services/apiService";
import { Plus, Trash, X } from "lucide-react";

import "@/styles/pages/usuarios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/tables.css";
import "@/styles/pages/buttons.css";
import "@/styles/pages/modals.css";
import "@/styles/pages/status.css";



export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [formUsuario, setFormUsuario] = useState({
    nome: "",
    email: "",
    cpf: "",
    matricula: "",
    telefone: "",
    senha: "",
    senhaAssinatura: "",
    curso: "",
    cargo: ""
  });

  const [cursos, setCursos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [confirmarModalAberto, setConfirmarModalAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  useEffect(() => {
    carregarUsuarios();
    fetchCursos().then(setCursos);
    fetchCargos().then(setCargos);
  }, []);
  
  

  const carregarUsuarios = async () => {
    const dados = await fetchUsuarios();
    setUsuarios(dados);
  };

  const handleSalvarUsuario = async () => {
    if (!formUsuario.nome.trim() || !formUsuario.email.includes("@")) return;
    await criarUsuario(formUsuario);
    setFormUsuario({
      nome: "",
      email: "",
      cpf: "",
      matricula: "",
      telefone: "",
      senha: "",
      senhaAssinatura: "",
      curso: "",
      cargo: ""
    });
    setModalAberto(false);
    carregarUsuarios();
  };

  const handleAtivarDesativar = (usuario) => {
    setUsuarioSelecionado(usuario);
    setConfirmarModalAberto(true);
  };

  const confirmarAtivarDesativar = async () => {
    if (usuarioSelecionado) {
      await desativarUsuario(usuarioSelecionado.id, !usuarioSelecionado.ativo);
      setConfirmarModalAberto(false);
      setUsuarioSelecionado(null);
      carregarUsuarios();
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const atendeTexto =
      usuario.nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      usuario.email.toLowerCase().includes(filtroTexto.toLowerCase());
    const atendeStatus = filtroStatus
      ? filtroStatus === "ativo"
        ? usuario.ativo
        : !usuario.ativo
      : true;
    return atendeTexto && atendeStatus;
  });

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Usuários</h3>

      <div className="usuarios-header">
        <div className="usuarios-filtros">
          <div className="dashboard-filtro-group">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="dashboard-select"
            >
              <option value="">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            {filtroStatus && (
              <button
                onClick={() => setFiltroStatus("")}
                className="dashboard-filtro-clear"
                title="Limpar"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="dashboard-filtro-group">
            <input
              type="text"
              placeholder="Buscar por Nome ou Email"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="dashboard-select dashboard-filtro-usuario-input"
            />
            {filtroTexto && (
              <button
                onClick={() => setFiltroTexto("")}
                className="dashboard-filtro-clear"
                title="Limpar"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogOverlay className="dialog-overlay" />
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="usuarios-modal">
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription className="usuarios-modal-descricao">
              Preencha as informações do novo usuário.
            </DialogDescription>

            {["nome", "email", "cpf", "matricula", "telefone", "senha", "senhaAssinatura"].map((campo) => (
              <div key={campo} className="usuarios-input-wrapper">
                <Input
                  type={campo === "email" ? "email" : "text"}
                  placeholder={campo === "senhaAssinatura" ? "Senha de Assinatura (4 dígitos)" : campo.charAt(0).toUpperCase() + campo.slice(1)}
                  value={formUsuario[campo]}
                  onChange={(e) => setFormUsuario({ ...formUsuario, [campo]: e.target.value })}
                  className="usuarios-modal-input"
                />
                {formUsuario[campo] && (
                  <button
                    onClick={() => setFormUsuario({ ...formUsuario, [campo]: "" })}
                    className="dashboard-filtro-clear"
                    title="Limpar"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}


            <div>
            <select value={formUsuario.curso} onChange={(e) => setFormUsuario({ ...formUsuario, curso: e.target.value })} className="usuarios-modal-select">
              <option value="">Selecione o Curso</option>
              {cursos.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            </div>
            <div>
            <select value={formUsuario.cargo} onChange={(e) => setFormUsuario({ ...formUsuario, cargo: e.target.value })} className="usuarios-modal-select">
              <option value="">Selecione o Cargo</option>
              {cargos.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            </div>
            <div className="usuarios-modal-actions">
              <Button onClick={handleSalvarUsuario}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>
                  <span className={usuario.ativo ? "" : "usuarios-status-inativo"}>
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="usuarios-acoes">
                  <Button
                    size="sm"
                    variant={usuario.ativo ? "destructive" : "default"}
                    onClick={() => handleAtivarDesativar(usuario)}
                    className="flex gap-1"
                  >
                    <Trash size={14} />
                    {usuario.ativo ? "Desativar" : "Ativar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <Dialog open={confirmarModalAberto} onOpenChange={setConfirmarModalAberto}>
        <DialogContent className="usuarios-modal">
          <DialogTitle>Confirmação</DialogTitle>
          <DialogDescription className="usuarios-modal-descricao">
            {usuarioSelecionado?.ativo
              ? `Tem certeza que deseja desativar ${usuarioSelecionado?.nome}?`
              : `Tem certeza que deseja ativar ${usuarioSelecionado?.nome}?`}
          </DialogDescription>
          <div className="usuarios-modal-actions">
            <Button variant="outline" onClick={() => setConfirmarModalAberto(false)}>Cancelar</Button>
            <Button
              variant={usuarioSelecionado?.ativo ? "destructive" : "default"}
              onClick={confirmarAtivarDesativar}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
