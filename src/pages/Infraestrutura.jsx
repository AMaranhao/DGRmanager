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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  fetchPredios,
  createPredio,
  updatePredio,
  deletePredio,
} from '../services/apiService';

export default function Infraestrutura() {
  const [predios, setPredios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({ nome: '', endereco: '' });

  const carregarPredios = async () => {
    try {
      setLoading(true);
      const dados = await fetchPredios();
      setPredios(dados);
    } catch (err) {
      setErro('Erro ao carregar prédios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPredios();
  }, []);

  const abrirModalParaEditar = (predio) => {
    setEditandoId(predio.id);
    setForm({ nome: predio.nome, endereco: predio.endereco });
    setModalAberto(true);
  };

  const abrirModalParaNovo = () => {
    setEditandoId(null);
    setForm({ nome: '', endereco: '' });
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    try {
      if (editandoId) {
        await updatePredio(editandoId, { id: editandoId, ...form });
      } else {
        await createPredio(form);
      }
      setModalAberto(false);
      setForm({ nome: '', endereco: '' });
      carregarPredios();
    } catch (err) {
      alert('Erro ao salvar prédio.');
    }
  };

  const handleExcluir = async (id) => {
    if (confirm('Tem certeza que deseja excluir este prédio?')) {
      try {
        await deletePredio(id);
        carregarPredios();
      } catch {
        alert('Erro ao excluir prédio.');
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Infraestrutura</h1>

      <Tabs defaultValue="predios" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="predios">Prédios</TabsTrigger>
          <TabsTrigger value="salas">Salas</TabsTrigger>
          <TabsTrigger value="chaves">Chaves</TabsTrigger>
          <TabsTrigger value="kits">Kits</TabsTrigger>
        </TabsList>

        {/* Aba de PRÉDIOS */}
        <TabsContent value="predios">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lista de Prédios</h2>
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogTrigger asChild>
                <Button onClick={abrirModalParaNovo}>+ Cadastrar Prédio</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <h3 className="text-lg font-semibold mb-4">
                  {editandoId ? 'Editar Prédio' : 'Novo Prédio'}
                </h3>
                <Input
                  placeholder="Nome do prédio"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="mb-3"
                />
                <Input
                  placeholder="Endereço"
                  value={form.endereco}
                  onChange={(e) =>
                    setForm({ ...form, endereco: e.target.value })
                  }
                  className="mb-4"
                />
                <Button onClick={handleSalvar}>Salvar</Button>
              </DialogContent>
            </Dialog>
          </div>

          {loading && <p className="text-gray-500">Carregando prédios...</p>}
          {erro && <p className="text-red-500">{erro}</p>}

          {!loading && !erro && (
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
                        <Button
                          variant="outline"
                          className="mr-2"
                          onClick={() => abrirModalParaEditar(p)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleExcluir(p.id)}
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Abas futuras */}
        <TabsContent value="salas">Em breve: gerenciamento de salas.</TabsContent>
        <TabsContent value="chaves">Em breve: gerenciamento de chaves.</TabsContent>
        <TabsContent value="kits">Em breve: gerenciamento de kits.</TabsContent>
      </Tabs>
    </div>
  );
}
