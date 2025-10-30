// src/pages/Contratos.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Plus, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogOverlay,
} from "@/components/ui/dialog";

import { 
  fetchContratos, 
  createContrato, 
  updateContrato, 
  fetchContratoById } 
from "@/services/ENDPOINTS_ServiceContratos";

import { 
  fetchParteAdversaByCPF 
} from "@/services/ENDPOINTS_ServiceParteAdversa"; // GET /parte-adversa?termo=...

import { 
  fetchColaboradores 
} from "@/services/ENDPOINTS_ServiceColaboradores";

import { 
  fetchAtribuicoesContratos 
} from "@/services/ENDPOINTS_ServiceAtribuicoes";

import { 
  createAtribuicaoEvento, 
  updateAtribuicaoEvento 
} from "@/services/ENDPOINTS_ServiceAtribuicaoEvento";


import { 
  createParteContrato 
} from "@/services/ENDPOINTS_ServicePartesContrato";

import "@/styles/contratos.css";

import ModalLeftContratos from "@/components/modais/contratos/ModalLeftContratos";
import ModalRightInicial from "@/components/modais/contratos/ModalRightInicial";
import ModalRightPartes from "@/components/modais/contratos/ModalRightPartes";
import ModalRightAtribuicoes from "@/components/modais/atribuicoes/ModalRightAtribuicoes";


import "@/styles/contratos.css";






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

    function renderModalLeftTabs(entityType, abaAtiva, setAbaAtiva, setRightMode) {
      let tabs = [];
    
      if (entityType === "contrato") {
        tabs = [
          { id: "contrato", label: "Contrato" },
        ];
      }
    
      return (
        <div className="agenda-modal-tabs">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              className="agenda-modal-tab-btn"
              variant={abaAtiva === tab.id ? "default" : "outline"}
              onClick={() => {
                setAbaAtiva(tab.id);
                if (tab.id === "partes") {
                  setRightMode("partes");
                } else if (tab.id === "inicialContrato") {
                  setRightMode("inicialContrato");
                } else {
                  setRightMode("visualizarAtrib");
                }
              }}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      );
    }
    
    
    
    

    export default function Contratos() {
      const [lista, setLista] = useState([]);
      const [loading, setLoading] = useState(false);
    
      // filtros
      const [fStatus, setFStatus] = useState("");
      const [fLote, setFLote] = useState("");
      const [abaAtiva, setAbaAtiva] = useState("contrato"); // ou "partes" como padrão

    
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
      const [parteEncontrada, setParteEncontrada] = useState(null);

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
      

      // Deriva o modo com prioridade: editar > visualizar > criar
      const modo =
        editando ? "editar" :
        visualizando ? "visualizar" :
        "criar";


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
  setEditando(false);
  setVisualizando(false);

  setForm({ 
    id: "",
    numero: "", 
    valor: "", 
    lote: "", 
    observacao: "", 
    atribId: "" 
  });
  setContratoSelecionado(null);
  setPartesVinculadas([]);
  setSearchParte("");
  setFoundParte(null);
  setShowFormParte(false);
  setParteParaRemover(null);
  setParteAviso("");

  setAbaAtiva("contrato");
  setRightMode("visualizarAtrib");

  setModalAberto(true);
  setTimeout(() => salvarRef.current?.focus(), 0);
};






