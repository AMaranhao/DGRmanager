// Novo módulo ParteAdversa.jsx adaptado do Colaboradores.jsx

import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { X, Trash, Pencil, Eye, FileEdit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "@/components/ui/dialog";

import {
  fetchParteAdversa,
  createParteAdversa,
  updateParteAdversa,
} from "@/services/ENDPOINTS_ServiceParteAdversa";

import {
  findContratoByNumero,
  createParteContrato,
  createContratoComParte,
} from "@/services/ENDPOINTS_ServiceContratos";

import { 
  deleteParteContrato 
} from "@/services/ENDPOINTS_ServicePartesContrato"; // certifique-se de já importar



import "@/styles/unified_styles.css";
import "@/styles/unified_refactored_styles.css";



export default function ParteAdversa() {
  const [partes, setPartes] = useState([]);
  const salvarButtonRef = useRef(null);
  const botaoAdicionarContratoRef = useRef(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  const [editando, setEditando] = useState(false);
  const [parteSelecionada, setParteSelecionada] = useState(null);
  const [formParte, setFormParte] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
  });
  const [filtroParteCompleta, setFiltroParteCompleta] = useState("incompleta");
  const nomeInputRef = useRef(null);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("semContrato");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [tituloSucesso, setTituloSucesso] = useState("");
  const [erroFormulario, setErroFormulario] = useState("");
  const [drawerEnderecoAberto, setDrawerEnderecoAberto] = useState(false);
  const [enderecos, setEnderecos] = useState([]);
  const [adicionandoEndereco, setAdicionandoEndereco] = useState(false);
  const [formEndereco, setFormEndereco] = useState({
    cep: "",
    uf: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
    complemento: "",
    principal: true,
  });
  const [indiceEditando, setIndiceEditando] = useState(null);
  const [modalContratosAberto, setModalContratosAberto] = useState(false);
  const [parteContratosSelecionada, setParteContratosSelecionada] = useState(null);

  // Modal Contratos – estado do formulário de criação/vínculo
  const [showContratoForm, setShowContratoForm] = useState(false);
  const [contratoForm, setContratoForm] = useState({
    numero: "",
    valor: "",
    lote: "",
    principal: true,   // checkbox
  });
  const [contratoErro, setContratoErro] = useState("");
  const [salvandoContrato, setSalvandoContrato] = useState(false);

  // Fluxo “contrato já existe?”
  const [confirmAttach, setConfirmAttach] = useState(false);
  const [existingContrato, setExistingContrato] = useState(null); // {id, numero, ...}
  const [selectedContrato, setSelectedContrato] = useState(null);


  useEffect(() => {
    carregarPartesAdversas();
  }, []);

  useEffect(() => {
    if (modalAberto) {
      requestAnimationFrame(() => {
        nomeInputRef.current?.focus();
      });
    }
  }, [modalAberto]);

  const carregarPartesAdversas = async () => {
    const dados = await fetchParteAdversa();
    setPartes(Array.isArray(dados) ? dados : []);
  };
  

  const limparFormulario = () => {
    setFormParte({
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
    });
    setFormEndereco({
      cep: "",
      uf: "",
      cidade: "",
      bairro: "",
      rua: "",
      numero: "",
      complemento: "",
    });
    setEnderecos([]);  
    setAdicionandoEndereco(false); 
    setErroFormulario("");
    setParteSelecionada(null);
    setEditando(false);
    setModoVisualizacao(false);
  };
  
  const abrirModalContratos = (parte) => {
  setParteContratosSelecionada(parte);
  setModalContratosAberto(true);
  // reset controles do sub-modal
  setShowContratoForm(false);
  setContratoForm({ numero: "", valor: "", lote: "", principal: true });
  setContratoErro("");
  setConfirmAttach(false);
  setExistingContrato(null);
};

const handleDeleteContrato = async (contratoId) => {
  try {
    await deleteParteContrato(contratoId); // chamada real à API

    setParteContratosSelecionada(prev => ({
      ...prev,
      contratos: prev.contratos.filter(c => c.id !== contratoId),
    }));

    setSelectedContrato(null); // fecha o modo detalhe
  } catch (err) {
    console.error("Erro ao deletar contrato:", err);
  }
};

  const handleSalvarParte = async () => {
    const { nome, cpf, email, telefone } = formParte;
  
    if (!nome.trim() || !cpf.trim()) {
      setErroFormulario("Preencha os campos obrigatórios: Nome e CPF.");
      return;
    }
  
    const payloadParte = {
      nome: nome.trim(),
      cpf: cpf.replace(/\D/g, ""),
      email: email.trim() !== "" ? email.trim() : null,
      telefone: telefone.trim() !== "" ? telefone.trim() : null,
      enderecos: [
        ...enderecos.map((e) => ({
          id: e.id || null,
          cep: e.cep.trim(),
          uf: e.uf.trim().toUpperCase(),
          cidade: e.cidade.trim(),
          bairro: e.bairro.trim(),
          rua: e.rua.trim(),
          numero: e.numero.trim(),
          complemento: e.complemento ? e.complemento.trim() : null,
          principal: e.principal !== undefined ? e.principal : true,
        })),
        ...(adicionandoEndereco && formEndereco.cep?.trim()
          ? [{
              id: formEndereco.id || null,
              cep: formEndereco.cep.trim(),
              uf: formEndereco.uf.trim().toUpperCase(),
              cidade: formEndereco.cidade.trim(),
              bairro: formEndereco.bairro.trim(),
              rua: formEndereco.rua.trim(),
              numero: formEndereco.numero.trim(),
              complemento: formEndereco.complemento?.trim() || null,
              principal: formEndereco.principal !== undefined ? formEndereco.principal : true,
            }]
          : [])
      ],

    };
  
  
    if (editando && parteSelecionada) {
      await updateParteAdversa(parteSelecionada.id, payloadParte);
      setTituloSucesso("Parte Adversa Atualizada");
      setMensagemSucesso("Parte adversa atualizada com sucesso!");
    } else {
      await createParteAdversa(payloadParte);
      setTituloSucesso("Parte Adversa Cadastrada");
      setMensagemSucesso("Parte adversa criada com sucesso!");
    }
  
    setModalAberto(false);
    limparFormulario();
    setTimeout(() => setMensagemSucesso(""), 2000);
    carregarPartesAdversas();
  };
  

  useEffect(() => {
    setConfirmAttach(false);
    setExistingContrato(null);
    setContratoErro("");
  }, [contratoForm.numero]);

  useEffect(() => {
    if (modalContratosAberto && !showContratoForm) {
      requestAnimationFrame(() => {
        botaoAdicionarContratoRef.current?.focus();
      });
    }
  }, [modalContratosAberto, showContratoForm]);
  


const abrirModalEditar = async (parte) => {
  setFormParte({
    nome: parte.nome,
    cpf: parte.cpf,
    email: parte.email,
    telefone: parte.telefone,
  });

  setEnderecos(parte.enderecos || []);

  setFormEndereco({
    cep: "",
    uf: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
    complemento: "",
  });

  setAdicionandoEndereco(false);
  setParteSelecionada(parte);
  setEditando(true);
  setModoVisualizacao(false);
  setModalAberto(true);

  setTimeout(() => {
    salvarButtonRef.current?.focus();
  }, 0);
};




const abrirModalDetalhar = (parte) => {
  abrirModalEditar(parte);
  setModoVisualizacao(true);
};



const partesFiltradas = partes.filter((p) => {
  const texto = `${p.nome} ${p.email} ${p.cpf}`.toLowerCase();
  const atendeTexto = texto.includes(filtroTexto.toLowerCase());

  let atendeStatus = true;
  if (filtroStatus === "comContrato") atendeStatus = p.contratos?.length > 0;
  if (filtroStatus === "semContrato") atendeStatus = !(p.contratos?.length > 0);

  const temEndereco = p.enderecos && p.enderecos.length > 0;

  let atendeCompleta = true;
  if (filtroParteCompleta === "completa") {
    atendeCompleta = p.nome && p.cpf && p.telefone && temEndereco;
  } else if (filtroParteCompleta === "incompleta") {
    atendeCompleta = !(p.nome && p.cpf && p.telefone && temEndereco);
  }

  return atendeTexto && atendeStatus && atendeCompleta;
});


  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Partes Adversas</h3>

      <div className="usuarios-header">
        <div className="usuarios-filtros">
          <div className="dashboard-filtro-group">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="dashboard-select"
            >
              <option value="semContrato">Sem Contrato</option>
              <option value="comContrato">Com Contrato</option>
              <option value="">Todos</option>
            </select>
            {filtroStatus && filtroStatus !== "semContrato" && (
              <button onClick={() => setFiltroStatus("semContrato")} className="dashboard-filtro-clear"><X size={14} /></button>
            )}
          </div>
          <div className="dashboard-filtro-group">
            <select
              value={filtroParteCompleta}
              onChange={(e) => setFiltroParteCompleta(e.target.value)}
              className="dashboard-select"
            >
              <option value="incompleta">Parte Incompleta</option>
              <option value="completa">Parte Completa</option>
              <option value="todos">Todos</option>              
            </select>
          </div>
          <div className="dashboard-filtro-group">
            <input
              type="text"
              placeholder="Nome, Email ou CPF"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="dashboard-select dashboard-filtro-usuario-input"
            />
            {filtroTexto && (
              <button onClick={() => setFiltroTexto("")} className="dashboard-filtro-clear"><X size={14} /></button>
            )}
          </div>
        </div>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogOverlay className="dialog-overlay" />
          <DialogTrigger asChild>
            <Button
              className="usuarios-btn-material"
              onClick={() => {
                limparFormulario();
                setModalAberto(true);

                setTimeout(() => {
                  salvarButtonRef.current?.focus();
                }, 0);
              }}
            >
              Nova Parte Adversa
            </Button>
          </DialogTrigger>

          <DialogContent
            className="dashboard-modal dashboard-no-close split-modal"
            onOpenAutoFocus={(e) => e.preventDefault()}
           >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!modoVisualizacao) handleSalvarParte();
              }}
              style={{ display: 'flex', width: '100%' }} 
            >          
              <div className="split-left">
              <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>
              <DialogTitle>{modoVisualizacao ? "Detalhes da Parte Adversa" : editando ? "Editar Parte Adversa" : "Nova Parte Adversa"}</DialogTitle>
              <DialogDescription className="parte-adversa-lista">{modoVisualizacao ? "Visualize os dados." : "Preencha as informações da parte adversa."}</DialogDescription>

              <div className={modoVisualizacao ? "non-editable-input-wrapper" : "editable-input-wrapper"}>
                <label htmlFor="input-nome" className="usuarios-label">Nome</label>
                <Input
                  id="input-nome"
                  ref={editando || modoVisualizacao ? null : nomeInputRef}
                  type="text"
                  value={formParte.nome}
                  onChange={(e) => setFormParte({ ...formParte, nome: e.target.value })}
                  className="usuarios-modal-input"
                  readOnly={modoVisualizacao}
                />
              </div>

              <div className={modoVisualizacao ? "non-editable-input-wrapper" : "editable-input-wrapper"}>
                <label htmlFor="cpf" className="usuarios-label">CPF</label>
                <Input
                  id="cpf"
                  type="text"
                  value={formParte.cpf}
                  onChange={(e) => setFormParte({ ...formParte, cpf: e.target.value })}
                  className="usuarios-modal-input"
                  readOnly={modoVisualizacao}
                />
              </div>

              <div className={modoVisualizacao ? "non-editable-input-wrapper" : "editable-input-wrapper"}>
                <label htmlFor="email" className="usuarios-label">Email</label>
                <Input
                  id="email"
                  type="text"
                  value={formParte.email}
                  onChange={(e) => setFormParte({ ...formParte, email: e.target.value })}
                  className="usuarios-modal-input"
                  readOnly={modoVisualizacao}
                />
              </div>

              <div className={modoVisualizacao ? "non-editable-input-wrapper" : "editable-input-wrapper"}>
                <label htmlFor="telefone" className="usuarios-label">Telefone</label>
                <Input
                  id="telefone"
                  type="text"
                  value={formParte.telefone}
                  onChange={(e) => setFormParte({ ...formParte, telefone: e.target.value })}
                  className="usuarios-modal-input"
                  readOnly={modoVisualizacao}
                />
              </div>

              

              {!modoVisualizacao && (
                <div className="botao-salvar-bottom">
                  <Button type="submit" ref={salvarButtonRef}>
                    Salvar
                  </Button>
                </div>
              )}

              {erroFormulario && <div className="dashboard-modal-error">{erroFormulario}</div>}
            </div> 
            <div className="split-right">
              {adicionandoEndereco ? (
                <>
                  <h5>{indiceEditando !== null ? "Editar Endereço" : "Adicionar Endereço"}</h5>
                  <div className="linha-endereco">
                    <div className="input-flex-1">
                      <label className="usuarios-label">CEP</label>
                      <Input 
                        className="endereco-modal-input flex-item"
                        value={formEndereco.cep} 
                        onChange={(e) => setFormEndereco({ ...formEndereco, cep: e.target.value })} />
                    </div>
                    <div className="input-flex-2">
                      <label className="usuarios-label">Cidade</label>
                      <Input 
                        className="endereco-modal-input flex-item"
                        value={formEndereco.cidade} 
                        onChange={(e) => setFormEndereco({ ...formEndereco, cidade: e.target.value })} />
                    </div>
                    <div className="input-uf">
                      <label className="usuarios-label">UF</label>
                      <Input 
                        className="endereco-modal-input uf"
                        value={formEndereco.uf} 
                        onChange={(e) => setFormEndereco({ ...formEndereco, uf: e.target.value })} />
                    </div>
                  </div>

                  <div className="endereco-input-wrapper">
                    <label className="usuarios-label">Bairro</label>
                    <Input 
                      className="endereco-modal-input"
                      value={formEndereco.bairro} 
                      onChange={(e) => setFormEndereco({ ...formEndereco, bairro: e.target.value })} />
                  </div>

                  <div className="linha-endereco">
                    <div className="input-flex-3">
                      <label className="usuarios-label">Rua</label>
                      <Input 
                        className="endereco-modal-input"
                        value={formEndereco.rua} 
                        onChange={(e) => setFormEndereco({ ...formEndereco, rua: e.target.value })} />
                    </div>
                    <div className="input-flex-1">
                      <label className="usuarios-label">Número</label>
                      <Input 
                        className="endereco-modal-input"
                        value={formEndereco.numero} 
                        onChange={(e) => setFormEndereco({ ...formEndereco, numero: e.target.value })} />
                    </div>
                  </div>

                  <div className="endereco-input-wrapper">
                    <label className="usuarios-label">Complemento</label>
                    <Input 
                      className="endereco-modal-input"
                      value={formEndereco.complemento} 
                      onChange={(e) => setFormEndereco({ ...formEndereco, complemento: e.target.value })} />
                  </div>

                  <div className="endereco-input-wrapper">
                    <label htmlFor="principal-checkbox" className="usuarios-label">
                      <input
                        id="principal-checkbox"
                        type="checkbox"
                        checked={formEndereco.principal}
                        onChange={(e) =>
                          setFormEndereco({ ...formEndereco, principal: e.target.checked })
                        }
                        style={{ marginRight: '0.5rem' }}
                      />
                      Este é o endereço principal
                    </label>
                  </div>
                  <div className="endereco-modal-actions">
                    <Button
                      type="button" 
                      variant="outline"
                      onClick={() => setAdicionandoEndereco(false)}
                    >
                      Cancelar
                    </Button>

                    {indiceEditando !== null && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          const novos = [...enderecos];
                          novos.splice(indiceEditando, 1);
                          setEnderecos(novos);
                          setIndiceEditando(null);
                          setAdicionandoEndereco(false);
                        }}
                      >
                        Deletar
                      </Button>
                    )}

                    <Button
                      type="button"
                      onClick={() => {
                        let novosEnderecos = [...enderecos];

                        // Se o novo endereço é principal, desmarca os outros
                        if (formEndereco.principal) {
                          novosEnderecos = novosEnderecos.map((endereco, i) => ({
                            ...endereco,
                            principal: false,
                          }));
                        }

                        if (indiceEditando !== null) {
                          novosEnderecos[indiceEditando] = formEndereco;
                        } else {
                          novosEnderecos.push(formEndereco);
                        }

                        setEnderecos(novosEnderecos);
                        setFormEndereco({
                          cep: "",
                          uf: "",
                          cidade: "",
                          bairro: "",
                          rua: "",
                          numero: "",
                          complemento: "",
                          principal: true,
                        });
                        setAdicionandoEndereco(false);
                        setIndiceEditando(null);
                      }}
                      >
                      {indiceEditando !== null ? "Atualizar" : "Adicionar"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                <div className="enderecos-lista">
                  <h4>Endereços Adicionados:</h4>
                  <div>
                    <ul className="enderecos-lista">
                    {enderecos.map((end, index) => (
                        <li
                          key={index}
                          className={`endereco-item ${end.principal ? "principal" : ""}`}
                          onClick={() => {
                            setFormEndereco(end);
                            setIndiceEditando(index);
                            setAdicionandoEndereco(true);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="endereco-texto">
                            <div className="endereco-linha">
                              <span className="endereco-lbl">Logradouro</span>
                              <span className="endereco-val">
                                {end.rua} - {end.numero}
                                {end.complemento ? ` - ${end.complemento}` : ""}
                              </span>
                            </div>

                            <div className="endereco-linha">
                              <span className="endereco-lbl">Cidade</span>
                              <span className="endereco-val">
                                {end.bairro} - {end.cidade} - {end.uf}
                              </span>
                            </div>

                            <div className="endereco-linha">
                              <span className="endereco-lbl">CEP</span>
                              <span className="endereco-val">{end.cep}</span>
                            </div>
                          </div>

                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    {!modoVisualizacao && !adicionandoEndereco && (
                      <div className="botao-endereco-bottom">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setFormEndereco({
                              cep: "",
                              uf: "",
                              cidade: "",
                              bairro: "",
                              rua: "",
                              numero: "",
                              complemento: "",
                              principal: true,
                            });
                            setIndiceEditando(null); 
                            setAdicionandoEndereco(true); 
                          }}
                          >
                          + Endereço
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                </>
              )}
            </div>

            
              </form>
          </DialogContent>
          
        </Dialog>
      </div>

      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela">
          <thead>
            <tr>
              <th className="parte-col-nome">Nome</th>
              <th className="parte-col-cpf">CPF</th>
              <th className="parte-col-email">Email</th>
              <th className="parte-col-telefone">Telefone</th>
              <th className="col-acoes-three-buttons">Ações</th>
            </tr>
          </thead>
          <tbody>
            {partesFiltradas.map((p) => (
              <tr key={p.id}>
                <td className="parte-col-nome">{p.nome}</td>
                <td className="parte-col-cpf">{p.cpf}</td>
                <td className="parte-col-email">{p.email}</td>
                <td className="parte-col-telefone">{p.telefone}</td>
                <td className="col-acoes-three-buttons">
                  <div className="tabela-acoes-wrapper">
                    <Button
                      variant="secondary"
                      className="tabela-acao-botao"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        abrirModalEditar(p);
                      }}
                    >
                      <Pencil size={16} className="mr-1" />Editar
                    </Button>

                    <Button
                      variant="outline"
                      className="tabela-acao-botao"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        abrirModalDetalhar(p);
                      }}
                    >
                      <Eye size={16} className="mr-1" />Detalhar
                    </Button>

                    <Button
                      variant="default"
                      className="tabela-acao-botao"
                      onClick={() => abrirModalContratos(p)}
                    >
                      <FileEdit size={16} className="mr-1" />Contratos
                    </Button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <Dialog open={modalContratosAberto} onOpenChange={setModalContratosAberto}>
  <DialogOverlay className="dialog-overlay" />
  <DialogContent 
    className="parte-adversa-contratos-modal dashboard-no-close"
    onOpenAutoFocus={(e) => e.preventDefault()}
  >
    <DialogTitle className="dialog-description-hidden" />
    <DialogDescription className="dialog-description-hidden" />

    <div className="parte-adversa-contratos-modal-inner">
      <div className="parte-adversa-contratos-titulo">
        <h2 className="modal-heading">Contratos da Parte</h2>
        <h3 className="parte-adversa-contratos-nome">{parteContratosSelecionada?.nome}</h3>
      </div>

      {showContratoForm ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setContratoErro("");

            if (!contratoForm.numero.trim()) {
              setContratoErro("Informe o número do contrato.");
              return;
            }

            try {
              setSalvandoContrato(true);
              let createdContrato = null;

              if (confirmAttach && existingContrato?.id) {
                await createParteContrato({
                  contrato_id: existingContrato.id,
                  parte_adversa_id: parteContratosSelecionada.id,
                  principal: !!contratoForm.principal,
                  lote: contratoForm.lote || null,
                });
              } else {
                const found = await findContratoByNumero(contratoForm.numero.trim());

                if (found && found.id) {
                  setExistingContrato(found);
                  setConfirmAttach(true);
                  setContratoErro(
                    "Este número de contrato já está cadastrado. Deseja vincular esta parte ao contrato existente?"
                  );
                  return;
                }

                const resp = await createContratoComParte({
                  numero: contratoForm.numero.trim(),
                  valor: contratoForm.valor ? Number(contratoForm.valor) : null,
                  lote: contratoForm.lote || null,
                  parte_adversa_id: parteContratosSelecionada.id,
                  principal: !!contratoForm.principal,
                });

                createdContrato = resp?.contrato ?? null;
              }

              setShowContratoForm(false);
              setConfirmAttach(false);
              setExistingContrato(null);

              const novoContrato = existingContrato?.id
                ? existingContrato
                : (createdContrato ?? {
                    id: crypto.randomUUID(),
                    numero: contratoForm.numero.trim(),
                    lote: contratoForm.lote || null,
                  });

              setParteContratosSelecionada((prev) => ({
                ...prev,
                contratos: [...(prev?.contratos || []), novoContrato],
              }));

              setContratoForm({ numero: "", valor: "", lote: "", principal: true });
            } catch (err) {
              setContratoErro(err?.message || "Falha ao salvar.");
            } finally {
              setSalvandoContrato(false);
            }
          }}
        >
          <div className="editable-input-wrapper">
            <label className="usuarios-label">Número</label>
            <Input
              className="usuarios-modal-input"
              value={contratoForm.numero}
              onChange={(e) => setContratoForm({ ...contratoForm, numero: e.target.value })}
              readOnly={confirmAttach}
            />
          </div>

          {!confirmAttach && (
            <>
              <div className="editable-input-wrapper">
                <label className="usuarios-label">Valor</label>
                <Input
                  type="number"
                  step="0.01"
                  className="usuarios-modal-input"
                  value={contratoForm.valor}
                  onChange={(e) => setContratoForm({ ...contratoForm, valor: e.target.value })}
                />
              </div>

              <div className="editable-input-wrapper">
                <label className="usuarios-label">Lote</label>
                <Input
                  className="usuarios-modal-input"
                  value={contratoForm.lote}
                  onChange={(e) => setContratoForm({ ...contratoForm, lote: e.target.value })}
                />
              </div>
            </>
          )}

          <div>
            <label>
              <input
                type="checkbox"
                checked={contratoForm.principal}
                onChange={(e) => setContratoForm({ ...contratoForm, principal: e.target.checked })}
              />
              Parte principal
            </label>
          </div>

          {contratoErro && (
            <div className="dashboard-modal-error">{contratoErro}</div>
          )}

          <div className="parte-adversa-contratos-modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowContratoForm(false);
                setConfirmAttach(false);
                setExistingContrato(null);
                setContratoErro("");
                setContratoForm({ numero: "", valor: "", lote: "", principal: true });
              }}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={salvandoContrato}>
              {confirmAttach ? "Confirmar" : "Salvar"}
            </Button>
          </div>
        </form>
      ) : selectedContrato ? (
        <>
          <div className="parte-adversa-contratos-lista" style={{ marginBottom: "1.5rem" }}>
            <div><strong>Número:</strong> {selectedContrato.numero}</div>
            <div><strong>Valor:</strong> {selectedContrato.valor ? `R$ ${selectedContrato.valor}` : "-"}</div>
            <div><strong>Lote:</strong> {selectedContrato.lote ?? "-"}</div>
            <div><strong>Parte principal:</strong> {selectedContrato.principal ? "Sim" : "Não"}</div>
          </div>

          <div className="parte-adversa-contratos-modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedContrato(null)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={() => handleDeleteContrato(selectedContrato.id)}
            >
              Deletar
            </Button>
          </div>
        </>
      ) : (
        <>
          {parteContratosSelecionada?.contratos?.length > 0 ? (
            <ul className="parte-adversa-contratos-lista">
              {parteContratosSelecionada.contratos.map((c) => (
                <li
                  key={c.id}
                  style={{ cursor: 'pointer', padding: '0.5rem 0' }}
                  onClick={() => setSelectedContrato(c)}
                >
                  <div><strong>{c.numero}</strong></div>
                  <div>Lote: {c.lote ?? "-"}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ marginTop: '0', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Nenhum contrato vinculado a esta parte.
            </p>
          )}

          <div className="parte-adversa-contratos-modal-actions">
            <Button
              type="button"
              ref={botaoAdicionarContratoRef}
              onClick={() => {
                setShowContratoForm(true);
                setContratoErro("");
                setConfirmAttach(false);
                setExistingContrato(null);
              }}
            >
              Adicionar
            </Button>
          </div>
        </>
      )}
    </div>
  </DialogContent>
</Dialog>


    </div>
  );
}
