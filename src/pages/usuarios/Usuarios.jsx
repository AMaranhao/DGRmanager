// src/pages/Usuarios.jsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchUsuarios, criarUsuario, desativarUsuario } from "@/services/apiService";
import { Plus, Trash, X } from "lucide-react";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [formUsuario, setFormUsuario] = useState({ nome: "", email: "" });
  const [confirmarModalAberto, setConfirmarModalAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  // Filtros
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    const dados = await fetchUsuarios();
    setUsuarios(dados);
  };

  const handleSalvarUsuario = async () => {
    if (!formUsuario.nome.trim() || !formUsuario.email.trim()) return;
    await criarUsuario(formUsuario);
    setFormUsuario({ nome: "", email: "" });
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
    const atendeNome = filtroNome
      ? usuario.nome.toLowerCase().includes(filtroNome.toLowerCase())
      : true;
    const atendeEmail = filtroEmail
      ? usuario.email.toLowerCase().includes(filtroEmail.toLowerCase())
      : true;
    const atendeStatus = filtroStatus
      ? (filtroStatus === "ativo" ? usuario.ativo : !usuario.ativo)
      : true;
    return atendeNome && atendeEmail && atendeStatus;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription className="mb-4">
              Preencha as informações do novo usuário.
            </DialogDescription>
            <Input
              placeholder="Nome"
              value={formUsuario.nome}
              onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })}
              className="mb-3"
            />
            <Input
              placeholder="Email"
              value={formUsuario.email}
              onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
              className="mb-4"
            />
            <Button onClick={handleSalvarUsuario}>Salvar</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4 bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-2 px-2">
          <Input
            type="text"
            placeholder="Filtrar por Nome"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="w-48 h-8 text-sm"
          />
          {filtroNome && (
            <button
              type="button"
              onClick={() => setFiltroNome("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 px-2">
          <Input
            type="text"
            placeholder="Filtrar por Email"
            value={filtroEmail}
            onChange={(e) => setFiltroEmail(e.target.value)}
            className="w-48 h-8 text-sm"
          />
          {filtroEmail && (
            <button
              type="button"
              onClick={() => setFiltroEmail("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 px-2">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 h-8"
          >
            <option value="">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
          {filtroStatus && (
            <button
              type="button"
              onClick={() => setFiltroStatus("")}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full p-1 w-6 h-6 flex items-center justify-center"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="py-2 px-4 border">Nome</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((usuario) => (
              <tr key={usuario.id} className="text-sm">
                <td className="py-2 px-4 border">{usuario.nome}</td>
                <td className="py-2 px-4 border">{usuario.email}</td>
                <td className="py-2 px-4 border">
                  {usuario.ativo ? (
                    <span className="text-green-600 font-semibold">Ativo</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inativo</span>
                  )}
                </td>
                <td className="py-2 px-4 border text-right">
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

      {/* Modal de Confirmação */}
      <Dialog open={confirmarModalAberto} onOpenChange={setConfirmarModalAberto}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Confirmação</DialogTitle>
          <DialogDescription className="mb-4">
            {usuarioSelecionado?.ativo
              ? `Tem certeza que deseja desativar o usuário ${usuarioSelecionado?.nome}?`
              : `Tem certeza que deseja ativar o usuário ${usuarioSelecionado?.nome}?`}
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmarModalAberto(false)}>
              Cancelar
            </Button>
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
