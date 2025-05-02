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
import '@/styles/pages/infraestrutura.css';

export default function Infraestrutura() {
  const [tab, setTab] = useState('predios');

  // Estados para Prédios
  const [predios, setPredios] = useState([]);
  const [formPredio, setFormPredio] = useState({ nome: '', endereco: '' });
  const [editandoPredio, setEditandoPredio] = useState(null);
  const [modalPredioAberto, setModalPredioAberto] = useState(false);

  // Estados para Salas
  const [salas, setSalas] = useState([]);
  const [formSala, setFormSala] = useState({ numero: '', tipo: '', ocupada: false });
  const [editandoSala, setEditandoSala] = useState(null);
  const [modalSalaAberto, setModalSalaAberto] = useState(false);

  // Estados para Chaves
  const [chaves, setChaves] = useState([]);
  const [formChave, setFormChave] = useState({ numero: '', numeracaoArmario: '', salaId: '' });
  const [editandoChave, setEditandoChave] = useState(null);
  const [modalChaveAberto, setModalChaveAberto] = useState(false);

  // Estados para Kits
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
    <div className="dashboard-wrapper">
      <h1 className="dashboard-heading">Infraestrutura</h1>

      <Tabs defaultValue="predios" value={tab} onValueChange={setTab} className="infraestrutura-tabs">
        <TabsList className="infraestrutura-tabs-list">
          <TabsTrigger value="predios">Prédios</TabsTrigger>
          <TabsTrigger value="salas">Salas</TabsTrigger>
          <TabsTrigger value="chaves">Chaves</TabsTrigger>
          <TabsTrigger value="kits">Kits</TabsTrigger>
        </TabsList>

        {/* Aba de Prédios */}
        <TabsContent value="predios">
          <div className="infraestrutura-section">
            <h2 className="infraestrutura-section-title">Lista de Prédios</h2>
            <Dialog open={modalPredioAberto} onOpenChange={setModalPredioAberto}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditandoPredio(null); setFormPredio({ nome: '', endereco: '' }); }}>
                  + Cadastrar Prédio
                </Button>
              </DialogTrigger>
              <DialogContent className="infraestrutura-dialog">
                <DialogTitle>{editandoPredio ? 'Editar Prédio' : 'Novo Prédio'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do prédio para {editandoPredio ? 'editar' : 'cadastrar'}.
                </DialogDescription>
                <Input
                  placeholder="Nome do prédio"
                  value={formPredio.nome}
                  onChange={(e) => setFormPredio({ ...formPredio, nome: e.target.value })}
                />
                <Input
                  placeholder="Endereço"
                  value={formPredio.endereco}
                  onChange={(e) => setFormPredio({ ...formPredio, endereco: e.target.value })}
                />
                <Button onClick={() => salvarOuEditar('predio')}>Salvar</Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="usuarios-tabela-wrapper">
            <table className="usuarios-tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Endereço</th>
                  <th className="tabela-col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {predios.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nome}</td>
                    <td>{p.endereco}</td>
                    <td className="tabela-col-acoes">
                      <Button variant="outline" onClick={() => handleEditarPredio(p)}>Editar</Button>
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
          <div className="infraestrutura-section">
            <h2 className="infraestrutura-section-title">Lista de Salas</h2>
            <Dialog open={modalSalaAberto} onOpenChange={setModalSalaAberto}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditandoSala(null); setFormSala({ numero: '', tipo: '', ocupada: false }); }}>
                  + Cadastrar Sala
                </Button>
              </DialogTrigger>
              <DialogContent className="infraestrutura-dialog">
                <DialogTitle>{editandoSala ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da sala para {editandoSala ? 'editar' : 'cadastrar'}.
                </DialogDescription>
                <Input
                  placeholder="Número da sala"
                  value={formSala.numero}
                  onChange={(e) => setFormSala({ ...formSala, numero: e.target.value })}
                />
                <Input
                  placeholder="Tipo da sala"
                  value={formSala.tipo}
                  onChange={(e) => setFormSala({ ...formSala, tipo: e.target.value })}
                />
                <Button onClick={() => salvarOuEditar('sala')}>Salvar</Button>
              </DialogContent>
            </Dialog>
          </div>
          <div className="usuarios-tabela-wrapper">
            <table className="usuarios-tabela">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th className="tabela-col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => (
                  <tr key={sala.id}>
                    <td>{sala.numero}</td>
                    <td>{sala.tipo}</td>
                    <td className="tabela-col-acoes">
                      <Button variant="outline" onClick={() => handleEditarSala(sala)}>Editar</Button>
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
          <div className="infraestrutura-section">
            <h2 className="infraestrutura-section-title">Lista de Chaves</h2>
            <Dialog open={modalChaveAberto} onOpenChange={setModalChaveAberto}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditandoChave(null); setFormChave({ numero: '', numeracaoArmario: '', salaId: '' }); }}>
                  + Cadastrar Chave
                </Button>
              </DialogTrigger>
              <DialogContent className="infraestrutura-dialog">
                <DialogTitle>{editandoChave ? 'Editar Chave' : 'Nova Chave'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da chave para {editandoChave ? 'editar' : 'cadastrar'}.
                </DialogDescription>
                <Input
                  placeholder="Número da chave"
                  value={formChave.numero}
                  onChange={(e) => setFormChave({ ...formChave, numero: e.target.value })}
                />
                <Input
                  placeholder="Numeração do Armário"
                  value={formChave.numeracaoArmario}
                  onChange={(e) => setFormChave({ ...formChave, numeracaoArmario: e.target.value })}
                />
                <Input
                  placeholder="ID da Sala"
                  value={formChave.salaId}
                  onChange={(e) => setFormChave({ ...formChave, salaId: e.target.value })}
                />
                <Button onClick={() => salvarOuEditar('chave')}>Salvar</Button>
              </DialogContent>
            </Dialog>
          </div>
          <div className="usuarios-tabela-wrapper">
            <table className="usuarios-tabela">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Armário</th>
                  <th>Sala ID</th>
                  <th className="tabela-col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {chaves.map((chave) => (
                  <tr key={chave.id}>
                    <td>{chave.numero}</td>
                    <td>{chave.numeracaoArmario}</td>
                    <td>{chave.salaId}</td>
                    <td className="tabela-col-acoes">
                      <Button variant="outline" onClick={() => handleEditarChave(chave)}>Editar</Button>
                      <Button variant="destructive" onClick={() => handleExcluirChave(chave.id)}>Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Aba de Kits */}
        <TabsContent value="kits">
          <div className="infraestrutura-section">
            <h2 className="infraestrutura-section-title">Lista de Kits</h2>
            <Dialog open={modalKitAberto} onOpenChange={setModalKitAberto}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditandoKit(null); setFormKit({ numero: '', numeracaoArmario: '', salaId: '' }); }}>
                  + Cadastrar Kit
                </Button>
              </DialogTrigger>
              <DialogContent className="infraestrutura-dialog">
                <DialogTitle>{editandoKit ? 'Editar Kit' : 'Novo Kit'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do kit para {editandoKit ? 'editar' : 'cadastrar'}.
                </DialogDescription>
                <Input
                  placeholder="Número do kit"
                  value={formKit.numero}
                  onChange={(e) => setFormKit({ ...formKit, numero: e.target.value })}
                />
                <Input
                  placeholder="Numeração do Armário"
                  value={formKit.numeracaoArmario}
                  onChange={(e) => setFormKit({ ...formKit, numeracaoArmario: e.target.value })}
                />
                <Input
                  placeholder="ID da Sala"
                  value={formKit.salaId}
                  onChange={(e) => setFormKit({ ...formKit, salaId: e.target.value })}
                />
                <Button onClick={() => salvarOuEditar('kit')}>Salvar</Button>
              </DialogContent>
            </Dialog>
          </div>
          <div className="usuarios-tabela-wrapper">
            <table className="usuarios-tabela">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Armário</th>
                  <th>Sala ID</th>
                  <th className="tabela-col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {kits.map((kit) => (
                  <tr key={kit.id}>
                    <td>{kit.numero}</td>
                    <td>{kit.numeracaoArmario}</td>
                    <td>{kit.salaId}</td>
                    <td className="tabela-col-acoes">
                      <Button variant="outline" onClick={() => handleEditarKit(kit)}>Editar</Button>
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
