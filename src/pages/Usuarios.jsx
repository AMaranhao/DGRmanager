import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription,DialogOverlay,} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  fetchUsuarios,
  criarUsuario,
  fetchCursos,
  fetchCargos,
  updateUsuarioSenha,
  updateUsuarioSenhaAssinatura,
  updateUsuarioAtivo
} from "@/services/apiService";
import { Trash, X } from "lucide-react";

import "@/styles/pages/usuarios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/tables.css";
import "@/styles/pages/buttons.css";
import "@/styles/pages/modals.css";
import "@/styles/pages/status.css";
import '@/styles/mobile.css';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [formUsuario, setFormUsuario] = useState({
    firstName: "",
    lastName: "",
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
const [erroFormulario, setErroFormulario] = useState("");
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
    const {
      firstName,
      lastName,
      email,
      cpf,
      matricula,
      telefone,
      senha,
      senhaAssinatura,
      curso,
      cargo,
    } = formUsuario;
  
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.includes('@') ||
      !cpf.trim() ||
      !matricula.trim()
    ) {
      setErroFormulario("Preencha todos os campos obrigatórios corretamente.");
      return;
    }
  
    const payload = {
      firstName,
      lastName,
      email,
      cpf: cpf.replace(/\D/g, ""), 
      matricula,
      telefone,
      senha,
      senhaAssinatura,
      cursoId: typeof curso === 'object' ? curso?.id : curso || null,
      cargoId: typeof cargo === 'object' ? cargo?.id : cargo || null,              
    };
  
    await criarUsuario(payload);
  
    setErroFormulario("");

    setFormUsuario({
      firstName: "",
      lastName: "",
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
      const novoStatus = !usuarioSelecionado.ativo;
      console.log("Enviando para o endpoint:", {
        id: usuarioSelecionado.id,
        ativo: novoStatus
      });
  
      try {
        const resposta = await updateUsuarioAtivo(usuarioSelecionado.id, novoStatus);
        console.log("Resposta da API:", resposta);
        setConfirmarModalAberto(false);
        setUsuarioSelecionado(null);
        carregarUsuarios();
      } catch (error) {
        console.error("Erro ao atualizar status do usuário:", error);
        alert("Erro ao atualizar status do usuário.");
      }
    }
  };
  
  

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const atendeTexto =
    `${usuario.firstName} ${usuario.lastName}`.toLowerCase().includes(filtroTexto.toLowerCase()) ||
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
              placeholder="Nome ou Email"
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
            <Button className="usuarios-btn-material">Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent className="dashboard-modal dashboard-no-close">
            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription className="usuarios-modal-descricao">
              Preencha as informações do novo usuário.
            </DialogDescription>

            {/* Campos de nome */}
            <div className="usuarios-input-wrapper">
              <Input
                type="text"
                placeholder="Primeiro Nome"
                value={formUsuario.firstName}
                onChange={(e) => setFormUsuario({ ...formUsuario, firstName: e.target.value })}
                className="usuarios-modal-input"
              />
              {formUsuario.firstName && (
                <button onClick={() => setFormUsuario({ ...formUsuario, firstName: "" })} className="dashboard-filtro-clear" title="Limpar">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="usuarios-input-wrapper">
              <Input
                type="text"
                placeholder="Último Nome (Sobrenome)"
                value={formUsuario.lastName}
                onChange={(e) => setFormUsuario({ ...formUsuario, lastName: e.target.value })}
                className="usuarios-modal-input"
              />
              {formUsuario.lastName && (
                <button onClick={() => setFormUsuario({ ...formUsuario, lastName: "" })} className="dashboard-filtro-clear" title="Limpar">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* email */}
            
            <div className="usuarios-input-wrapper">
              <Input
                type="email"
                placeholder="Email"
                value={formUsuario.email}
                onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                className="usuarios-modal-input"
              />
              {formUsuario.email && (
                <button onClick={() => setFormUsuario({ ...formUsuario, email: "" })} className="dashboard-filtro-clear" title="Limpar">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* CPF, matrícula, telefone */}
            <div className="usuarios-input-wrapper">
              <Input
                type="text"
                placeholder="CPF"
                value={formUsuario.cpf}
                onChange={(e) => setFormUsuario({ ...formUsuario, cpf: e.target.value })}
                className="usuarios-modal-input"
              />
              {formUsuario.cpf && (
                <button onClick={() => setFormUsuario({ ...formUsuario, cpf: "" })} className="dashboard-filtro-clear" title="Limpar">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="usuarios-input-wrapper">
              <Input
                type="text"
                placeholder="Matrícula"
                value={formUsuario.matricula}
                onChange={(e) => setFormUsuario({ ...formUsuario, matricula: e.target.value })}
                className="usuarios-modal-input"
              />
              {formUsuario.matricula && (
                <button onClick={() => setFormUsuario({ ...formUsuario, matricula: "" })} className="dashboard-filtro-clear" title="Limpar">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="usuarios-input-wrapper">
              <Input
                type="text"
                placeholder="Telefone"
                value={formUsuario.telefone}
                onChange={(e) => setFormUsuario({ ...formUsuario, telefone: e.target.value })}
                className="usuarios-modal-input"
              />
              {formUsuario.telefone && (
                <button onClick={() => setFormUsuario({ ...formUsuario, telefone: "" })} className="dashboard-filtro-clear" title="Limpar">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Senhas */}
            <div className="usuarios-input-wrapper">
              <Input
                type="password"
                placeholder="Senha de Acesso"
                value={formUsuario.senha}
                onChange={(e) => setFormUsuario({ ...formUsuario, senha: e.target.value })}
                className="usuarios-modal-input"
              />
            </div>

            <div className="usuarios-input-wrapper">
              <Input
                type="password"
                placeholder="Senha de Assinatura (4 dígitos)"
                value={formUsuario.senhaAssinatura}
                onChange={(e) => setFormUsuario({ ...formUsuario, senhaAssinatura: e.target.value })}
                className="usuarios-modal-input"
              />
            </div>

            {/* Curso e Cargo */}
            <select value={formUsuario.curso} onChange={(e) => setFormUsuario({ ...formUsuario, curso: e.target.value })} className="usuarios-modal-select">
              <option value="">Selecione o Curso</option>
              {cursos.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>

            <select value={formUsuario.cargo} onChange={(e) => setFormUsuario({ ...formUsuario, cargo: e.target.value })} className="usuarios-modal-select">
              <option value="">Selecione o Cargo</option>
              {cargos.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>

            <div className="usuarios-modal-actions">
              <Button onClick={handleSalvarUsuario}>Salvar</Button>
            </div>

            {erroFormulario && (
              <div className="dashboard-modal-error">
                {erroFormulario}
              </div>
            )}
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
                <td>{usuario.firstName} {usuario.lastName}</td>
                <td>{usuario.email}</td>
                <td>
                  <span className={usuario.ativo ? "" : "usuarios-status-inativo"}>
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="usuarios-acoes">
                <Button
                  variant={usuario.ativo ? "destructive" : "default"}
                  onClick={() => handleAtivarDesativar(usuario)}
                  className={"ativar-desativar-btn"}
                >
                  <Trash size={18} className="mr-2" />
                  {usuario.ativo ? "Desativar" : "Ativar"}
                </Button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
      {confirmarModalAberto && (
      <Dialog open={confirmarModalAberto} onOpenChange={setConfirmarModalAberto}>
        <DialogOverlay className="dialog-overlay" />
        <DialogContent className="dashboard-modal dashboard-no-close">
          <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

          <DialogTitle>Confirmação</DialogTitle>
          <DialogDescription className="usuarios-modal-descricao">
            {usuarioSelecionado?.ativo
              ? `Tem certeza que deseja desativar ${usuarioSelecionado?.firstName} ${usuarioSelecionado?.lastName}?`
              : `Tem certeza que deseja ativar ${usuarioSelecionado?.firstName} ${usuarioSelecionado?.lastName}?`}
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
      )}

    </div>
  );
}
