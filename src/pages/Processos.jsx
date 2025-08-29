// src/pages/Processos.jsx
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogOverlay,
} from "@/components/ui/dialog";

import {
  fetchProcessos,
  fetchProcessoById,
  createProcesso,
  updateProcesso,
  deleteProcesso,
  createParteAoProcesso,
  removeParteDoProcesso,
  fetchAndamentos,
} from "@/services/ENDPOINTS_ServiceProcessos";

import { fetchAtribuicoesProcesso } from "@/services/ENDPOINTS_ServiceAtribuicoes";
import { fetchColaboradores } from "@/services/ENDPOINTS_ServiceColaboradores";

import {
  fetchAtribuicoesEvento,
  createAtribuicaoEvento,
  updateAtribuicaoEvento,
} from "@/services/ENDPOINTS_ServiceAtribuicaoEvento";
import { 
  createProposta,
  fetchPropostasByProcesso,
  updateProposta,
} from "@/services/ENDPOINTS_ServicePropostas";
import { createAcordo } from "@/services/ENDPOINTS_ServiceAcordos.js";




import "@/styles/unified_styles.css";
import "@/styles/unified_refactored_styles.css";

// normaliza para busca local
const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const LinhaInput = React.memo(({ label, children }) => (
  <div className="processo-input-wrapper">
    <label className="processo-label">{label}</label>
    {children}
  </div>
));

function toYMD(raw) {
  if (!raw) return "";
  if (typeof raw === "string") {
    const s = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      return `${yyyy}-${mm}-${dd}`;
    }
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString().split("T")[0];
    return "";
  }
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw.toISOString().split("T")[0];
  }
  return "";
}

function haystackTexto(proc) {
  const numero = (proc?.numero ?? proc?.numero_cnj ?? "").toString();
  const comarca = (proc?.comarca ?? "").toString();
  const partesTxt = (proc?.contrato?.partes || [])
    .map(p => `${p?.nome || ""} ${(p?.cpf || "").replace(/\D/g, "")}`)
    .join(" ");
  return norm(`${numero} ${comarca} ${partesTxt}`);
}

function getPartePrincipal(proc) {
  const partes = proc?.contrato?.partes || [];
  const autor = partes.find(p => /^(autor(a)?)$/i.test(p?.tipo_parte || ""));
  return autor || partes[0] || null;
}

function fmtDM(raw) {
  const ymd = toYMD(raw);
  if (!ymd) return "-";
  const [yyyy, mm, dd] = ymd.split("-");
  return `${dd}/${mm}`;
}

