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
  fetchAndaresPorPredio,
} from '../services/apiService';
import '@/styles/pages/infraestrutura.css';
import { X } from "lucide-react";

export default function Infraestrutura() {
  const [tab, setTab] = useState('predios');

  // Estados para Prédios
  const [predios, setPredios] = useState([]);
  const [formPredio, setFormPredio] = useState({ nome: '', endereco: '', telefone: '' });
  const [editandoPredio, setEditandoPredio] = useState(null);
  const [modalPredioAberto, setModalPredioAberto] = useState(false);
  const [prediosDisponiveis, setPrediosDisponiveis] = useState([]);
  const [andaresDisponiveis, setAndaresDisponiveis] = useState([]);


  // Estados para Salas
  const [salas, setSalas] = useState([]);
  const [formSala, setFormSala] = useState({numero: '', tipo: '', ocupada: false, esta_ativa: true, predioId: '', andar: null});  
  const [editandoSala, setEditandoSala] = useState(null);
  const [modalSalaAberto, setModalSalaAberto] = useState(false);
  const [salasFiltradas, setSalasFiltradas] = useState([]);

  // Estados para Chaves
  const [chaves, setChaves] = useState([]);
  const [formChave, setFormChave] = useState({ numero: '', numeracaoArmario: '', predioId: '', sala: null });
  const [editandoChave, setEditandoChave] = useState(null);
  const [modalChaveAberto, setModalChaveAberto] = useState(false);

  // Estados para Kits
  const [kits, setKits] = useState([]);
  const [formKit, setFormKit] = useState({ numero: '', numeracaoArmario: '', predioId: '', sala: null, tipo: '' });
  const [editandoKit, setEditandoKit] = useState(null);
  const [modalKitAberto, setModalKitAberto] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  useEffect(() => {
    if (modalSalaAberto && formSala.predioId) {
      carregarAndaresPorPredio(formSala.predioId);
    }
  }, [modalSalaAberto]);
  
  useEffect(() => {
    if (formSala.predioId) {
      carregarAndaresPorPredio(formSala.predioId);
    }
  }, [formSala.predioId]);

  const carregarAndaresPorPredio = async (predioId) => {
    const andares = await fetchAndaresPorPredio(predioId);
    setAndaresDisponiveis(andares);
  };

  const carregarSalasPorAndar = (andarId) => {
    const filtradas = salas.filter(s => s.andar?.id === Number(andarId));
    setSalasFiltradas(filtradas);
  };

  const carregarTudo = async () => {
    setPredios(await fetchPredios());
    setSalas(await fetchSalas());
    setChaves(await fetchChaves());
    setKits(await fetchKits());
  };

  useEffect(() => {
    const carregarPredios = async () => {
      const response = await fetchPredios();
      setPrediosDisponiveis(response);
    };
    carregarPredios();
  }, []);  

  const salvarOuEditar = async (tipo) => {
    if (tipo === 'predio') {
      if (editandoPredio) await updatePredio(editandoPredio, formPredio);
      else await createPredio(formPredio);
      setModalPredioAberto(false);
      setFormPredio({ nome: '', endereco: '', telefone: '' });
      setEditandoPredio(null);
      setPredios(await fetchPredios());
    } else if (tipo === 'sala') {
      if (editandoSala) await updateSala(editandoSala, formSala);
      else await createSala(formSala);
      setModalSalaAberto(false);
      setFormSala({ numero: '', tipo: '', ocupada: false, esta_ativa: true, predioId: '', andarId: '' });
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
      telefone: predio.telefone || ''
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
      esta_ativa: sala.esta_ativa ?? true,
      predioId: sala.predioId || '',
      andarId: sala.andarId || ''
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
      predioId: chave.predioId || '',
      andarId: chave.andarId || '',
      sala: chave.sala || null,
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
      predioId: kit.predioId || '',
      andarId: kit.andarId || '',
      sala: kit.sala || null,
      tipo: kit.tipo || ''
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
                <Button onClick={() => { setEditandoPredio(null); setFormPredio({ nome: '', endereco: '', telefone: '' }); }}>
                  + Cadastrar Prédio
                </Button>
              </DialogTrigger>
              <DialogContent className="usuarios-modal">
                <DialogTitle>{editandoPredio ? 'Editar Prédio' : 'Novo Prédio'}</DialogTitle>
                <DialogDescription className="usuarios-modal-descricao">
                  Preencha os dados do prédio para {editandoPredio ? 'editar' : 'cadastrar'}.
                </DialogDescription>

                <div className="usuarios-input-wrapper">
                  <Input
                    placeholder="Nome do prédio"
                    value={formPredio.nome}
                    onChange={(e) => setFormPredio({ ...formPredio, nome: e.target.value })}
                    className="usuarios-modal-input"
                  />
                  {formPredio.nome && (
                    <button
                      className="dashboard-filtro-clear"
                      onClick={() => setFormPredio({ ...formPredio, nome: '' })}
                      title="Limpar"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="usuarios-input-wrapper">
                  <Input
                    placeholder="Endereço"
                    value={formPredio.endereco}
                    onChange={(e) => setFormPredio({ ...formPredio, endereco: e.target.value })}
                    className="usuarios-modal-input"
                  />
                  {formPredio.endereco && (
                    <button
                      className="dashboard-filtro-clear"
                      onClick={() => setFormPredio({ ...formPredio, endereco: '' })}
                      title="Limpar"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="usuarios-input-wrapper">
                  <Input
                    placeholder="Telefone"
                    value={formPredio.telefone}
                    onChange={(e) => setFormPredio({ ...formPredio, telefone: e.target.value })}
                    className="usuarios-modal-input"
                  />
                  {formPredio.telefone && (
                    <button
                      className="dashboard-filtro-clear"
                      onClick={() => setFormPredio({ ...formPredio, telefone: '' })}
                      title="Limpar"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="usuarios-modal-actions">
                  <Button onClick={() => salvarOuEditar('predio')}>Salvar</Button>
                </div>
              </DialogContent>

            </Dialog>
          </div>

          <div className="usuarios-tabela-wrapper">
            <table className="usuarios-tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Endereço</th>
                  <th>Telefone</th>
                  <th className="tabela-col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {predios.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nome}</td>
                    <td>{p.endereco}</td>
                    <td>{p.telefone}</td>
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
                <Button onClick={() => { setEditandoSala(null); setFormSala({ numero: '', tipo: '', ocupada: false, esta_ativa: true, predioId: '', andarId: '' });}}>
                  + Cadastrar Sala
                </Button>
              </DialogTrigger>
              <DialogContent className="usuarios-modal">
                <DialogTitle>{editandoSala ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
                  <DialogDescription className="usuarios-modal-descricao">
                    Preencha os dados da sala para {editandoSala ? 'editar' : 'cadastrar'}.
                  </DialogDescription>

                  <div className="usuarios-input-wrapper">
                    <Input
                      placeholder="Número da sala"
                      value={formSala.numero}
                      onChange={(e) => setFormSala({ ...formSala, numero: e.target.value })}
                      className="usuarios-modal-input"
                    />
                    {formSala.numero && (
                      <button
                        className="dashboard-filtro-clear"
                        onClick={() => setFormSala({ ...formSala, numero: '' })}
                        title="Limpar"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="usuarios-input-wrapper">
                    <Input
                      placeholder="Tipo da sala"
                      value={formSala.tipo}
                      onChange={(e) => setFormSala({ ...formSala, tipo: e.target.value })}
                      className="usuarios-modal-input"
                    />
                    {formSala.tipo && (
                      <button
                        className="dashboard-filtro-clear"
                        onClick={() => setFormSala({ ...formSala, tipo: '' })}
                        title="Limpar"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="usuarios-input-wrapper">
                    <select
                      value={formSala.predioId}
                      onChange={(e) => {
                        const predioId = e.target.value;
                        setFormSala({ ...formSala, predioId, andar: null });
                        carregarAndaresPorPredio(predioId);
                      }}
                      className="usuarios-modal-select"
                    >
                      <option value="">Selecione o Prédio</option>
                      {prediosDisponiveis.map((p) => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="usuarios-input-wrapper">
                    <select
                      value={formSala.andar?.id || ''}
                      onChange={(e) => {
                        const selectedAndar = andaresDisponiveis.find(a => a.id === Number(e.target.value));
                        setFormSala({ ...formSala, andar: selectedAndar });
                      }}
                      className="usuarios-modal-select"
                      disabled={!formSala.predioId}
                    >
                      <option value="">Selecione o Andar</option>
                      {andaresDisponiveis.map((a) => (
                        <option key={a.id} value={a.id}>{a.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="usuarios-input-wrapper">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formSala.esta_ativa}
                        onChange={(e) => setFormSala({ ...formSala, esta_ativa: e.target.checked })}
                      />
                      Está ativa?
                    </label>
                  </div>

                  <div className="usuarios-modal-actions">
                    <Button onClick={() => salvarOuEditar('sala')}>Salvar</Button>
                  </div>
              </DialogContent>

            </Dialog>
          </div>
          <div className="usuarios-tabela-wrapper">
            <table className="usuarios-tabela">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Andar</th>
                  <th>Ativa</th>
                  <th className="tabela-col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => (
                  <tr key={sala.id}>
                    <td>{sala.numero}</td>
                    <td>{sala.tipo}</td>
                    <td>{sala.andar?.nome}</td>
                    <td>{sala.esta_ativa ? 'Sim' : 'Não'}</td>
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
            <Button onClick={() => setFormChave({ numero: '', numeracaoArmario: '', predioId: '', andarId: '', sala: null })}>
              + Cadastrar Chave
              </Button>
          </DialogTrigger>
          <DialogContent className="usuarios-modal">
            <DialogTitle>{editandoChave ? 'Editar Chave' : 'Nova Chave'}</DialogTitle>
            <DialogDescription className="usuarios-modal-descricao">
              Preencha os dados da chave para {editandoChave ? 'editar' : 'cadastrar'}.
            </DialogDescription>

            <div className="usuarios-input-wrapper">
              <Input
                placeholder="Número da chave"
                value={formChave.numero}
                onChange={e => setFormChave({ ...formChave, numero: e.target.value })}
                className="usuarios-modal-input"
              />
              {formChave.numero && (
                <button
                  className="dashboard-filtro-clear"
                  onClick={() => setFormChave({ ...formChave, numero: '' })}
                  title="Limpar"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="usuarios-input-wrapper">
              <Input
                placeholder="Numeração do Armário"
                value={formChave.numeracaoArmario}
                onChange={e => setFormChave({ ...formChave, numeracaoArmario: e.target.value })}
                className="usuarios-modal-input"
              />
              {formChave.numeracaoArmario && (
                <button
                  className="dashboard-filtro-clear"
                  onClick={() => setFormChave({ ...formChave, numeracaoArmario: '' })}
                  title="Limpar"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
                value={formChave.predioId}
                onChange={e => {
                  const id = e.target.value;
                  setFormChave({ ...formChave, predioId: id, andarId: '', sala: null });
                  carregarAndaresPorPredio(id);
                }}
                className="usuarios-modal-select"
              >
                <option value=''>Selecione o Prédio</option>
                {prediosDisponiveis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>

              <select
                value={formChave.andarId || ''}
                onChange={e => {
                  const id = e.target.value;
                  setFormChave({ ...formChave, andarId: id, sala: null });
                  carregarSalasPorAndar(id);
                }}
                className="usuarios-modal-select"
                disabled={!formChave.predioId}
              >
                <option value=''>Selecione o Andar</option>
                {andaresDisponiveis.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>

              <select
                value={formChave.sala?.id || ''}
                onChange={e => setFormChave({ ...formChave, sala: salasFiltradas.find(s => s.id === Number(e.target.value)) })}
                className="usuarios-modal-select"
                disabled={!formChave.andarId}
              >
                <option value=''>Selecione a Sala</option>
                {salasFiltradas.map(s => <option key={s.id} value={s.id}>{s.numero}</option>)}
              </select>


            <div className="usuarios-modal-actions">
              <Button onClick={() => salvarOuEditar('chave')}>Salvar</Button>
            </div>
          </DialogContent>

        </Dialog>
        </div>

        <div className="usuarios-tabela-wrapper">
          <table className="usuarios-tabela">
            <thead>
              <tr>
                <th>Número</th>
                <th>Armário</th>
                <th>Sala</th>
                <th className="tabela-col-acoes">Ações</th>
              </tr>
            </thead>
            <tbody>
              {chaves.map((chave) => (
                <tr key={chave.id}>
                  <td>{chave.numero}</td>
                  <td>{chave.numeracaoArmario}</td>
                  <td>{chave.salaNumero}</td>
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
            <Button onClick={() => setFormKit({ numero: '', numeracaoArmario: '', predioId: '', andarId: '', sala: null, tipo: '' })}>+ Cadastrar Kit</Button>
          </DialogTrigger>
          <DialogContent className="usuarios-modal">
            <DialogTitle>{editandoKit ? 'Editar Kit' : 'Novo Kit'}</DialogTitle>
            <DialogDescription className="usuarios-modal-descricao">
              Preencha os dados do kit para {editandoKit ? 'editar' : 'cadastrar'}.
            </DialogDescription>

            <div className="usuarios-input-wrapper">
              <Input
                placeholder="Número do kit"
                value={formKit.numero}
                onChange={(e) => setFormKit({ ...formKit, numero: e.target.value })}
                className="usuarios-modal-input"
              />
              {formKit.numero && (
                <button
                  className="dashboard-filtro-clear"
                  onClick={() => setFormKit({ ...formKit, numero: '' })}
                  title="Limpar"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="usuarios-input-wrapper">
              <Input
                placeholder="Numeração do Armário"
                value={formKit.numeracaoArmario}
                onChange={(e) => setFormKit({ ...formKit, numeracaoArmario: e.target.value })}
                className="usuarios-modal-input"
              />
              {formKit.numeracaoArmario && (
                <button
                  className="dashboard-filtro-clear"
                  onClick={() => setFormKit({ ...formKit, numeracaoArmario: '' })}
                  title="Limpar"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="usuarios-input-wrapper">
              <select
                value={formKit.predioId}
                onChange={(e) => {
                  const id = e.target.value;
                  setFormKit({ ...formKit, predioId: id, andarId: '', sala: null });
                  carregarAndaresPorPredio(id);
                }}
                className="usuarios-modal-select"
              >
                <option value="">Selecione o Prédio</option>
                {prediosDisponiveis.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            <div className="usuarios-input-wrapper">
              <select
                value={formKit.andarId || ''}
                onChange={(e) => {
                  const id = e.target.value;
                  setFormKit({ ...formKit, andarId: id, sala: null });
                  carregarSalasPorAndar(id);
                }}
                className="usuarios-modal-select"
                disabled={!formKit.predioId}
              >
                <option value="">Selecione o Andar</option>
                {andaresDisponiveis.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>

            <div className="usuarios-input-wrapper">
              <select
                value={formKit.sala?.id || ''}
                onChange={(e) =>
                  setFormKit({
                    ...formKit,
                    sala: salasFiltradas.find((s) => s.id === Number(e.target.value)),
                  })
                }
                className="usuarios-modal-select"
                disabled={!formKit.andarId}
              >
                <option value="">Selecione a Sala</option>
                {salasFiltradas.map((s) => (
                  <option key={s.id} value={s.id}>{s.numero}</option>
                ))}
              </select>
            </div>

            <div className="usuarios-input-wrapper">
              <Input
                placeholder="Tipo de Kit"
                value={formKit.tipo}
                onChange={(e) => setFormKit({ ...formKit, tipo: e.target.value })}
                className="usuarios-modal-input"
              />
              {formKit.tipo && (
                <button
                  className="dashboard-filtro-clear"
                  onClick={() => setFormKit({ ...formKit, tipo: '' })}
                  title="Limpar"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="usuarios-modal-actions">
              <Button onClick={() => salvarOuEditar('kit')}>Salvar</Button>
            </div>
          </DialogContent>

        </Dialog>
          </div>
          <div className="usuarios-tabela-wrapper">
            <table className="usuarios-tabela">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Armário</th>
                  <th>Sala</th>
                  <th>Tipo de Kit</th>
                  <th className="tabela-col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {kits.map((kit) => (
                  <tr key={kit.id}>
                    <td>{kit.numero}</td>
                    <td>{kit.numeracaoArmario}</td>
                    <td>{kit.salaNumero}</td>
                    <td>{kit.tipo}</td>
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
