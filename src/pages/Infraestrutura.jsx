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
  fetchChaves,  
  createChave,
  updateChave,
  deleteChave,
  fetchKits,     
  createKit,
  updateKit,
  deleteKit,
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

  // Chaves
  const [chaves, setChaves] = useState([]);
  const [formChave, setFormChave] = useState({ numero: '', numeracaoArmario: '', salaId: '' });
  const [editandoChave, setEditandoChave] = useState(null);
  const [modalChaveAberto, setModalChaveAberto] = useState(false);

  // Kits
  const [kits, setKits] = useState([]);
  const [formKit, setFormKit] = useState({ numero: '', numeracaoArmario: '', salaId: '' });
  const [editandoKit, setEditandoKit] = useState(null);
  const [modalKitAberto, setModalKitAberto] = useState(false);


  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    setPredios(await fetchPredios());
    setSalas(await fetchSalas());
    setChaves(await fetchChaves()); 
    setKits(await fetchKits()); 
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
    } else if (tipo === 'chave') {
      if (editandoChave) await updateChave(editandoChave, formChave);
      else await createChave(formChave);
      setModalChaveAberto(false);
      setFormChave({ numero: '', numeracaoArmario: '', salaId: '' });
      setEditandoChave(null);
      setChaves(await fetchChaves());
    } else if (tipo === 'kit') {
      if (editandoKit) await updateKit(editandoKit, formKit);
      else await createKit(formKit);
      setModalKitAberto(false);
      setFormKit({ numero: '', numeracaoArmario: '', salaId: '' });
      setEditandoKit(null);
      setKits(await fetchKits());
    }
    
  };

  const handleEditarPredio = (predio) => {
    setEditandoPredio(predio.id);
    setFormPredio({
      nome: predio.nome || '',
      endereco: predio.endereco || '',
    });
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
    setFormSala({
      numero: sala.numero || '',
      tipo: sala.tipo || '',
      ocupada: sala.ocupada || false,
    });
    setModalSalaAberto(true);
  };

  const handleExcluirSala = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
      await deleteSala(id);
      setSalas(await fetchSalas());
    }
  };

  const handleEditarChave = (chave) => {
    setEditandoChave(chave.id);
    setFormChave({
      numero: chave.numero || '',
      numeracaoArmario: chave.numeracaoArmario || '',
      salaId: chave.salaId || '',
    });
    setModalChaveAberto(true);
  };
  
  const handleExcluirChave = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta chave?')) {
      await deleteChave(id);
      setChaves(await fetchChaves());
    }
  };

  const handleEditarKit = (kit) => {
    setEditandoKit(kit.id);
    setFormKit({
      numero: kit.numero || '',
      numeracaoArmario: kit.numeracaoArmario || '',
      salaId: kit.salaId || '',
    });
    setModalKitAberto(true);
  };
  
  const handleExcluirKit = async (id) => {
    if (confirm('Tem certeza que deseja excluir este kit?')) {
      await deleteKit(id);
      setKits(await fetchKits());
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

        {/* Aba de Chaves */}
        <TabsContent value="chaves">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lista de Chaves</h2>
            <Dialog open={modalChaveAberto} onOpenChange={setModalChaveAberto}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditandoChave(null); setFormChave({ numero: '', numeracaoArmario: '', salaId: '' }); setModalChaveAberto(true); }}>
                  + Cadastrar Chave
                </Button>
              </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogTitle className="text-lg font-semibold mb-4">
                    {editandoChave ? 'Editar Chave' : 'Nova Chave'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 mb-4">
                    Preencha as informações da chave.
                  </DialogDescription>
                  
                  <Input
                    placeholder="Número da chave"
                    value={formChave.numero}
                    onChange={(e) => setFormChave({ ...formChave, numero: e.target.value })}
                    className="mb-3"
                  />
                  <Input
                    placeholder="Numeração do Armário"
                    value={formChave.numeracaoArmario}
                    onChange={(e) => setFormChave({ ...formChave, numeracaoArmario: e.target.value })}
                    className="mb-3"
                  />
                  <Input
                    placeholder="ID da Sala"
                    value={formChave.salaId}
                    onChange={(e) => setFormChave({ ...formChave, salaId: e.target.value })}
                    className="mb-4"
                  />
                  <Button onClick={() => salvarOuEditar('chave')}>Salvar</Button>
                </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Número</th>
                  <th className="py-2 px-4 border-b">Armário</th>
                  <th className="py-2 px-4 border-b">Sala ID</th>
                  <th className="py-2 px-4 border-b text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {chaves.map((chave) => (
                  <tr key={chave.id}>
                    <td className="py-2 px-4 border-b">{chave.id}</td>
                    <td className="py-2 px-4 border-b">{chave.numero}</td>
                    <td className="py-2 px-4 border-b">{chave.numeracaoArmario}</td>
                    <td className="py-2 px-4 border-b">{chave.salaId}</td>
                    <td className="py-2 px-4 border-b text-right">
                      <Button
                        variant="outline"
                        className="mr-2"
                        onClick={() => handleEditarChave(chave)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleExcluirChave(chave.id)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>


        {/* Aba de Kit */}
        <TabsContent value="kits">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lista de Kits</h2>
            <Dialog open={modalKitAberto} onOpenChange={setModalKitAberto}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditandoKit(null); setFormKit({ numero: '', numeracaoArmario: '', salaId: '' }); }}>
                  + Cadastrar Kit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogTitle className="text-lg font-semibold mb-4">
                  {editandoKit ? 'Editar Kit' : 'Novo Kit'}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mb-4">
                  Preencha as informações do Kit.
                </DialogDescription>

                <Input
                  placeholder="Número do Kit"
                  value={formKit.numero}
                  onChange={(e) => setFormKit({ ...formKit, numero: e.target.value })}
                  className="mb-3"
                />
                <Input
                  placeholder="Numeração do Armário"
                  value={formKit.numeracaoArmario}
                  onChange={(e) => setFormKit({ ...formKit, numeracaoArmario: e.target.value })}
                  className="mb-3"
                />
                <Input
                  placeholder="ID da Sala"
                  value={formKit.salaId}
                  onChange={(e) => setFormKit({ ...formKit, salaId: e.target.value })}
                  className="mb-4"
                />
                <Button onClick={() => salvarOuEditar('kit')}>Salvar</Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Número</th>
                  <th className="py-2 px-4 border-b">Armário</th>
                  <th className="py-2 px-4 border-b">Sala ID</th>
                  <th className="py-2 px-4 border-b text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {kits.map((kit) => (
                  <tr key={kit.id}>
                    <td className="py-2 px-4 border-b">{kit.id}</td>
                    <td className="py-2 px-4 border-b">{kit.numero}</td>
                    <td className="py-2 px-4 border-b">{kit.numeracaoArmario}</td>
                    <td className="py-2 px-4 border-b">{kit.salaId}</td>
                    <td className="py-2 px-4 border-b text-right">
                      <Button variant="outline" className="mr-2" onClick={() => handleEditarKit(kit)}>Editar</Button>
                      <Button variant="destructive" onClick={() => handleExcluirKit(kit.id)}>Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