const abrirDetalhar = async (c) => {
  setEditando(false);
  setVisualizando(true);

  setShowFormParte(false);
  setSearchParte("");
  setFoundParte(null);
  setParteParaRemover(null);
  setParteAviso("");

  setAbaAtiva("contrato");
  setRightMode("visualizarAtrib");

  try {
    const atualizado = await fetchContratoById(c.id);

    setContratoSelecionado(atualizado);

    setForm({
      numero: atualizado.numero || "",
      valor: atualizado.valor ?? "",
      lote: atualizado.lote ?? "",
      observacao: atualizado.observacao ?? "",
      atribId: getCurrentEvento(atualizado)?.atribuicao_id ?? "",
    });

    setPartesVinculadas(atualizado.partes_adversas || []);
    setHistoricoAtribs(atualizado.atribuicoes_evento || []); 

  } catch (err) {
    console.error("Erro ao carregar contrato:", err);
  }

  setModalAberto(true);
};


  
  
  

  
const abrirEditar = async (c) => {
  // 🔹 Define modo corretamente
  setEditando(true);
  setVisualizando(false);

  // 🔹 Reset de estados auxiliares do modal
  setShowFormParte(false);
  setSearchParte("");
  setFoundParte(null);
  setParteParaRemover(null);
  setParteAviso("");

  // 🔹 Define aba e painel inicial
  setAbaAtiva("contrato");
  setRightMode("visualizarAtrib");  // padrão para abrir no painel de atribuições

  try {
    const atualizado = await fetchContratoById(c.id);

    setContratoSelecionado(atualizado);

    setForm({
      id: atualizado.id,
      numero: atualizado.numero || "",
      valor: atualizado.valor ?? "",
      lote: atualizado.lote ?? "",
      observacao: atualizado.observacao ?? "",
      atribId: getCurrentEvento(atualizado)?.atribuicao_id ?? "",
    });

    setPartesVinculadas(atualizado.partes_adversas || []);
    setHistoricoAtribs(atualizado.atribuicoes_evento || []);

  } catch (err) {
    console.error("Erro ao carregar contrato:", err);
  }

  setModalAberto(true);
  setTimeout(() => salvarRef.current?.focus(), 0);
};

