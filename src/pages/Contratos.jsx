// src/pages/Contratos.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Plus, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogOverlay,
} from "@/components/ui/dialog";

import { fetchContratos, createContrato, updateContrato } from "@/services/ENDPOINTS_ServiceContratos";
import { fetchParteAdversaByCPF } from "@/services/ENDPOINTS_ServiceParteAdversa"; // GET /parte-adversa?termo=...

import { fetchColaboradores } from "@/services/ENDPOINTS_ServiceColaboradores";

import { fetchAtribuicoesContratos } from "@/services/ENDPOINTS_ServiceAtribuicoes";
import { createAtribuicaoEvento, updateAtribuicaoEvento } from "@/services/ENDPOINTS_ServiceAtribuicaoEvento";


import { createParteContrato } from "@/services/ENDPOINTS_ServicePartesContrato";
import { fetchContratoById } from "@/services/ENDPOINTS_ServiceContratos";

import "@/styles/unified_styles.css";
import "@/styles/unified_refactored_styles.css";






// normaliza texto: remove acentos e deixa minúsculo
const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

    function getCurrentEvento(contrato) {
      const eventos = contrato?.atribuicoes_evento || [];
      if (!eventos.length) return null;
    
      const ordenados = [...eventos].sort((a, b) => {
        const da = a?.data_inicial ?? "";
        const db = b?.data_inicial ?? "";
        if (da && db && da !== db) return da > db ? -1 : 1;
        return (b?.id ?? 0) - (a?.id ?? 0); // mais recente no topo
      });
    
      return ordenados[0]; // retorna o evento mais atual
    }
    

    export default function Contratos() {
      const [lista, setLista] = useState([]);
      const [loading, setLoading] = useState(false);
    
      // filtros
      const [fStatus, setFStatus] = useState("");
      const [fLote, setFLote] = useState("");
    
      // modal
      const [modalAberto, setModalAberto] = useState(false);
      const [editando, setEditando] = useState(false);
      const salvarRef = useRef(null);
    
      // form contrato (lado esquerdo do modal)
      const [form, setForm] = useState({
        numero: "",
        valor: "",
        lote: "",
        observacao: "",
        atribId: "",
      });
    
      // lado direito do modal (partes vinculadas)
      const [partesVinculadas, setPartesVinculadas] = useState([]);

    
      // >>> estados do + Parte (PRECISAM estar aqui dentro) <<<
      const [showFormParte, setShowFormParte] = useState(false);
      const [fetchParte, setSearchParte] = useState("");
      const [foundParte, setFoundParte] = useState(null);
      const [fetchingParte, setSearchingParte] = useState(false);
      const [parteAviso, setParteAviso] = useState("");
      const [parteParaRemover, setParteParaRemover] = useState(null);
      const [visualizando, setVisualizando] = useState(false);
      const [parteFoiBuscada, setParteFoiBuscada] = useState(false);

      // identifica o contrato aberto no modal
      const [contratoSelecionado, setContratoSelecionado] = useState(null);

      const isParteValida = (parte) =>
        parte && typeof parte === "object" && !!parte.id && !!parte.cpf;

      // histórico de atribuições (modo Detalhar)
      const [mostrarHistorico, setMostrarHistorico] = useState(false);
      const [historicoAtribs, setHistoricoAtribs] = useState([]);
      const [loadingHistorico, setLoadingHistorico] = useState(false);
      const [rightMode, setRightMode] = useState("atribuicoes");
      const [atrSelecionada, setAtrSelecionada] = useState(null);
      const [formAtrib, setFormAtrib] = useState({
        solucionador_id: "",
        proxima_atr_id: "",
        proximo_resp_id: "",
        observacao: "",
        proximo_prazo: "",
        prazo: ""
      });
      
      useEffect(() => {
        if (rightMode === "visualizarAtrib" && atrSelecionada) {
          setFormAtrib({
            solucionador_id: atrSelecionada?.responsavel?.id || "",
            proxima_atr_id: "",
            proximo_resp_id: "",
            observacao: atrSelecionada?.observacao || "",
            proximo_prazo: "",
            prazo: atrSelecionada?.prazo?.split("T")[0] || ""
          });
        }
      }, [rightMode, atrSelecionada]);
      const [colabs, setColabs] = useState([]);


  // ✅ Atribuições / status vindos da API
const [atribs, setAtribs] = useState([]);

/*
// Mapa dinâmico: descrição longa -> rótulo curto
const statusOrder = useMemo(() => {
  return (atribs || []).map(a => a.descricao);
}, [atribs]);
*/

// Helpers que dependem do status curto
const getStatus = (c) =>
  c.atribuicao_evento_atual?.atribuicao_id?.texto || "";



const getResponsavel = (c) =>
  c.atribuicao_evento_atual?.responsavel_id?.nome || "-";


useEffect(() => {
  if (modalAberto && !visualizando) {
    requestAnimationFrame(() => {
      salvarRef.current?.focus();
    });
  }
}, [modalAberto, visualizando]);



useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      // carrega atribuições + contratos em paralelo
      const [atribsRes, contratosRes, colabsRes] = await Promise.all([
        fetchAtribuicoesContratos(),
        fetchContratos(),
        fetchColaboradores(), // carrega os colaboradores
      ]);
      
      setColabs(Array.isArray(colabsRes) ? colabsRes : []);

      const atribsArr = Array.isArray(atribsRes) ? atribsRes : [];
      setAtribs(atribsArr);

      // mapa descrição -> ordem (para ordenar contratos por status)
      const ordem = new Map(atribsArr.map((a, i) => [a.descricao, i]));

      // "decora" contratos com campos derivados para evitar recomputar sempre
      const decorados = (Array.isArray(contratosRes) ? contratosRes : []).map((c) => {
        const status = getStatus(c);
        const resp = getResponsavel(c);

      
        const valorBRL =
          typeof c.valor === "number"
            ? c.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            : "-";

        return {
          ...c,
          _status: status,
          _responsavel: resp,
          _valorBRL: valorBRL,
          _ordemStatus: ordem.has(status) ? ordem.get(status) : 99,
        };
      });

      // ordena uma vez só
      decorados.sort((a, b) => a._ordemStatus - b._ordemStatus);

      setLista(decorados);
    } finally {
      setLoading(false);
    }
  })();
}, []);