export default function Processos() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

  // filtros (client-side)
  const [fTexto, setFTexto] = useState("");
  const [fResp, setFResp] = useState("");
  const [fDataIni, setFDataIni] = useState("");
  const [fDataFim, setFDataFim] = useState("");

  const [fStatus, setFStatus] = useState("");
  const [atribs, setAtribs] = useState([]);

  // modal
  const [modalAberto, setModalAberto] = useState(false);
  const [visualizando, setVisualizando] = useState(false);
  const [editando, setEditando] = useState(false);
  const salvarRef = useRef(null);

  // painel direito: modo "lista" ou "form" de nova atribuição
  const [rightPanelMode, setRightPanelMode] = useState("list");

  // catálogos
  const [colabs, setColabs] = useState([]); // GET /colaboradores

  // form da nova atribuição
  const [novaAtrib, setNovaAtrib] = useState({
    solucionador_id: "",        // colaborador que executou (parte 1)
    atribuicao_id: "",      // tipo de atribuição (parte 2)
    colaborador_id: "",     // responsável (parte 2)
  });

  // right pane: modo e formulário de atribuição
  const [atrSelecionada, setAtrSelecionada] = useState(null); // a que foi clicada
  const [isUltima, setIsUltima] = useState(false);            // se é a última da lista
  const [formAtrib, setFormAtrib] = useState({
    solucionador_id: "",          // quem executou (fecha a atual)
    proxima_atr_id: "",       // id do tipo da próxima atribuição
    proximo_resp_id: "",      // colaborador responsável pela próxima
    observacao: "",           // observação (para PUT atual e/ou POST próxima)
    ultimaEtapa: false,       // se marcar → só PUT na atual
  });

  const [modalPropostasAberto, setModalPropostasAberto] = useState(false);
  const [propostasProcesso, setPropostasProcesso] = useState([]);
  const [mostrandoFormularioProposta, setMostrandoFormularioProposta] = useState(false);
  const [editandoProposta, setEditandoProposta] = useState(null); // objeto da proposta sendo editada
  const [vencimentoAcordo, setVencimentoAcordo] = useState("");
  const [mesPrimeiroPagamento, setMesPrimeiroPagamento] = useState("");



  const [novaProposta, setNovaProposta] = useState({
    numero_parcelas: "",
    valor_parcela: "",
  });
  


  // formulário do processo
  const [form, setForm] = useState({
    numero: "",
    contrato_numero: "",
    data_distribuicao: "",
    data_publicacao: "",
    comarca: "",
    prazo_juridico: "",
    prazo_interno: "",
    prazo_fatal: "",
    observacao: ""
  });
  

  const [processoSel, setProcessoSel] = useState(null);

  // lado direito
  const [rightMode, setRightMode] = useState("partes"); // "partes" | "andamentos"
  const [partes, setPartes] = useState([]);
  const [andamentos, setAndamentos] = useState([]);
  const [erroModal, setErroModal] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!modalAberto) return;
    (async () => {
      try {
        const c = await fetchColaboradores();
        setColabs(Array.isArray(c) ? c : []);
      } catch { setColabs([]); }
    })();
  }, [modalAberto]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const dados = await fetchProcessos();
        setLista(Array.isArray(dados) ? dados : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAtribuicoesProcesso();
        setAtribs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Falha ao carregar atribuições:", e);
        setAtribs([]);
      }
      try {
        const users = await fetchColaboradores();
        setColabs(Array.isArray(users) ? users : []);
      } catch (e) {
        console.error("Falha ao carregar colaboradores:", e);
        setColabs([]);
      }
    })();
  }, []);
  
  useEffect(() => {
    if (modalAberto && editando && salvarRef.current) {
      salvarRef.current.focus();
    }
  }, [modalAberto, editando]);
  

  useEffect(() => {
    if (!modalAberto || rightMode !== "editAtrib") return;
    const id = setInterval(() => setTick((t) => t + 1), 60 * 1000); // a cada 1 min
    return () => clearInterval(id);
  }, [modalAberto, rightMode]);


  useEffect(() => {
    if (!processoSel || !editando) return;
    setForm({
      numero: processoSel.numero ?? processoSel.numero_cnj ?? "",
      contrato_numero: processoSel?.contrato?.numero ?? "",
      data_distribuicao: toYMD(processoSel.data_distribuicao),
      data_publicacao: toYMD(processoSel.data_publicacao),
      comarca: processoSel.comarca ?? "",
      prazo_juridico: processoSel.prazo_juridico ?? "",
      prazo_interno: toYMD(processoSel.prazo_interno),
      prazo_fatal: toYMD(processoSel.prazo_fatal),
      observacao: processoSel.observacao ?? "",
    });
    setPartes((processoSel?.contrato?.partes) || []);
    setAndamentos(Array.isArray(processoSel?.atribuicoes_evento) ? processoSel.atribuicoes_evento : []);
  }, [processoSel, editando]);
  

  const filtrados = useMemo(() => {
    const txt = norm(fTexto);
    const resp = norm(fResp);
    const status = norm(fStatus);

    return (lista || []).filter((p) => {
      const alvoTexto = haystackTexto(p);
      const okTexto = txt ? alvoTexto.includes(txt) : true;

      const alvoResp = norm(p?.responsavel_atual?.nome ?? p?.responsavel?.nome ?? "");
      const okResp = resp ? alvoResp.includes(resp) : true;

      const alvoStatus = norm(p?.status_atual ?? "");
      const okStatus = status ? alvoStatus === status : true;

      const prazoYMD = toYMD(p?.prazo_interno);
      const iniYMD   = toYMD(fDataIni);
      const fimYMD   = toYMD(fDataFim);

      const okData =
        (iniYMD ? prazoYMD >= iniYMD : true) &&
        (fimYMD ? prazoYMD <= fimYMD : true);

      return okTexto && okResp && okStatus && okData;
    });
  }, [lista, fTexto, fResp, fStatus, fDataIni, fDataFim]);


  async function handleAtualizarAtribuicao() {
    try {
      if (!atrSelecionada?.id) return;
      await updateAtribuicaoEvento(atrSelecionada.id, {
        responsavel_id: Number(formAtrib.solucionador_id),
        prazo: formAtrib.prazo,
        observacao: formAtrib.observacao,
      });
      const atualizado = await fetchProcessoById(processoSel.id);
      setProcessoSel(atualizado);
      setAndamentos(atualizado.atribuicoes_evento || []);
      setRightMode("list");
    } catch (e) {
      console.error(e);
      setErroModal("Erro ao atualizar atribuição.");
    }
  }

  const handleAdicionarProposta = async () => {
    if (!processoSel || !processoSel.id) {
      alert("Nenhum processo selecionado.");
      return;
    }
  
    try {
      const payload = {
        processo_id: processoSel.id,
        numero_parcelas: Number(novaProposta.numero_parcelas),
        valor_parcela: Number(novaProposta.valor_parcela),
      };
  
      await createProposta(payload);
  
      // 🔄 Recarrega todas as propostas após o POST
      const propostas = await fetchPropostasByProcesso(processoSel.id);
      setPropostasProcesso(Array.isArray(propostas) ? propostas : []);
  
      setNovaProposta({ numero_parcelas: "", valor_parcela: "" });
      setMostrandoFormularioProposta(false);
    } catch (err) {
      console.error("Erro ao adicionar proposta:", err);
      alert("Erro ao adicionar proposta.");
    }
  };
  
  
  
  
  
  async function handleEditarProposta() {
    try {
      if (!editandoProposta) return;
  
      await updateProposta(editandoProposta.id, {
        numero_parcelas: Number(novaProposta.numero_parcelas),
        valor_parcela: Number(novaProposta.valor_parcela),
      });
  
      const propostas = await fetchPropostasByProcesso(processoSel.id);
      setPropostasProcesso(propostas);
      setMostrandoFormularioProposta(false);
      setEditandoProposta(null);
    } catch (err) {
      console.error("Erro ao editar proposta:", err);
      alert("Erro ao editar proposta.");
    }
  }
  
  async function handleAceitarProposta() {
    try {
      if (!editandoProposta || !processoSel?.id) return;
  
      if (!vencimentoAcordo || !mesPrimeiroPagamento) {
        alert("Preencha a data de vencimento e o mês do primeiro pagamento.");
        return;
      }
  
      const payload = {
        processo_id: processoSel.id,
        proposta_processo_id: editandoProposta.id,
        data_vencimento: vencimentoAcordo,
        mes_primeiro_pagamento: mesPrimeiroPagamento,
      };
  
      await createAcordo(payload);
  
      const propostas = await fetchPropostasByProcesso(processoSel.id);
      setPropostasProcesso(propostas);
      setMostrandoFormularioProposta(false);
      setEditandoProposta(null);
      setVencimentoAcordo("");
      setMesPrimeiroPagamento("");
    } catch (err) {
      console.error("Erro ao aceitar proposta:", err);
      alert("Erro ao aceitar proposta.");
    }
  }
  
  
  

  async function handleCriarAtribuicao() {
    try {
      if (!formAtrib.proxima_atr_id || !formAtrib.proximo_resp_id || !formAtrib.prazo) {
        setErroModal("Preencha todos os campos.");
        return;
      }
      await createAtribuicaoEvento({
        processo_id: Number(processoSel.id),
        entity_type: "processo", 
        solucionador_id: Number(formAtrib.solucionador_id),
        atribuicao_id: Number(formAtrib.proxima_atr_id),
        responsavel_id: Number(formAtrib.proximo_resp_id),
        data_inicial: new Date().toISOString(),
        prazo: formAtrib.prazo,
      });
      
      // Após POST, atualize o processo inteiro
      const atualizado = await fetchProcessoById(processoSel.id);
      setProcessoSel(atualizado);
      setAndamentos(atualizado.atribuicoes_evento || []);
      setRightMode("list");
      
    } catch (e) {
      console.error(e);
      setErroModal("Erro ao criar atribuição.");
    }
  }
  



  // ===== Aberturas de modal =====
  const abrirModalPropostas = async (processoId) => {
    try {
      const data = await fetchProcessoById(processoId);
      setProcessoSel(data); 
  
      const propostas = await fetchPropostasByProcesso(processoId); 
      setPropostasProcesso(Array.isArray(propostas) ? propostas : []);
      setModalPropostasAberto(true);
    } catch (e) {
      console.error("Erro ao buscar propostas:", e);
      setPropostasProcesso([]);
      setModalPropostasAberto(true);
    }
  };
  
  

  const abrirNovo = () => {
    setVisualizando(false);
    setEditando(false);
    setRightMode("list");
    setErroModal("");
    setProcessoSel(null);
    setForm({
      numero: "",
      contrato_numero: "",
      data_distribuicao: "",
      data_publicacao: "",
      comarca: "",
      prazo_juridico: "",
      prazo_interno: "",
      prazo_fatal: "",
      observacao: "",
    });
    setPartes([]);
    setAndamentos([]);
    setModalAberto(true);

  };



  const abrirDetalhar = async (id) => {
    try {
      setErroModal("");
      const data = await fetchProcessoById(id);
      setProcessoSel(data);

  
      setVisualizando(true);
      setEditando(false);
      setRightMode("list");
      setModalAberto(true);
      requestAnimationFrame(() => document.activeElement?.blur());
    } catch (e) {
      console.error(e);
      setErroModal("Erro ao carregar o processo.");
      setModalAberto(true);
    }
  };
  

  const abrirEditar = async (id) => {
    try {
      setErroModal("");
      const data = await fetchProcessoById(id);
      setProcessoSel(data);

  
      // agora usamos diretamente os dados do backend
      setVisualizando(false);
      setEditando(true);
      setRightMode("list");
      setModalAberto(true);

  
      const respDefaultId = data?.responsavel_atual?.id ?? data?.responsavel?.id ?? "";
      setFormAtrib({
        solucionador_id: respDefaultId,
        proxima_atr_id: "",
        proximo_resp_id: "",
        observacao: "",
        ultimaEtapa: false,
      });
  
    } catch (e) {
      console.error(e);
      setErroModal("Erro ao carregar o processo.");
      setModalAberto(true);
    }
  };
  
  

  // ===== Persistência =====
  // ===== Persistência =====