const abrirInicial = async (c) => {
  setEditando(false);
  setVisualizando(false);
  setEditando(true);
  setContratoSelecionado(c);

  setAbaAtiva("contrato");     // ✅ define aba ativa
  setRightMode("inicialContrato");    // ✅ define painel direito

  setForm({
    id: c.id,
    numero: c.numero || "",
    valor: c.valor ?? "",
    lote: c.lote ?? "",
    observacao: c.observacao ?? "",
    atribId: getCurrentEvento(c)?.atribuicao_id ?? "",
  });

  setPartesVinculadas(c.partes_adversas || []);
  setHistoricoAtribs(c.atribuicoes_evento || []);

  setModalAberto(true);
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

    setRightMode("visualizarAtrib");
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
    setRightMode("visualizarAtrib");
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
    const payload = {
      numero: String(form.numero).trim(),
      valor: form.valor ? Number(form.valor) : null,
      lote: form.lote ? String(form.lote).trim() : null,
      observacao: form.observacao?.trim() || "",
    };
  
    try {
      if (editando && contratoSelecionado?.id) {
        await updateContrato(contratoSelecionado.id, payload);
      } else {
        await createContrato(payload);
      }
  
      const contratosRes = await fetchContratos();
  
      const decorados = contratosRes.map((c) => {
        const status = getStatus(c);
        const resp = getResponsavel(c);
        const valorBRL = typeof c.valor === "number"
          ? c.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "-";
        return {
          ...c,
          _status: status,
          _responsavel: resp,
          _valorBRL: valorBRL,
          _ordemStatus: 99, // ajuste se tiver um Map(ordem)
        };
      });
  
      decorados.sort((a, b) => a._ordemStatus - b._ordemStatus);
      setLista(decorados);
  
    } catch (error) {
      console.error("Erro ao salvar contrato:", error);
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
            setEditando(false);
            setContratoSelecionado(null);
            setForm({ numero: "", valor: "", lote: "", observacao: "", atribId: "" });
            setPartesVinculadas([]);
            setFormAtrib({
              solucionador_id: "",
              proxima_atr_id: "",
              proximo_resp_id: "",
              observacao: "",
              proximo_prazo: "",
              prazo: ""
            });
            setAtrSelecionada(null);
            setHistoricoAtribs([]);
            setRightMode("visualizarAtrib");
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
              Novo Contrato
            </Button>
          </DialogTrigger>

          <DialogContent
            aria-describedby={undefined}
            className="agenda-modal-container"
            onOpenAutoFocus={(e) => {
              if (visualizando) {
                e.preventDefault(); // impede foco automático
                requestAnimationFrame(() => {
                  document.activeElement?.blur();
                });
              }
            }}
          >
     


            <div className="agenda-modal-split">
              {/* LADO ESQUERDO */}
              
              <div className="agenda-modal-split-left">
                <DialogTitle className="agenda-modal-title">
                  {renderModalLeftTabs("contrato", abaAtiva, setAbaAtiva, setRightMode)}
                </DialogTitle>
                <ModalLeftContratos
                  form={form}
                  setForm={setForm}
                  salvarRef={salvarRef}
                  setEventoSelecionado={setContratoSelecionado}
                  setRightMode={setRightMode}
                  setContratoSelecionado={setContratoSelecionado}
                  modo={modo}
                  setModalAberto={setModalAberto}
                />
              </div>

              {/* LADO DIREITO */}
              <div className="agenda-modal-split-right">
                

                {rightMode === "inicialContrato" && (
                  <ModalRightInicial
                    form={form}
                    setForm={setForm}
                    setRightMode={setRightMode}
                    rightMode={rightMode}
                    modo={editando ? "editar" : visualizando ? "visualizar" : "criar"}
                  />
                )}
                {rightMode === "partes" && (
                  <ModalRightPartes
                    contratoSelecionado={contratoSelecionado}
                    partesVinculadas={partesVinculadas}
                    setPartesVinculadas={setPartesVinculadas}
                    visualizando={visualizando}
                    showFormParte={showFormParte}
                    setShowFormParte={setShowFormParte}
                    fetchParte={fetchParte}
                    setFetchParte={setSearchParte}
                    foundParte={foundParte}
                    setFoundParte={setFoundParte}
                    parteAviso={parteAviso}
                    setParteAviso={setParteAviso}
                    parteParaRemover={parteParaRemover}
                    setParteParaRemover={setParteParaRemover}
                    parteEncontrada={parteEncontrada}
                    setParteEncontrada={setParteEncontrada}
                    rightMode={rightMode}
                    setRightMode={setRightMode}
                    modo={modo}
                  />
                )}
                {(rightMode === "visualizarAtrib" ||
                  rightMode === "novaAtrib" ||
                  rightMode === "editarAtrib") && (
                  <ModalRightAtribuicoes
                    rightMode={rightMode}
                    setRightMode={setRightMode}
                    atribs={atribs}
                    colabs={colabs}
                    historicoAtribs={historicoAtribs}
                    formAtrib={formAtrib}
                    setFormAtrib={setFormAtrib}
                    entityType="contrato"
                    form={form}
                    setForm={setForm}
                    modo={modo}
                  />
                )}
              </div>
            </div>
          </DialogContent>


        </Dialog>
      </div>

      {/* Tabela */}
      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela contratos-tabela">
          <thead>
            <tr>
              <th className="contratos-col-numero">Número</th>
              <th className="contratos-col-valor">Valor</th>
              <th className="contratos-col-status">Status</th>
              <th className="contratos-col-responsavel">Responsável</th>
              <th className="contratos-col-lote">Lote</th>
              <th className="col-acoes-three-buttons">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Carregando…</td></tr>
            ) : filtrados.length ? (
              filtrados.map((c) => (
                <tr key={c.id}>
                  <td className="col-contratos-numero">{c.numero}</td>


                  <td className="contratos-col-valor">{c._valorBRL}</td>
                  <td className="contratos-col-status">{c._status}</td>
                  <td className="contratos-col-responsavel">{c._responsavel}</td>
                  {/*
                  <td className="col-valor">{Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="col-status">{getStatus(c)}</td>
                  <td className="col-responsavel">{getResponsavel(c)}</td>
                  */}

                  <td className="contratos-col-lote">{c.lote ?? "-"}</td>
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
                      onClick={(e) => {
                        e.currentTarget.blur();
                        abrirInicial(c); // ✅ chama função que abre com aba inicial
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