/*
  // 1) Carrega as atribuições (status) uma única vez
useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const s = await fetchAtribuicoesAcordo();
      setAtribs(Array.isArray(s) ? s : []);
    } finally {
      setLoading(false);
    }
  })();
}, []);

// 2) Depois que as atribuições estiverem carregadas, carrega contratos e ordena
useEffect(() => {
  if (!atribs?.length) return;

  (async () => {
    setLoading(true);
    try {
      const data = await fetchContratos();

      const sorted = [...data].sort((a, b) => {
        const sa = getStatus(a);
        const sb = getStatus(b);
        const ia = statusOrder.indexOf(sa);
        const ib = statusOrder.indexOf(sb);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });

      setLista(sorted);
    } finally {
      setLoading(false);
    }
  })();
}, [statusOrder]);

  

const filtrados = useMemo(() => {
  const termo = norm(fLote);

  return lista.filter((c) => {
    // status exato
    const okStatus = fStatus ? getStatus(c) === fStatus : true;

    // busca livre (lote, nº contrato, responsável, status)
    const alvoLote    = norm(String(c.lote ?? ""));
    const alvoNumero  = norm(String(c.numero ?? ""));
    const alvoResp    = norm(getResponsavel(c));
    const alvoStatus  = norm(getStatus(c));

    const okTexto = termo
      ? (alvoLote.includes(termo) || alvoNumero.includes(termo) || alvoResp.includes(termo) || alvoStatus.includes(termo))
      : true;

    return okStatus && okTexto;
  });
}, [lista, fStatus, fLote]);
*/

const filtrados = useMemo(() => {
  const termo = norm(fLote);

  return lista.filter((c) => {
    // status exato usando o campo decorado
    const okStatus = fStatus ? c._status === fStatus : true;

    // busca livre usando campos já normalizados
    const alvoLote   = norm(String(c.lote ?? ""));
    const alvoNumero = norm(String(c.numero ?? ""));
    const alvoResp   = norm(c._responsavel);
    const alvoStatus = norm(c._status);

    const okTexto = termo
      ? (alvoLote.includes(termo) || alvoNumero.includes(termo) || alvoResp.includes(termo) || alvoStatus.includes(termo))
      : true;

    return okStatus && okTexto;
  });
}, [lista, fStatus, fLote]);



  const abrirNovo = () => {
  setShowFormParte(false);
  setSearchParte("");
  setFoundParte(null);
  setParteAviso("");
  setVisualizando(false);
  setEditando(false);

  setForm({ numero: "", valor: "", lote: "", observacao: "", atribId: "" });
  setPartesVinculadas([]);
  setContratoSelecionado(null);
  setAtrSelecionada(null);
  setFormAtrib({
    solucionador_id: "",
    proxima_atr_id: "",
    proximo_resp_id: "",
    observacao: "",
    proximo_prazo: ""
  });
  setHistoricoAtribs([]);
  setMostrarHistorico(false);

  setRightMode("partes"); // <<< aqui a mudança
  setModalAberto(true);
  setTimeout(() => salvarRef.current?.focus(), 0);
};


