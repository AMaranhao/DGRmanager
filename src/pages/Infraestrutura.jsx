// ✅ src/pages/Infraestrutura.jsx

import { useEffect, useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  fetchPredios,
  createPredio,
  updatePredio,
  deletePredio,
  fetchSalas,
  createSala,
  updateSala,
  deleteSala,
} from '../services/apiService';

export default function Infraestrutura() {
  const [tab, setTab] = useState('predios');

  // Predios
  const [predios, setPredios] = useState([]);
  const [formPredio, setFormPredio] = useState({ nome: '', endereco: '' });
  const [editandoPredio, setEditandoPredio] = useState(null);
  const [modalPredioAberto, setModalPredioAberto] = useState(false);

  // Salas
  const [salas, setSalas] = useState([]);
  const [formSala, setFormSala] = useState({ numero: '', tipo: '', ocupada: false });
  const [editandoSala, setEditandoSala] = useState(null);
  const [modalSalaAberto, setModalSalaAberto] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    setPredios(await fetchPredios());
    setSalas(await fetchSalas());
  };

  const salvarOuEditar = async (tipo) => {
    if (tipo === 'predio') {
      if (editandoPredio) await updatePredio(editandoPredio, formPredio);
      else await createPredio(formPredio);
      setModalPredioAberto(false);
      setFormPredio({ nome: '', endereco: '' });
      setEditandoPredio(null);
      setPredios(await fetchPredios());
    } else if (tipo === 'sala') {
      if (editandoSala) await updateSala(editandoSala, formSala);
      else await createSala(formSala);
      setModalSalaAberto(false);
      setFormSala({ numero: '', tipo: '', ocupada: false });
      setEditandoSala(null);
      setSalas(await fetchSalas());
    }
  };

  const handleEditarPredio = (predio) => {
    setEditandoPredio(predio.id);
    setFormPredio({ nome: predio.nome, endereco: predio.endereco });
    setModalPredioAberto(true);
  };

  const handleExcluirPredio = async (id) => {
    if (confirm('Tem certeza que deseja excluir este prédio?')) {
      await deletePredio(id);
      setPredios(await fetchPredios());
    }
  };

  const handleEditarSala = (sala) => {
    setEditandoSala(sala.id);
    setFormSala({ numero: sala.numero, tipo: sala.tipo, ocupada: sala.ocupada });
    setModalSalaAberto(true);
  };

  const handleExcluirSala = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
      await deleteSala(id);
      setSalas(await fetchSalas());
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Infraestrutura</h1>

      <Tabs defaultValue="predios" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="predios">Prédios</TabsTrigger>
          <TabsTrigger value="salas">Salas</TabsTrigger>
          <TabsTrigger value="chaves">Chaves</TabsTrigger>
          <TabsTrigger value="kits">Kits</TabsTrigger>
        </TabsList>

        {/* Aba de Prédios */}
        <TabsContent value="predios">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lista de Prédios</h2>
            <Dialog open={modalPredioAberto} onOpenChange={setModalPredioAberto}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditandoPredio(null); setFormPredio({ nome: '', endereco: '' }); }}>
                  + Cadastrar Prédio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogTitle>{editandoPredio ? 'Editar Prédio' : 'Novo Prédio'}</DialogTitle>
                <DialogDescription className="mb-4">
                  Preencha os dados do prédio para {editandoPredio ? 'editar' : 'cadastrar'}.
                </DialogDescription>
                <Input
                  placeholder="Nome do prédio"
                  value={formPredio.nome}
                  onChange={(e) => setFormPredio({ ...formPredio, nome: e.target.value })}
                  className="mb-3"
                />
                <Input
                  placeholder="Endereço"
                  value={formPredio.endereco}
                  onChange={(e) => setFormPredio({ ...formPredio, endereco: e.target.value })}
                  className="mb-4"
                />
                <Button onClick={() => salvarOuEditar('predio')}>Salvar</Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Nome</th>
                  <th className="py-2 px-4 border-b">Endereço</th>
                  <th className="py-2 px-4 border-b text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {predios.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-4 border-b">{p.id}</td>
                    <td className="py-2 px-4 border-b">{p.nome}</td>
                    <td className="py-2 px-4 border-b">{p.endereco}</td>
                    <td className="py-2 px-4 border-b text-right">
                      <Button variant="outline" className="mr-2" onClick={() => handleEditarPredio(p)}>Editar</Button>
                      <Button variant="destructive" onClick={() => handleExcluirPredio(p.id)}>Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Aba de Salas */}
        <TabsContent value="salas">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lista de Salas</h2>
            <Dialog open={modalSalaAberto} onOpenChange={setModalSalaAberto}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditandoSala(null); setFormSala({ numero: '', tipo: '', ocupada: false }); }}>
                  + Cadastrar Sala
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogTitle>{editandoSala ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
                <DialogDescription className="mb-4">
                  Preencha os dados da sala para {editandoSala ? 'editar' : 'cadastrar'}.
                </DialogDescription>
                <Input
                  placeholder="Número da sala"
                  value={formSala.numero}
                  onChange={(e) => setFormSala({ ...formSala, numero: e.target.value })}
                  className="mb-3"
                />
                <Input
                  placeholder="Tipo de sala"
                  value={formSala.tipo}
                  onChange={(e) => setFormSala({ ...formSala, tipo: e.target.value })}
                  className="mb-4"
                />
                <Button onClick={() => salvarOuEditar('sala')}>Salvar</Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Número</th>
                  <th className="py-2 px-4 border-b">Tipo</th>
                  <th className="py-2 px-4 border-b text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => (
                  <tr key={sala.id}>
                    <td className="py-2 px-4 border-b">{sala.id}</td>
                    <td className="py-2 px-4 border-b">{sala.numero}</td>
                    <td className="py-2 px-4 border-b">{sala.tipo}</td>
                    <td className="py-2 px-4 border-b text-right">
                      <Button variant="outline" className="mr-2" onClick={() => handleEditarSala(sala)}>Editar</Button>
                      <Button variant="destructive" onClick={() => handleExcluirSala(sala.id)}>Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Futuras abas de Chaves e Kits */}
        <TabsContent value="chaves">Em breve: gerenciamento de chaves.</TabsContent>
        <TabsContent value="kits">Em breve: gerenciamento de kits.</TabsContent>

      </Tabs>
    </div>
  );
}