const salvar = async () => {
  setErroModal("");
  try {
    // Monta o payload sem contrato_numero (somente contrato_id + demais campos)
    const { contrato_numero, contrato_id, ...rest } = form;

    // Se quiser garantir número (caso usuário digite texto no campo do contrato):
    const payload = {
      numero: form.numero,
      cliente: "Finsol",
      contrato_numero: form.contrato_numero || form.contrato_id || "",
      data_distribuicao: form.data_distribuicao,
      data_publicacao: form.data_publicacao,
      comarca: form.comarca,
      prazo_juridico: form.prazo_juridico,
      prazo_interno: form.prazo_interno,
      prazo_fatal: form.prazo_fatal,
      observacao: form.observacao
    };
    

    if (editando && processoSel?.id) {
      await updateProcesso(processoSel.id, payload);
    } else {
      const created = await createProcesso(payload);
      const newId = created?.id;

      // Vincula partes somente se houver
      if (newId && partes?.length) {
        for (const p of partes) {
          try {
            await createParteAoProcesso(newId, {
              cpf: p.cpf,
              nome: p.nome,
              tipo_parte: p.tipo_parte || "Autor",
            });
          } catch (e) {
            console.error("Erro ao vincular parte:", e);
          }
        }
      }
    }

    setModalAberto(false);

    // Recarrega lista
    setLoading(true);
    const dados = await fetchProcessos();
    setLista(Array.isArray(dados) ? dados : []);
    setLoading(false);
  } catch (e) {
    console.error(e);
    setErroModal("Falha ao salvar. Verifique os campos obrigatórios.");
  }
};


  // ===== UI helpers =====


  const fmtDataBR = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("pt-BR");
  };
  
  const tempoDecorrido = (s) => {
    if (!s) return "-";
    const ini = new Date(s);
    if (Number.isNaN(ini.getTime())) return "-";
    const now = new Date();
    const diff = Math.max(0, now - ini);
    const m = 60 * 1000, h = 60 * m, d = 24 * h;
    const dias = Math.floor(diff / d);
    const horas = Math.floor((diff - dias * d) / h);
    const mins  = Math.floor((diff - dias * d - horas * h) / m);
    if (dias >= 1) return `${dias} dia${dias > 1 ? "s" : ""}`;
    if (horas >= 1) return `${horas}h ${mins}m`;
    return `${mins}m`;
  };

  function dividirEmColunas(lista, tamanhoColuna = 8) {
    const colunas = [];
    for (let i = 0; i < lista.length; i += tamanhoColuna) {
      colunas.push(lista.slice(i, i + tamanhoColuna));
    }
    return colunas;
  }
  

  // buffer p/ adicionar parte no modo "novo"
  const [parteCPF, setParteCPF] = useState("");
  const [parteNome, setParteNome] = useState("");
  const [parteTipo, setParteTipo] = useState("Autor");

  const adicionarParte = async () => {
    if (!parteCPF || !parteNome) {
      setErroModal("Informe CPF e Nome.");
      return;
    }
    if (editando && processoSel?.id) {
      try {
        const res = await createParteAoProcesso(processoSel.id, {
          cpf: parteCPF, nome: parteNome, tipo_parte: parteTipo,
        });
        const pid = res?.id ?? crypto.randomUUID();
        setPartes((prev) => [...prev, { id: pid, cpf: parteCPF, nome: parteNome, tipo_parte: parteTipo }]);
        setParteCPF(""); setParteNome(""); setParteTipo("Autor");
        setErroModal("");
      } catch {
        setErroModal("Não foi possível adicionar a parte agora.");
      }
      return;
    }
    setPartes((prev) => [...prev, { id: crypto.randomUUID(), cpf: parteCPF, nome: parteNome, tipo_parte: parteTipo }]);
    setParteCPF(""); setParteNome(""); setParteTipo("Autor");
    setErroModal("");
  };

  const removerParte = async (p) => {
    if (editando && processoSel?.id && p?.id) {
      try {
        await removeParteDoProcesso(processoSel.id, p.id);
        setPartes((prev) => prev.filter((x) => x.id !== p.id));
      } catch {
        setErroModal("Falha ao remover a parte.");
      }
      return;
    }
    setPartes((prev) => prev.filter((x) => x.id !== p.id));
  };

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Processos</h3>

      {/* Filtros (estilo Contratos.jsx) */}
      <div className="usuarios-header">
        <div className="usuarios-filtros">
          {/* Input combinado: CNJ, Parte, Comarca */}
          <div className="dashboard-filtro-group" style={{ position: "relative" }}>
            <Input
              className="dashboard-select dashboard-filtro-usuario-input"
              placeholder="CNJ, Parte ou Comarca"
              value={fTexto}
              onChange={(e) => setFTexto(e.target.value)}
              title="Busca por CNJ, Parte ou Comarca"
            />
            {fTexto && (
              <button
                onClick={() => setFTexto("")}
                className="dashboard-filtro-clear"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Responsável */}
          <div className="dashboard-filtro-group" style={{ position: "relative" }}>
            <Input
              className="dashboard-select dashboard-filtro-usuario-input"
              placeholder="Responsável"
              value={fResp}
              onChange={(e) => setFResp(e.target.value)}
              title="Buscar por responsável"
            />
            {fResp && (
              <button
                onClick={() => setFResp("")}
                className="dashboard-filtro-clear"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status (select vindo de atribuições) */}
          <div className="dashboard-filtro-group" style={{ position: "relative" }}>
            <select
              className="dashboard-select"
              value={fStatus}
              onChange={(e) => setFStatus(e.target.value)}
              title="Filtrar por status"
            >
              <option value="">Todos os Status</option>
              {(atribs || []).map((a) => (
                <option key={a.id} value={a.descricao}>{a.descricao}</option>
              ))}
            </select>
            {fStatus && (
              <button
                onClick={() => setFStatus("")}
                className="dashboard-filtro-clear"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Prazo Interno – intervalo (início e fim) */}
          <div className="dashboard-filtro-group" style={{ position: "relative", gap: "0.5rem" }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>de</span>
            <div style={{ position: "relative" }}>
              <Input
                type="date"
                className="dashboard-select dashboard-filtro-usuario-input"
                value={fDataIni}
                onChange={(e) => setFDataIni(e.target.value)}
                title="Prazo Interno - Início"
              />
              {fDataIni && (
                <button onClick={() => setFDataIni("")} className="dashboard-filtro-clear">
                  <X size={14} />
                </button>
              )}
            </div>

            <span style={{ fontSize: 12, color: "#6b7280" }}>até</span>

            <div style={{ position: "relative" }}>
              <Input
                type="date"
                className="dashboard-select dashboard-filtro-usuario-input"
                value={fDataFim}
                onChange={(e) => setFDataFim(e.target.value)}
                title="Prazo Interno - Fim"
              />
              {fDataFim && (
                <button onClick={() => setFDataFim("")} className="dashboard-filtro-clear">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <Dialog
          open={modalAberto}
          onOpenChange={(open) => {
            setModalAberto(open);
            if (!open) {
              setRightMode("list");
              setAtrSelecionada(null); // limpa a seleção da atribuição
              setVisualizando(false);
            }
          }}
        >
          <DialogOverlay className="processo-dialog-overlay" />
          <DialogTrigger asChild>
            <Button
              className="usuarios-btn-material"
              onClick={(e) => { e.currentTarget.blur(); abrirNovo(); }}
            >
              <Plus size={16} /> Novo Processo
            </Button>
          </DialogTrigger>

            <DialogContent
              className="processo-modal processo-split-modal processo-no-close processo-dialog-content"
              onOpenAutoFocus={(e) => {
                  e.preventDefault(); 
              }}
            >
        

            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

            {/* Lado esquerdo - só campos do schema */}
            <div className="processo-modal-split-left">
              <DialogTitle className="processo-modal-title">
                {visualizando ? "Detalhar Processo" : editando ? "Editar Processo" : "Novo Processo"}
              </DialogTitle>
              <DialogDescription className="processo-modal-description">
                Preencha os dados do processo.
              </DialogDescription>

              {/* Linha 1 - CNJ e Número do Contrato */}
              {/* Linha 1 - CNJ e Contrato */}
              <div className="processo-input-row">
                <LinhaInput label="Número (CNJ)">
                  <Input
                    className="processo-modal-input"
                    value={form.numero || ""}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>

                <LinhaInput label="Contrato (nº ou ID)">
                  <Input
                    className="processo-modal-input"
                    value={(form.contrato_numero || form.contrato_id || "").toString()}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contrato_id: e.target.value,   // se digitar, usamos como ID
                        contrato_numero: ""            // digitou manualmente → limpa nº
                      })
                    }
                    placeholder="Ex.: C-2025-021 (ou ID)"
                    readOnly={visualizando}
                  />
                </LinhaInput>
              </div>


              {/* Linha 2 - Datas */}
              <div className="processo-input-row">
                <LinhaInput label="Data de Distribuição">
                  <Input
                    type="date"
                    className="processo-modal-input"
                    value={form.data_distribuicao || ""}
                    onChange={(e) => setForm({ ...form, data_distribuicao: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>

                <LinhaInput label="Data de Publicação">
                  <Input
                    type="date"
                    className="processo-modal-input"
                    value={form.data_publicacao || ""}
                    onChange={(e) => setForm({ ...form, data_publicacao: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>
              </div>

              {/* Linha 3 - Comarca */}
              <LinhaInput label="Comarca">
                <Input
                  className="processo-modal-input"
                  value={form.comarca || ""}
                  onChange={(e) => setForm({ ...form, comarca: e.target.value })}
                  readOnly={visualizando}
                />
              </LinhaInput>

              {/* Linha 4 - Prazos */}
              <div className="processo-input-row triple">
                <LinhaInput label="Prazo Jurídico (dias)">
                  <Input
                    type="number"
                    className="processo-modal-input"
                    value={form.prazo_juridico?.toString() || ""}
                    onChange={(e) => setForm({ ...form, prazo_juridico: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>

                <LinhaInput label="Prazo Interno">
                  <Input
                    type="date"
                    className="processo-modal-input"
                    value={form.prazo_interno || ""}
                    onChange={(e) => setForm({ ...form, prazo_interno: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>

                <LinhaInput label="Prazo Fatal">
                  <Input
                    type="date"
                    className="processo-modal-input"
                    value={form.prazo_fatal || ""}
                    onChange={(e) => setForm({ ...form, prazo_fatal: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>
              </div>

              {/* Observação */}
              <LinhaInput label="Observação">
                <textarea
                  className="processo-textarea"
                  rows={2}
                  value={form.observacao || ""}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  readOnly={visualizando}
                />
              </LinhaInput>


              {!visualizando && (
                <div className="processo-botao-salvar-bottom">
                  <Button ref={salvarRef} onClick={salvar}>Salvar</Button>
                </div>
              )}
            </div>

            {/* Lado direito */}
            <div className="processo-modal-split-right">

              <div className="flex items-center processo-modal-title">
                <h5>Atribuições do Processo</h5>
              </div>

              {rightMode === "list" && (
                <>
                  <ul className="processo-modal-right-lista" style={{ marginTop: "0.75rem" }}>
                    {(andamentos || []).map((a, idx, arr) => {
                      const ultima = idx === arr.length - 1;
                      return (
                        <li
                          key={a.id}
                          className={`processo-modal-right-item processo-atr-item ${ultima ? "atual" : ""}`}
                          onClick={() => {
                            setAtrSelecionada(a);
                            setFormAtrib({
                              solucionador_id: a?.responsavel?.id ?? "",
                              prazo: toYMD(a?.prazo),
                              observacao: a?.observacao ?? "",
                              proxima_atr_id: "",
                              proximo_resp_id: "",
                              ultimaEtapa: false,
                            });
                            setRightMode("edit");
                          }}
                          
                          
                        >
                          <div className="processo-modal-right-texto">
                            <div className="atr-desc">{a.atribuicao_descricao}</div>
                            <div className="atr-lista">
                              <div className="atr-linha">
                                <span className="atr-label">Definida em</span>
                                <span className="atr-valor">{fmtDataBR(a.data_inicial)}</span>
                              </div>
                              <div className="atr-linha">
                                <span className="atr-label">Prazo</span>
                                <span className="atr-valor">{fmtDataBR(a.prazo)}</span>
                              </div>
                              <div className="atr-linha">
                                <span className="atr-label">Responsável</span>
                                <span className="atr-valor">{a.responsavel?.nome || "-"}</span>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                    <div className="processo-right-actions">
                      {!visualizando && editando && (
                        <Button onClick={() => {
                          setFormAtrib({
                            solucionador_id: "",
                            proxima_atr_id: "",
                            proximo_resp_id: "",
                            prazo: "",
                            observacao: "",
                            ultimaEtapa: false,
                          });
                          setRightMode("new");
                        }}>
                          Próxima Atribuição
                        </Button>
                      )}
                    </div>

                </>
              )}

              {rightMode === "edit" && atrSelecionada && (
                <>
                  <div className="processo-right-content" style={{ marginTop: "0.75rem" }}>
                    <div className="processo-atr-section">
                      <div className="processo-atr-section-title">Atribuição atual</div>
                      <div className="atr-linha">
                        <span className="atr-label">Status Atual</span>
                        <span className="atr-valor">{atrSelecionada.atribuicao_descricao}</span>
                      </div>
                      <div className="atr-linha">
                        <span className="atr-label">Definida em</span>
                        <span className="atr-valor">{fmtDataBR(atrSelecionada.data_inicial)}</span>
                      </div>
                      <div className="atr-linha">
                        <span className="atr-label">Tempo no Status</span>
                        <span className="atr-valor">{tempoDecorrido(atrSelecionada.data_inicial)}</span>
                      </div>
                    </div>

                    <div className="processo-input-wrapper">
                      <label className="processo-label">Prazo</label>
                      <Input
                        type="date"
                        className="processo-modal-input"
                        value={formAtrib.prazo}
                        onChange={(e) => setFormAtrib({ ...formAtrib, prazo: e.target.value })}
                        readOnly={visualizando}
                      />
                    </div>

                    <div className="processo-input-wrapper">
                      <label className="processo-label">Solucionador</label>
                        <select
                          className={`processo-modal-input ${visualizando ? "select-disabled-look" : ""}`}
                          disabled={visualizando}
                          value={formAtrib.solucionador_id}
                          onChange={(e) => setFormAtrib({ ...formAtrib, solucionador_id: e.target.value })}
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
                        readOnly={visualizando}
                        rows={2}
                        value={formAtrib.observacao}
                        onChange={(e) => setFormAtrib({ ...formAtrib, observacao: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="processo-right-actions">
                    <Button variant="secondary" onClick={() => setRightMode("list")}>Cancelar</Button>
                    {!visualizando && (
                      <Button onClick={handleAtualizarAtribuicao}>Atualizar</Button>
                    )}
                  </div>
                </>
              )}

              
              {rightMode === "new" && !visualizando && (
                <>
                  <div className="processo-right-content" style={{ marginTop: "0.75rem" }}>
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
                        {colabs.map((c) => (
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
                        {atribs.map((a) => (
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
                      <Input
                        type="date"
                        className="processo-modal-input"
                        value={formAtrib.prazo}
                        onChange={(e) => setFormAtrib({ ...formAtrib, prazo: e.target.value })}
                      />
                    </div>
                    </div>


                  <div className="processo-right-actions">
                    <Button variant="secondary" onClick={() => setRightMode("list")}>Cancelar</Button>
                    <Button onClick={handleCriarAtribuicao}>Salvar</Button>
                  </div>
                </>
              )}
            </div>





                      

            {erroModal && <div className="processo-modal-error">{erroModal}</div>}
          </DialogContent>
        </Dialog>


        <Dialog open={modalPropostasAberto} onOpenChange={setModalPropostasAberto}>
          <DialogOverlay className="processo-dialog-overlay" />
          <DialogContent className="processo-modal processo-no-close propostas-modal-fixed-size">
            <div className="propostas-modal-body">
              <DialogTitle className="proposta-modal-title">Propostas</DialogTitle>

              <DialogDescription className="proposta-modal-description">
                Propostas vinculadas a este processo
              </DialogDescription>

              <div className="propostas-scroll-wrapper">
                <div className="propostas-grid">
                  

                  {(() => {
                    const todas = [...propostasProcesso];

                    // Se for nova proposta, adiciona um item fictício no fim para renderizar o formulário
                    if (mostrandoFormularioProposta && !editandoProposta) {
                      todas.push({ id: "__nova__", numero_parcelas: "", valor_parcela: "" });
                    }

                    // Agrupa de 8 em 8 para colunas
                    return dividirEmColunas(todas, 8).map((coluna, colIdx) => (
                      <div key={colIdx} className="propostas-coluna">
                        {coluna.map((p) => {
                          const isEdicao = editandoProposta?.id === p.id;
                          const isNova = p.id === "__nova__";

                          if ((isEdicao || isNova) && mostrandoFormularioProposta) {
                            return (
                              <div key={p.id} className="proposta-formulario">
                                <div className="proposta-formulario-vertical">
                                  <div className="proposta-linha-formulario">
                                    <label>Parcelas:</label>
                                    <Input
                                      type="number"
                                      value={novaProposta.numero_parcelas}
                                      onChange={(e) =>
                                        setNovaProposta({ ...novaProposta, numero_parcelas: e.target.value })
                                      }
                                    />
                                  </div>

                                  <div className="proposta-linha-formulario">
                                    <label>Valor:</label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={novaProposta.valor_parcela}
                                      onChange={(e) =>
                                        setNovaProposta({ ...novaProposta, valor_parcela: e.target.value })
                                      }
                                    />
                                  </div>

                                  <div className="processo-right-actions">
                                    <Button
                                      variant="secondary"
                                      onClick={() => {
                                        setMostrandoFormularioProposta(false);
                                        setNovaProposta({ numero_parcelas: "", valor_parcela: "" });
                                        setEditandoProposta(null);
                                      }}
                                    >
                                      Cancelar
                                    </Button>

                                    {editandoProposta ? (
                                      <>
                                        <Button onClick={handleEditarProposta}>Editar</Button>
                                        <Button onClick={handleAceitarProposta}>Aceitar</Button>
                                      </>
                                    ) : (
                                      <Button onClick={handleAdicionarProposta}>Adicionar</Button>
                                    )}
                                  </div>
                                </div>


                              </div>


                            );
                          }

                          return (
                            <div
                              key={p.id}
                              className="proposta-card"
                              onClick={() => {
                                setNovaProposta({
                                  numero_parcelas: p.numero_parcelas.toString(),
                                  valor_parcela: p.valor_parcela.toFixed(2),
                                });
                                setEditandoProposta(p);
                                setMostrandoFormularioProposta(true);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <strong>Parcelas:</strong> {p.numero_parcelas}<br />
                              <strong>Valor:</strong> R$ {p.valor_parcela.toFixed(2)}
                            </div>
                          );
                        })}
                      </div>
                    ));
                  })()}



                </div>
              </div>
            </div>

            {!mostrandoFormularioProposta && (
              <div className="processo-right-actions">
                <Button
                  onClick={() => {
                    setNovaProposta({ numero_parcelas: "", valor_parcela: "" });
                    setEditandoProposta(null);
                    setMostrandoFormularioProposta(true);
                  }}
                >
                  + Proposta
                </Button>
              </div>
            )}

          </DialogContent>


        </Dialog>

      </div>

      {/* Tabela */}
      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela">
          <thead>
            <tr>
              <th className="processo-col-cnj">Nº CNJ</th>
              <th className="processo-col-parte-principal">Parte Principal</th>
              <th className="processo-col-status">Status</th>
              <th className="processo-col-comarca">Comarca</th>
              <th className="processo-col-prazo-interno">Prazo Interno</th>
              <th className="processo-col-responsavel-processo">Responsável</th>
              <th className="col-acoes-three-buttons">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}>Carregando…</td></tr>
            ) : filtrados.length ? (
              filtrados.map((p) => (
                <tr key={p.id}>
                  <td className="processo-col-cnj">{p.numero ?? p.numero_cnj}</td>
                  <td className="processo-col-parte-principal">{(getPartePrincipal(p)?.nome) ?? "-"}</td>
                  <td className="processo-col-status">{p.status_atual ?? "-"}</td>
                  <td className="processo-col-comarca">{p.comarca ?? "-"}</td>
                  <td className="processo-col-prazo-interno">{fmtDM(p.prazo_interno)}</td>
                  <td className="processo-col-responsavel-processo">
                    {p.responsavel_atual?.nome ?? p.responsavel?.nome ?? "-"}
                  </td>
                  <td className="col-acoes-three-buttons">
                  <div className="table-actions">
                    <Button
                      variant="secondary"
                      className="table-action-btn"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        abrirEditar(p.id);
                      }}
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      variant="outline"
                      className="table-action-btn"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        abrirDetalhar(p.id);
                      }}
                    >
                      👁️ Detalhar
                    </Button>
                    <Button
                      variant="default"
                      className="table-action-btn"
                      onClick={() => abrirModalPropostas(p.id)}
                    >
                      💼 Proposta
                    </Button>
                  </div>

                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7}>Nenhum processo encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