const abrirDetalhar = async (c) => {
  setVisualizando(true);
  setEditando(false);
  setShowFormParte(false);
  setSearchParte("");
  setFoundParte(null);
  setParteParaRemover(null);
  setParteAviso("");
  setRightMode("atribuicoes");
  setMostrarHistorico(false);
  setHistoricoAtribs([]);

  try {
    const atualizado = await fetchContratoById(c.id); // faz GET /contratos/:id

    setContratoSelecionado(atualizado);

    setForm({
      numero: atualizado.numero || "",
      valor: atualizado.valor ?? "",
      lote: atualizado.lote ?? "",
      observacao: atualizado.observacao ?? "",
      atribId: "", // ou null, se preferir
    });

    setPartesVinculadas(atualizado.partes_adversas || []);

    // carrega histórico imediatamente
    const eventos = Array.isArray(atualizado.atribuicoes_evento) ? atualizado.atribuicoes_evento : [];
    const ordenados = [...eventos].sort((a, b) => {
      const da = a?.data_inicial ?? "";
      const db = b?.data_inicial ?? "";
      if (da && db && da !== db) return da < db ? -1 : 1;
      return (a?.id ?? 0) - (b?.id ?? 0);
    });

    setHistoricoAtribs(ordenados);
    setMostrarHistorico(true);

  } catch (err) {
    console.error("Erro ao carregar contrato:", err);
  }

  setModalAberto(true);
  requestAnimationFrame(() => document.activeElement.blur());
};

  
  
  

  
  const abrirEditar = async (c) => {
    setEditando(true);
    setShowFormParte(false);
    setSearchParte("");
    setFoundParte(null);
    setParteParaRemover(null);
    setParteAviso("");
    setRightMode("atribuicoes");
  
    try {
      const atualizado = await fetchContratoById(c.id); // faz GET /contratos/:id

      setContratoSelecionado(atualizado);
  
      setForm({
        numero: atualizado.numero || "",
        valor: atualizado.valor ?? "",
        lote: atualizado.lote ?? "",
        observacao: atualizado.observacao ?? "",
        atribId: getCurrentEvento(atualizado)?.atribuicao_id ?? "",
      });
  
      setPartesVinculadas(atualizado.partes_adversas || []);
    } catch (err) {
      console.error("Erro ao carregar contrato:", err);
    }
  
    setModalAberto(true);
    setTimeout(() => salvarRef.current?.focus(), 0);
  };
  


  const carregarHistoricoAtribuicoes = async () => {
    if (!contratoSelecionado) return;
    setLoadingHistorico(true);
    try {
      // Usamos os eventos já presentes no contrato (atribuicoes_evento),
      // que você já utiliza para calcular o status atual.
      const eventos = Array.isArray(contratoSelecionado.atribuicoes_evento)
        ? contratoSelecionado.atribuicoes_evento
        : [];
  
      // ordena de forma crescente pela data e, em empate, pelo id
      const ordenados = [...eventos].sort((a, b) => {
        const da = a?.data_inicial ?? "";
        const db = b?.data_inicial ?? "";
        if (da && db && da !== db) return da < db ? -1 : 1; // crescente
        return (a?.id ?? 0) - (b?.id ?? 0);
      });
  
      setHistoricoAtribs(ordenados);
      setMostrarHistorico(true);
    } finally {
      setLoadingHistorico(false);
    }
  };
  


  const handleBuscarParte = async () => {
    const termo = fetchParte; // o que o usuário digitou
    const cpfDigits = (termo || "").replace(/\D/g, ""); // limpa caracteres não numéricos
  
    setParteAviso("");
    setSearchingParte(true);
  
    try {
      // 🔁 Chamada ao endpoint específico
      const response = await fetchParteAdversaByCPF(cpfDigits);
      const match = response || null;

  
      setFoundParte(match);
  
      if (!match || !match.id) {
        setParteAviso("CPF não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar parte por CPF:", error);
      setParteAviso("Erro na busca.");
    } finally {
      setSearchingParte(false);
      setParteFoiBuscada(true);
    }
  };
  
  

  const handleRemoverParte = (parte) => {
    // remove por id ou, se não tiver id, por CPF normalizado
    const onlyDigits = (s) => (s || "").replace(/\D/g, "");
    setPartesVinculadas((prev) =>
      prev.filter((p) => {
        const sameId = p.id && parte.id && p.id === parte.id;
        const sameCpf =
          onlyDigits(p.cpf) &&
          onlyDigits(parte.cpf) &&
          onlyDigits(p.cpf) === onlyDigits(parte.cpf);
        return !(sameId || sameCpf);
      })
    );
    // opcional: mostrar um aviso no próprio modal
    setParteAviso("Parte removida.");
  };
  
  

const handleAdicionarParte = async () => {
  if (!foundParte || !contratoSelecionado?.id) return;

  const onlyDigits = (s) => String(s ?? "").replace(/\D/g, "");
  const alvoCPF = onlyDigits(foundParte.cpf);

  const jaExiste = partesVinculadas.some((p) => {
    const cpfExistente = onlyDigits(p.cpf);
    if (alvoCPF && cpfExistente) return cpfExistente === alvoCPF;
    if (!alvoCPF && !cpfExistente && p.id && foundParte.id) return p.id === foundParte.id;
    return false;
  });

  if (jaExiste) {
    setParteAviso("Essa parte já está vinculada a este contrato.");
    return;
  }

  try {
    // 🔹 1. Enviar parte ao backend
    await createParteContrato({
      contrato_id: contratoSelecionado.id,
      parte_id: foundParte.id,
      principal: foundParte?.principal || false,
    });

    // 🔹 2. Recarregar contrato atualizado com as partes
    const atualizado = await fetchContratoById(contratoSelecionado.id);
    setContratoSelecionado(atualizado);
    setPartesVinculadas(atualizado.partes_adversas || []);

    // 🔹 3. Resetar e voltar para o painel de lista
    setShowFormParte(false);
    setSearchParte("");
    setFoundParte(null);
    setParteParaRemover(null);
    setParteAviso("");
    setParteFoiBuscada(false);

  } catch (error) {
    console.error("Erro ao adicionar parte:", error);
    setParteAviso("Erro ao adicionar parte. Tente novamente.");
  }
};

const handleNovaAtribuicao = async () => {
  if (
    !contratoSelecionado?.id ||
    !formAtrib.proxima_atr_id ||
    !formAtrib.proximo_resp_id
  ) {
    setParteAviso("Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    const payload = {
      atribuicao_id: formAtrib.proxima_atr_id,
      entity_type: "contrato",
      entity_id: contratoSelecionado.id,
      responsavel_id: formAtrib.proximo_resp_id,
      solucionador_id: formAtrib.solucionador_id,
      prazo: formAtrib.proximo_prazo || null,
    };

    await createAtribuicaoEvento(payload);

    const atualizado = await fetchContratoById(contratoSelecionado.id);
    setContratoSelecionado(atualizado);
    setPartesVinculadas(atualizado.partes_adversas || []);

    const eventos = Array.isArray(atualizado.atribuicoes_evento)
      ? atualizado.atribuicoes_evento
      : [];
    const ordenados = [...eventos].sort((a, b) => {
      const da = a?.data_inicial ?? "";
      const db = b?.data_inicial ?? "";
      if (da && db && da !== db) return da < db ? -1 : 1;
      return (a?.id ?? 0) - (b?.id ?? 0);
    });

    setHistoricoAtribs(ordenados);
    setMostrarHistorico(true);

    setRightMode("atribuicoes");
    setFormAtrib({
      solucionador_id: "",
      proxima_atr_id: "",
      proximo_resp_id: "",
      observacao: "",
      proximo_prazo: "",
    });
  } catch (error) {
    console.error("Erro ao criar nova atribuição:", error);
    setParteAviso("Erro ao salvar nova atribuição.");
  }
};

const handleAtualizarAtribuicao = async () => {
  if (!atrSelecionada?.id) return;

  try {
    const payload = {
      prazo: formAtrib.prazo || null,
      responsavel_id: formAtrib.solucionador_id || null, // Aqui é o campo que aparece como "Responsável" no print
      observacao: formAtrib.observacao?.trim() || "",
    };

    await updateAtribuicaoEvento(atrSelecionada.id, payload);

    const atualizado = await fetchContratoById(contratoSelecionado.id);
    setContratoSelecionado(atualizado);
    setHistoricoAtribs(atualizado.atribuicoes_evento || []);
    setRightMode("atribuicoes");
    setAtrSelecionada(null);
  } catch (error) {
    console.error("Erro ao atualizar atribuição:", error);
    setParteAviso("Erro ao atualizar atribuição.");
  }
};





  
  async function carregarContrato(id) {
    try {
      const dados = await fetchContratoById(id);
      setContratoSelecionado(dados);       // Atualiza o estado com os dados recebidos
      setAtribuicoes(dados.atribuicoes_evento || []);
      setPartes(dados.partes_adversas || []);
    } catch (error) {
      console.error("Erro ao buscar contrato:", error);
    }
  }


  const salvar = async () => {
    // TODO: montar payload final
    const payload = {
      numero: String(form.numero).trim(),
      valor: form.valor ? Number(form.valor) : null,
      lote: form.lote ? String(form.lote).trim() : null,
      observacao: form.observacao?.trim() || "",
      atrib_id: form.atribId || null,
      // partes_contrato viriam aqui quando formarmos o payload final
    };
    if (editando) {
      // você decide de onde vem o id (pode guardar o contrato selecionado num state)
      // await updateContrato(contratoSelecionado.id, payload);
    } else {
      // await createContrato(payload);
    }
    setModalAberto(false);
  };

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Contratos</h3>

      {/* Filtros */}
      <div className="usuarios-header">
        <div className="usuarios-filtros">
          <div className="dashboard-filtro-group">
            <select
              className="dashboard-select"
              value={fStatus}
              onChange={(e) => setFStatus(e.target.value)}
              title="Filtrar por status"
            >
              <option value="">Todos os Status</option>
              {(atribs || []).map((a) => (
                <option key={a.id} value={a.descricao}>
                  {a.descricao}
                </option>
              ))}

            </select>
          </div>

          <div className="dashboard-filtro-group">
            <Input
              className="dashboard-select dashboard-filtro-usuario-input"
              placeholder="Lote, Contrato ou Resp"
              value={fLote}
              onChange={(e) => setFLote(e.target.value)}
            />
          </div>
        </div>

        <Dialog open={modalAberto} onOpenChange={(open) => {
            setModalAberto(open);
            if (!open) {
              setVisualizando(false);
              setRightMode("atribuicoes");
            }
          }}>
          <DialogOverlay className="dialog-overlay" />
          <DialogTrigger asChild>
            <Button
              className="usuarios-btn-material"
              onClick={(e) => {
                e.currentTarget.blur();
                abrirNovo();
              }}
            >
              <Plus size={16} /> Novo Contrato
            </Button>
          </DialogTrigger>

          <DialogContent
              className="contratos-modal contratos-modal-no-close contratos-split-modal"
              onOpenAutoFocus={(e) => {
                if (visualizando) {
                  e.preventDefault();               // impede o foco automático do Radix
                  requestAnimationFrame(() => {
                    document.activeElement?.blur(); // garante que nada fique focado
                  });
                }
              }}
          >
            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

            <div className="contratos-split-modal-left">
              <DialogTitle>
                {visualizando ? "Detalhar Contrato" : editando ? "Editar Contrato" : "Novo Contrato"}
              </DialogTitle>
              <DialogDescription className="contratos-modal-descricao">
                Preencha os dados do contrato.
              </DialogDescription>

              <div className="contratos-input-wrapper">
                <label className="contratos-input-label">Número</label>
                <Input
                  className="contratos-modal-input"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  readOnly={visualizando}
                />
              </div>

              <div className="contratos-input-wrapper">
                <label className="contratos-input-label">Valor</label>
                <Input
                  className="contratos-modal-input"
                  type="number"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  readOnly={visualizando}
                />
              </div>

              <div className="contratos-input-wrapper">
                <label className="contratos-input-label">Lote</label>
                <Input
                  className="contratos-modal-input"
                  value={form.lote}
                  onChange={(e) => setForm({ ...form, lote: e.target.value })}
                  readOnly={visualizando}
                />
              </div>

              <div className="contratos-input-wrapper">
                <label className="contratos-input-label">Observação</label>
                <Input
                  className="contratos-modal-input"
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  readOnly={visualizando}
                />
              </div>

             

              {!visualizando && (
              <div className="botao-salvar-bottom">
                <Button ref={salvarRef} onClick={salvar}>Salvar</Button>
              </div>
              )}
            </div>

              <div className="contratos-split-modal-right">
                {/* Cabeçalho com título dinâmico + botão de alternância (somente no Detalhar) */}
                  {(editando || visualizando) && contratoSelecionado?.id ? (

                    // Modo edição/detalhar → mostra cabeçalho com botão de troca
                    <div className="flex items-center justify-between">
                      <h5>
                        {rightMode === "novaAtrib"
                          ? "Nova Atribuição"
                          : rightMode === "historico" || rightMode === "atribuicoes" || rightMode === "visualizarAtrib"
                          ? "Atribuições do Contrato"
                          : "Partes Vinculadas"}
                      </h5>


                      {rightMode === "partes" && !showFormParte && (
                        <div className="botao-adicionar-contrato flex justify-end gap-2">
                          {!visualizando && (
                            <Button
                              onClick={() => {
                                setShowFormParte(true);
                                setParteFoiBuscada(false);
                              }}
                            >
                              + Parte
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            onClick={async () => {
                              if (!mostrarHistorico) {
                                await carregarHistoricoAtribuicoes();
                              }
                              setRightMode("atribuicoes");
                            }}
                          >
                            Atribuições
                          </Button>
                        </div>
                      )}

                    </div>


                    ) : (
                      // Modo criação → apenas título fixo
                      <div className="flex items-center justify-between">
                        <h5>Partes Vinculadas</h5>
                      </div>
                  )}


              {/* Conteúdo do painel direito */}
              {rightMode === "historico" ? (
                // ======= MODO HISTÓRICO =======
                <ul className="processo-modal-right-lista" style={{ marginTop: "0.75rem" }}>
                  {loadingHistorico && <li>Carregando histórico…</li>}
                  {!loadingHistorico && historicoAtribs.length === 0 && (
                    <li>Nenhuma atribuição encontrada.</li>
                  )}
                  {!loadingHistorico &&
                    historicoAtribs.map((evt, idx, arr) => {
                      const ultima = idx === arr.length - 1;
                      const dt = evt?.data_inicial ? new Date(evt.data_inicial) : null;
                      const dataStr = dt ? dt.toLocaleDateString("pt-BR") : "—";
                      const desc = evt?.atribuicao_descricao || "—";
                      const resp = evt?.responsavel?.nome || "—";
                      return (
                        <li
                          key={evt.id ?? `${evt.data_inicial}-${desc}`}
                          className={`processo-modal-right-item processo-atr-item ${ultima ? "atual" : ""}`}
                        >
                          <div className="processo-modal-right-texto">
                            <div className="atr-desc">{desc}</div>
                            <div className="atr-lista">
                              <div className="atr-linha">
                                <span className="atr-label">Definida em</span>
                                <span className="atr-valor">{dataStr}</span>
                              </div>
                              <div className="atr-linha">
                                <span className="atr-label">Responsável</span>
                                <span className="atr-valor">{resp}</span>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>

              ) : rightMode === "atribuicoes" ? (
                // Painel de Atribuições do Contrato
              
                <>
                  {(editando || visualizando) && contratoSelecionado?.id && (
                    <div className="botao-contrato-painel-adicionar-parte">
                      {!visualizando && (
                        <Button
                          className="ml-2"
                          onClick={() => {
                            setFormAtrib({
                              solucionador_id: "",
                              proxima_atr_id: "",
                              proximo_resp_id: "",
                              observacao: "",
                              proximo_prazo: "",
                            });
                            setRightMode("novaAtrib");
                          }}
                        >
                          Próxima Atribuição
                        </Button>
                      
                      )}
                    
                      <Button
                        variant="secondary"
                        onClick={() => setRightMode("partes")}
                      >
                        Partes
                      </Button>
                    </div>
                  )}


              
                    <ul className="processo-modal-right-lista">
                      {(contratoSelecionado?.atribuicoes_evento || []).map((a, idx, arr) => {
                        const ultima = idx === arr.length - 1;
                        const dataStr = a.data_inicial
                          ? new Date(a.data_inicial).toLocaleDateString("pt-BR")
                          : "—";
                          const formatarData = (isoDate) => {
                            if (!isoDate) return "—";
                            const [ano, mes, dia] = isoDate.split("-");
                            return `${dia}/${mes}/${ano}`;
                          };
                          

                        return (
                          <li
                            key={a.id}
                            className={`atr-item-wrapper ${ultima ? "atr-item-final" : ""}`}
                            onClick={() => {
                              setAtrSelecionada(a);
                              setFormAtrib({
                                solucionador_id: a?.responsavel?.id || "",
                                proxima_atr_id: "",
                                proximo_resp_id: "",
                                observacao: "",
                                proximo_prazo: a?.prazo ? a.prazo.split("T")[0] : "", 
                              });
                              setRightMode("visualizarAtrib");
                            }}
                            
                          >
                            <div className="atr-marker">
                              <span className={ultima ? "atr-check" : "atr-dot"}>
                                {ultima ? "✔" : "•"}
                              </span>
                            </div>

                            <div className="atr-conteudo">
                              <div className="atr-desc">{a.atribuicao_descricao}</div>
                              <div className="atr-lista">
                                <div className="atr-linha">
                                  <span className="atr-label">Definida em</span>
                                  <span className="atr-valor">{dataStr}</span>
                                </div>
                                <div className="atr-linha">
                                  <span className="atr-label">Prazo</span>
                                  <span className="atr-valor">{formatarData(a.prazo)}</span>
                                </div>
                                <div className="atr-linha">
                                  <span className="atr-label">Responsável</span>
                                  <span className="atr-valor">{a.responsavel?.nome || "—"}</span>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                </>
              
               
              ) : rightMode === "visualizarAtrib" ? (
                // ======= MODO VISUALIZAR ATRIBUIÇÃO =======
                <div className="processo-right-content">
                  <div className="processo-atr-section">
                    <div className="processo-atr-section-title">Atribuição atual</div>
                    <div className="processo-atr-atual">
                      <div className="atr-linha">
                        <span className="atr-label">Status Atual</span>
                        <span className="atr-valor">{atrSelecionada?.atribuicao_descricao || "-"}</span>
                      </div>
                      <div className="atr-linha">
                        <span className="atr-label">Definida em</span>
                        <span className="atr-valor">{atrSelecionada?.data_inicial ? new Date(atrSelecionada.data_inicial).toLocaleDateString("pt-BR") : "-"}</span>
                      </div>
                      {atrSelecionada?.data_inicial && (
                        <div className="atr-linha">
                          <span className="atr-label">Tempo no Status</span>
                          <span className="atr-valor">
                            {Math.floor(
                              (new Date().getTime() - new Date(atrSelecionada.data_inicial).getTime()) /
                              (1000 * 60 * 60 * 24)
                            )}{" "}
                            dias
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="processo-input-wrapper">
                    <label className="processo-label" htmlFor="prazo">Prazo</label>
                    <input
                      id="prazo"
                      type="date"
                      className="processo-modal-input"
                      value={formAtrib.prazo || ""}
                      onChange={(e) =>
                        setFormAtrib({ ...formAtrib, prazo: e.target.value })
                      }
                      disabled={visualizando}
                    />

                  </div>              
                  <div className="processo-input-wrapper">
                    <label className="processo-label">Responsável</label>
                    <select
                      className="processo-modal-input"
                      value={formAtrib.solucionador_id}
                      onChange={(e) => setFormAtrib({ ...formAtrib, solucionador_id: e.target.value })}
                      disabled={visualizando}
                    >
                      <option value="">Selecione…</option>
                      {colabs.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>

                  </div>
              
                  <div className="processo-input-wrapper">
                    <label className="processo-label">Observação</label>
                    <textarea
                      className="processo-textarea-right"
                      rows={2}
                      value={formAtrib.observacao}
                      onChange={(e) => setFormAtrib({ ...formAtrib, observacao: e.target.value })}
                      readOnly={visualizando}
                    />

                  </div>
                  <div className="processo-right-actions">
                    {!visualizando && (
                      <Button
                        onClick={handleAtualizarAtribuicao}
                      >
                        Atualizar
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setRightMode("atribuicoes");
                        setAtrSelecionada(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>



                </div>
                
            

              ) : rightMode === "novaAtrib" ? (
                <div className="processo-right-content">
                  {/* Atribuição Atual */}
                  <div className="processo-atr-section-title">Atribuição Atual</div>
                  <div className="processo-input-wrapper">
                    <label className="processo-label">Solucionador</label>
                    <select
                      className="processo-modal-input"
                      value={formAtrib.solucionador_id}
                      onChange={(e) => setFormAtrib({ ...formAtrib, solucionador_id: e.target.value })}
                    >
                      <option value="">Selecione…</option>
                      {colabs.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
              
                  {/* Próxima Atribuição */}
                  <div className="processo-atr-section-title" style={{ marginTop: "1rem" }}>Próxima Atribuição</div>
              
                  <div className="processo-input-wrapper">
                    <label className="processo-label">Status</label>
                    <select
                      className="processo-modal-input"
                      value={formAtrib.proxima_atr_id}
                      onChange={(e) => setFormAtrib({ ...formAtrib, proxima_atr_id: e.target.value })}
                    >
                      <option value="">Selecione…</option>
                      {atribs.map(a => (
                        <option key={a.id} value={a.id}>{a.descricao}</option>
                      ))}
                    </select>
                  </div>
              
                  <div className="processo-input-wrapper">
                    <label className="processo-label">Responsável</label>
                    <select
                      className="processo-modal-input"
                      value={formAtrib.proximo_resp_id}
                      onChange={(e) => setFormAtrib({ ...formAtrib, proximo_resp_id: e.target.value })}
                    >
                      <option value="">Selecione…</option>
                      {colabs.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
              
                  <div className="processo-input-wrapper">
                    <label className="processo-label">Prazo</label>
                    <input
                      type="date"
                      className="processo-modal-input"
                      value={formAtrib.proximo_prazo || ""}
                      onChange={(e) =>
                        setFormAtrib({ ...formAtrib, proximo_prazo: e.target.value })
                      }
                    />
                  </div>
              
                  <div className="processo-right-actions">
                    <Button onClick={handleNovaAtribuicao}>Salvar</Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setRightMode("atribuicoes");
                        setAtrSelecionada(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                // ======= MODO PARTES =======
          


                <>
                  {showFormParte && !visualizando ? (
                    // ===== Form de busca de Parte já existente =====
                    <div className="parte-contrato-modal">
                      <div className="editable-input-wrapper">
                        <label className="usuarios-label">CPF</label>
                        <Input
                          className="usuarios-modal-input"
                          value={fetchParte}
                          onChange={(e) => setSearchParte(e.target.value)}
                          placeholder="Digite o CPF"
                        />
                      </div>

                      <div className="non-editable-input-wrapper">
                        <label className="usuarios-label">Nome</label>
                        <Input
                          className="usuarios-modal-input"
                          value={foundParte?.nome || ""}
                          readOnly
                          placeholder="—"
                        />
                      </div>

                      <div className="non-editable-input-wrapper">
                        <label className="usuarios-label">CPF</label>
                        <Input
                          className="usuarios-modal-input"
                          value={foundParte?.cpf || ""}
                          readOnly
                          placeholder="—"
                        />
                      </div>

                      <div className="checkbox-wrapper">
                        <label className="usuarios-label flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={foundParte?.principal || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                            
                              // Garante que só possa haver um principal marcado
                              if (checked) {
                                setPartesVinculadas((prev) =>
                                  prev.map((p) => ({ ...p, principal: false }))
                                );
                              }
                            
                              setFoundParte((prev) => ({
                                ...prev,
                                principal: checked,
                              }));
                            }}
                            
                            disabled={visualizando}
                          />
                          Parte Principal
                        </label>
                      </div>


                      {parteAviso && (
                        <div
                          className="dashboard-modal-error"
                          style={{ margin: "0.5rem 0 0.25rem 0" }}
                        >
                          {parteAviso}
                        </div>
                      )}

                      {/* Ações do formulário de Parte */}
                      <div className="botao-adicionar-contrato">
                      {!parteParaRemover && (
                        <>
                          <Button onClick={handleBuscarParte} disabled={fetchingParte}>
                            {fetchingParte ? "Buscando..." : "Buscar"}
                          </Button>

                          {parteFoiBuscada && isParteValida(foundParte) && (
                            <Button className="ml-2" onClick={handleAdicionarParte}>
                              Adicionar
                            </Button>
                          )}
                        </>
                      )}


                        {parteParaRemover && (
                          <>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                handleRemoverParte(parteParaRemover);
                                setShowFormParte(false);
                                setFoundParte(null);
                                setParteParaRemover(null);
                              }}
                            >
                              Remover
                            </Button>

                            <Button
                              onClick={() => {
                                // lógica de atualização
                                console.log("Atualizar parte:", foundParte);
                                setShowFormParte(false);
                                setParteParaRemover(null);
                                setParteAviso("Parte atualizada.");
                              }}
                            >
                              Atualizar
                            </Button>
                          </>
                        )}

                        <Button
                          variant="outline"
                          className="ml-2"
                          onClick={() => {
                            setShowFormParte(false);
                            setSearchParte("");
                            setFoundParte(null);
                            setParteParaRemover(null);
                            setParteAviso("");
                            setParteFoiBuscada(false); 
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>


                    </div>
                  ) : (
                    // ===== Lista de Partes =====
                    <>
                      {partesVinculadas?.length ? (
                        <ul className="contratos-modal-right-lista">
                          {partesVinculadas.map((p) => (
                            <li
                              key={p.id ?? p.cpf}
                              className={`contratos-modal-right-item ${p.principal ? "emoji-indicador" : ""}`}
                              onClick={
                                visualizando
                                  ? undefined
                                  : () => {
                                      setFoundParte(p);
                                      setSearchParte("");
                                      setParteParaRemover(p);
                                      setShowFormParte(true);
                                      setParteAviso("");
                                    }
                              }
                              style={{ cursor: visualizando ? "default" : "pointer" }}
                              title={visualizando ? undefined : "Clique para remover"}
                              >
                              <div className="contratos-modal-right-texto">
                                <div className={p.principal ? "font-bold" : ""}>
                                  {p.nome}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {p.cpf ? `CPF: ${p.cpf}` : p.tipo_parte}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Nenhuma parte vinculada ainda.</p>
                      )}

                      {/* + Parte só aparece em Novo/Editar */}
                  




                    </>
                  )}
                </>
              )}
            </div>
          </DialogContent>

        </Dialog>
      </div>

      {/* Tabela */}
      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela contratos-tabela">
          <thead>
            <tr>
              <th className="col-numero">Número</th>
              <th className="col-valor">Valor</th>
              <th className="col-status">Status</th>
              <th className="col-responsavel">Responsável</th>
              <th className="col-lote">Lote</th>
              <th className="col-acoes-three-buttons">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Carregando…</td></tr>
            ) : filtrados.length ? (
              filtrados.map((c) => (
                <tr key={c.id}>
                  <td className="col-numero">{c.numero}</td>


                  <td className="col-valor">{c._valorBRL}</td>
                  <td className="col-status">{c._status}</td>
                  <td className="col-responsavel">{c._responsavel}</td>
                  {/*
                  <td className="col-valor">{Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="col-status">{getStatus(c)}</td>
                  <td className="col-responsavel">{getResponsavel(c)}</td>
                  */}

                  <td className="col-lote">{c.lote ?? "-"}</td>
                  <td className="col-acoes-three-buttons">
                  <div className="table-actions">
                    <Button
                      variant="secondary"
                      className="table-action-btn"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        abrirEditar(c);
                      }}
                    >
                      ✏️ Editar
                    </Button>

                    <Button
                      variant="outline"
                      className="table-action-btn"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        abrirDetalhar(c);
                      }}
                    >
                      👁️ Detalhar
                    </Button>

                    <Button
                      variant="default"
                      className="table-action-btn"
                      onClick={() => {
                        console.log("Clicou em Inicial para contrato:", c.id);
                      }}
                    >
                      Inicial
                    </Button>
                  </div>

                  </td>

                </tr>
              ))
            ) : (
              <tr><td colSpan={6}>Nenhum contrato encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
