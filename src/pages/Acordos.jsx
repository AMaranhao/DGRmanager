// src/pages/Acordos.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Check, X, AlertCircle, CheckCircle } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogOverlay,
} from "@/components/ui/dialog";

import {
  fetchAcordosUnificados,
  fetchAcordoUnificadoById,
  updateAcordo,
} from "@/services/ENDPOINTS_ServiceAcordos";

import {
  fetchModalParcelasByAcordoId,
} from "@/services/ENDPOINTS_ServiceParcelasAcordo";

import {
  updatePagamentoAcordo,
} from "@/services/ENDPOINTS_ServiceAcordoPagamento";

import {
  fetchAtribuicoesAcordo,
} from "@/services/ENDPOINTS_ServiceAtribuicoes";

import {
  createAtribuicaoEvento,
  updateAtribuicaoEvento,
} from "@/services/ENDPOINTS_ServiceAtribuicaoEvento";


import { fetchColaboradores } from "@/services/ENDPOINTS_ServiceColaboradores";

// ===============================
// 🧩 Modais de Acordos (modularizados)
// ===============================
import ModalLeftAcordo from "@/components/modais/acordos/ModalLeftAcordo";
import ModalLeftParcelas from "@/components/modais/acordos/ModalLeftParcelas";
import ModalRightParcelas from "@/components/modais/acordos/ModalRightParcelas";
import ModalRightAtribuicoes from "@/components/modais/atribuicoes/ModalRightAtribuicoes";

// ===============================
// 🎨 Estilos específicos de Acordos
// ===============================
import "@/styles/acordos.css";



// 🔧 Calcula status da parcela (mesma lógica usada em Agenda.jsx)
function definirStatusParcela(parcela) {
  if (parcela.pago) return "pago";
  const hoje = new Date();
  const venc = new Date(parcela.data_vencimento);
  return venc < hoje ? "em_atraso" : "pendente";
}

    
    
export default function Acordos() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [visualizando, setVisualizando] = useState(false);
  const [editando, setEditando] = useState(false);
  const salvarRef = useRef(null);
  const [abaAtiva, setAbaAtiva] = useState("acordo");

  const [fStatus, setFStatus] = useState("");
  const [fBusca, setFBusca] = useState("");

  const [acordoSelecionado, setAcordoSelecionado] = useState(null);
  const [form, setForm] = useState({});

  const [modalParcelasAberto, setModalParcelasAberto] = useState(false);
  const [acordoIdParcelas, setAcordoIdParcelas] = useState(null);
  const [parcelas, setParcelas] = useState([]);
  const [parcelaSelecionada, setParcelaSelecionada] = useState(null);
  const [abaPagamentos, setAbaPagamentos] = useState("lista");

  const abrirModalParcelas = async (acordo_id) => {
    setAcordoIdParcelas(acordo_id);
    setAbaPagamentos("lista");
    setParcelaSelecionada(null);
  
    try {
      const resParcelas = await fetchModalParcelasByAcordoId(acordo_id);
  
      setParcelas(resParcelas);
      setModalParcelasAberto(true);
    } catch (err) {
      console.error("Erro ao abrir modal de parcelas", err);
    }
  };
  
  // Normalizador de texto (corrige erro de "norm is not defined")
  const norm = (text = "") =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // Filtro com normalização de texto
  const filtrados = useMemo(() => {
    const termo = norm(fBusca);
    return lista.filter((a) => {
      const parte = norm(a.parte_adversa?.nome);
      const contrato = norm(a.contrato?.numero);
      return termo ? parte.includes(termo) || contrato.includes(termo) : true;
    });
  }, [lista, fBusca]);



  const [rightMode, setRightMode] = useState("visualizarAtrib");
  const [atribs, setAtribs] = useState([]);
  const [colabs, setColabs] = useState([]);
  const [historicoAtribs, setHistoricoAtribs] = useState([]);
  const [formAtrib, setFormAtrib] = useState({
    atribuicao_id: "",
    responsavel_id: "",
    solucionador_id: "",
    prazo: "",
    observacao: ""
  });

  useEffect(() => {
    if (parcelas && parcelas.length > 0) {
      const proximaParcela = parcelas.find((p) =>
        ["pendente", "em_atraso"].includes(p.status)
      );
      if (proximaParcela) {
        setParcelaSelecionada(proximaParcela);
      }
    }
  }, [parcelas]);
  
  

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const acordosRes = await fetchAcordosUnificados();
        setLista(Array.isArray(acordosRes) ? acordosRes : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const normalizarParcelas = (parcelas = []) =>
    parcelas.map((p, idx) => ({
      id: p.id ?? idx,
      numero: p.numero ?? p.numero_parcela ?? "",
      valor: Number(p.valor ?? p.valor_parcela) || 0,
      data_vencimento: p.data_vencimento ?? p.vencimento ?? "",
      pago: p.pago ?? false,
      data_pagamento: p.data_pagamento ?? "",
      valor_pago: Number(p.valor_pago ?? 0) || 0,
      status: definirStatusParcela(p),
    }));

    // 🔧 Formata as parcelas para exibição no ModalLeftParcelas
    const formatarParcelas = (form) => {
      if (!form?.parcelas) return [];
      return form.parcelas.map((p, idx) => ({
        id: p.id ?? idx,
        numero_parcela: p.numero ?? p.numero_parcela ?? "",
        valor_parcela: Number(p.valor ?? p.valor_parcela) || 0,
        vencimento: p.data_vencimento ?? p.vencimento ?? "",
        pago: p.pago ?? false,
        data_pagamento: p.data_pagamento ?? "",
        valor_pago: Number(p.valor_pago ?? 0) || 0,
        status: definirStatusParcela(p),
      }));
    };

  
  
    const abrirDetalhar = async (acordo) => {
      setVisualizando(true);
      setEditando(false);
      setRightMode("visualizarAtrib");
    
      try {
        // 🔹 Busca dados do acordo e parcelas (igual Agenda.jsx)
        const dados = await fetchAcordoUnificadoById(acordo.acordo_id);
        const parcelas = await fetchModalParcelasByAcordoId(acordo.acordo_id);
    
        // 🔹 Monta o form completo antes de renderizar
        setForm({
          ...dados,
          parcelas: parcelas || [],
        });
    
        // 🔹 Prepara as atribuições e colaboradores
        const atribuicoes = await fetchAtribuicoesAcordo(acordo.acordo_id);
        const colaboradores = await fetchColaboradores();
    
        setAtribs(atribuicoes || []);
        setColabs(colaboradores);
        setHistoricoAtribs(dados.atribuicoes_evento || []);
        setAcordoSelecionado(dados);
        
        setAbaAtiva("acordo");
        setRightMode("visualizarAtrib");
        // 🔹 Agora sim abre o modal (igual ao Agenda)
        setModalAberto(true);
    
        console.log(`🟢 abrirDetalhar → Acordo ${acordo.acordo_id}, Parcelas: ${parcelas?.length}`);
      } catch (err) {
        console.error("Erro ao buscar acordo:", err);
      }
    };
    
    
    const abrirEditar = async (acordo) => {
      setVisualizando(false);
      setEditando(true);
      setRightMode("visualizarAtrib");
    
      try {
        // 🔹 Busca dados do acordo e parcelas
        const dados = await fetchAcordoUnificadoById(acordo.acordo_id);
        const parcelas = await fetchModalParcelasByAcordoId(acordo.acordo_id);
    
        // 🔹 Atualiza o form e o acordo selecionado
        setForm({
          ...dados,
          parcelas: parcelas || [],
        });
        setAcordoSelecionado(dados);
    
        // 🔹 Busca atribuições e colaboradores
        const atribuicoes = await fetchAtribuicoesAcordo(acordo.acordo_id);
        const colaboradores = await fetchColaboradores();
    
        setAtribs(atribuicoes || []);
        setColabs(colaboradores);
        setHistoricoAtribs(dados.atribuicoes_evento || []);
        
        setAbaAtiva("acordo");
        setRightMode("visualizarAtrib");
        // 🔹 Abre o modal
        setModalAberto(true);
    
        console.log(`🟢 abrirEditar → Acordo ${acordo.acordo_id}, Parcelas: ${parcelas?.length}`);
      } catch (err) {
        console.error("Erro ao buscar acordo:", err);
      }
    };




    const abrirParcelasDireto = async (acordo) => {
      setEditando(true);              // 👈 entra no modo de edição
      setVisualizando(false);
      setRightMode("visualizarParcelas");
      setAbaAtiva("parcelas");
    
      try {
        // 🔹 Busca dados completos do acordo
        const dados = await fetchAcordoUnificadoById(acordo.acordo_id);
        const parcelas = await fetchModalParcelasByAcordoId(acordo.acordo_id);
    
        // 🔹 Monta o form completo com as parcelas
        setForm({
          ...dados,
          parcelas: parcelas || [],
        });
    
        // 🔹 Carrega atribuições e colaboradores
        const atribuicoes = await fetchAtribuicoesAcordo(acordo.acordo_id);
        const colaboradores = await fetchColaboradores();
    
        setAtribs(atribuicoes || []);
        setColabs(colaboradores);
        setHistoricoAtribs(dados.atribuicoes_evento || []);
        setAcordoSelecionado(dados);
    
        // 🔹 Abre o modal grande
        setModalAberto(true);
    
        console.log(`🟢 abrirParcelasDireto (modo editar) → Acordo ${acordo.acordo_id}, Parcelas: ${parcelas?.length}`);
      } catch (err) {
        console.error("Erro ao abrir modal direto de parcelas:", err);
      }
    };
    
    
    
  

  
/*
  const salvar = async () => {
    if (!acordoSelecionado?.acordo_id) return;
    try {
      await updateAcordo(acordoSelecionado.acordo_id, {
        status: form.status,
        observacao: form.observacao
      });
  
      // 🔹 Busca novamente o acordo completo (com parcelas e atribuições)
      const dadosAtualizados = await fetchAcordoUnificadoById(acordoSelecionado.acordo_id);
  
      // 🔹 Atualiza o form e o acordo selecionado
      setAcordoSelecionado(dadosAtualizados);

      // 🔹 Garante que o form e as parcelas sejam atualizados em conjunto
      const novasParcelas = normalizarParcelas(dadosAtualizados.parcelas || []);

      setForm((prev) => ({
        ...prev,                        // 👈 preserva a referência anterior (evita reset visual)
        ...dadosAtualizados,            // 👈 atualiza apenas os campos alterados
        parcelas: [...novasParcelas],   // 👈 garante array novo, mas compatível com os modais
        parcelaSelecionada:
          novasParcelas.find(p => ["pendente", "em_atraso"].includes(p.status)) ||
          prev.parcelaSelecionada || null
      }));
      

  
      // 🔹 Atualiza a lista principal (mantém coerência)
      const atualizados = await fetchAcordosUnificados();
      setLista(atualizados);
  
      // 🔹 Mantém o modal aberto e já atualizado
      console.log(
        `🟢 salvar() → Acordo atualizado com ${dadosAtualizados.parcelas?.length || 0} parcelas`
      );
  
    } catch (err) {
      console.error("Erro ao atualizar acordo:", err);
    }
  };
 */ 

  const recarregarParcelas = async () => {
    if (!acordoIdParcelas) return;
    try {
      const novasParcelas = await fetchModalParcelasByAcordoId(acordoIdParcelas);
      setParcelas(
        novasParcelas.map((p) => ({
          ...p,
          valor: Number(p.valor) || 0,
          valor_pago: Number(p.valor_pago) || 0,
        }))
      );
    } catch (err) {
      console.error("Erro ao recarregar parcelas", err);
    }
  };
  
  
  
  const montarPayloadAtribuicao = () => {
    return {
      entity_type: "acordo",
      entity_id: acordoSelecionado.acordo_id,
      prazo: formAtrib.prazo,
      observacao: formAtrib.observacao,
      responsavel_id: formAtrib.responsavel_id,
      solucionador_id: formAtrib.solucionador_id,
    };
  };

  const handleSalvarPagamento = async () => {
    if (!dataPagamentoInput || !valorPagoInput) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
  
    try {
      await updatePagamentoAcordo(parcelaSelecionada.id, {
        data_pagamento: dataPagamentoInput,
        valor_pago: parseFloat(valorPagoInput.replace(",", "."))
      });
  
      setEditandoPagamento(false);
      setErro("");
      recarregarParcelas(); // Atualize sua tabela e painel após alteração
    } catch (err) {
      console.error(err);
      setErro("Erro ao salvar o pagamento.");
    }
  };

  


  const handleEditarAtribuicao = async () => {
    if (!formAtrib?.atribuicao_id) return;
  
    try {
      await updateAtribuicaoEvento(formAtrib.atribuicao_id, {
        prazo: formAtrib.prazo,
        observacao: formAtrib.observacao,
        responsavel_id: formAtrib.responsavel_id,
        solucionador_id: formAtrib.solucionador_id,
      });
  
      // ⏱️ Garante atualização no Mockoon antes do GET
      await new Promise((resolve) => setTimeout(resolve, 300));
  
      const dadosAtualizados = await fetchAcordoUnificadoById(acordoSelecionado.acordo_id);
  
      setForm({ ...dadosAtualizados });
      setHistoricoAtribs(dadosAtualizados.atribuicoes_evento || []);
      setRightMode("visualizarAtrib");
  
      console.log("🟢 Atribuição atualizada e Acordo recarregado!");
    } catch (err) {
      console.error("Erro ao editar atribuição:", err);
    }
  };
  
  
  
  

  const handleCriarAtribuicao = async () => {
    if (!acordoSelecionado?.acordo_id) return;
  
    try {
      await createAtribuicaoEvento({
        entity_type: "acordo",
        entity_id: acordoSelecionado.acordo_id,
        prazo: formAtrib.prazo,
        observacao: formAtrib.observacao,
        responsavel_id: formAtrib.responsavel_id,
        solucionador_id: formAtrib.solucionador_id,
      });
  
      // ⏱️ Garante que o Mockoon tenha processado o POST antes do GET
      await new Promise((resolve) => setTimeout(resolve, 300));
  
      // 🔄 Busca dados atualizados (igual Agenda.jsx)
      const dadosAtualizados = await fetchAcordoUnificadoById(acordoSelecionado.acordo_id);
  
      // ✅ Garante que o React veja o objeto como novo (re-render forçado)
      setForm({ ...dadosAtualizados });
      setHistoricoAtribs(dadosAtualizados.atribuicoes_evento || []);
      setRightMode("visualizarAtrib");
  
      // 🔹 Limpa o form da atribuição
      setFormAtrib({
        atribuicao_id: "",
        responsavel_id: "",
        solucionador_id: "",
        prazo: "",
        observacao: "",
      });
  
      console.log("✅ Atribuição criada e Acordo recarregado!");
    } catch (err) {
      console.error("Erro ao criar atribuição:", err);
    }
  };
  
  
  
  

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Acordos</h3>

      {/* Filtros */}
      <div className="usuarios-header">
        <div className="dashboard-filtro-group" style={{ position: "relative" }}>
          <Input
            className="dashboard-select dashboard-filtro-usuario-input"
            placeholder="Contrato ou Parte"
            value={fBusca}
            onChange={(e) => setFBusca(e.target.value)}
            title="Buscar por contrato ou parte"
          />
          {fBusca && (
            <button
              onClick={() => setFBusca("")}
              className="dashboard-filtro-clear"
            >
              <X size={14} />
            </button>
          )}
        </div>


      </div>

      {/* Tabela */}
      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela">
          <thead>
            <tr>
              <th className="acordo-col-contrato">Contrato</th>
              <th className="acordo-col-parte">Parte Adversa</th>
              <th className="acordo-col-telefone">Telefone</th>
              <th className="acordo-col-ultimo">Último Pgt</th>
              <th className="acordo-col-emaberto">Última em Aberto</th>
              <th className="acordo-col-parcela">Parcela</th>
              <th className="acordo-col-residual">Valor Residual</th>
              <th className="acordo-col-acoes">Ações</th>
            </tr>
          </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}>Carregando…</td></tr>
              ) : filtrados.length ? (
                filtrados.map((a) => (
                  <tr key={a.acordo_id}>
                    <td className="acordo-col-contrato">{a.contrato?.numero}</td>
                    <td className="acordo-col-parte">{a.parte_adversa?.nome}</td>
                    <td className="acordo-col-telefone">{a.telefone}</td>
                    <td className="acordo-col-ultimo">{a.ultima_parcela_paga?.data_pagamento || "—"}</td>
                    <td className="acordo-col-emaberto">{a.parcela_em_aberto?.data_vencimento || "—"}</td>
                    <td className="acordo-col-parcela">
                      {a.parcela_em_aberto?.numero && a.proposta?.numero_parcelas
                        ? `${a.parcela_em_aberto.numero}/${a.proposta.numero_parcelas}`
                        : "—"}
                    </td>
                    <td className="acordo-col-residual">
                      {a.valor_residual != null
                        ? a.valor_residual.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "—"}
                    </td>
                    <td className="acordo-col-acoes">
                      <div className="table-actions">
                        <Button variant="secondary" onClick={() => abrirEditar(a)}>✏️ Editar</Button>
                        <Button variant="outline" onClick={() => abrirDetalhar(a)}>👁️ Detalhar</Button>
                        <Button variant="default" onClick={() => abrirParcelasDireto(a)}>💰 Parcelas</Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8}>Nenhum acordo encontrado.</td></tr>
              )}
            </tbody>


        </table>
      </div>

      {/* Modal: a ser expandido nas próximas etapas */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogOverlay className="agenda-modal-overlay" />
          <DialogContent
            aria-describedby={undefined}
            className="agenda-modal-container"
            onOpenAutoFocus={(e) => {
              if (visualizando) {
                e.preventDefault();               // impede o foco automático do Radix
                requestAnimationFrame(() => {
                  document.activeElement?.blur(); // garante que nada fique focado
                });
              }
            }}
          >
            <DialogTitle style={{ display: "none" }}>Acordos</DialogTitle>

            

            <div className="agenda-modal-split">
         

            {/* LADO ESQUERDO */}
            <div className="agenda-modal-split-left">

                    {/* === Abas do Modal (mesmo padrão da Agenda.jsx) === */}
              <div className="agenda-modal-tabs">
                <Button
                  className="agenda-modal-tab-btn"
                  variant={abaAtiva === "acordo" ? "default" : "outline"}
                  onClick={() => {
                    setAbaAtiva("acordo");
                    setRightMode("visualizarAtrib");
                  }}
                >
                  🧾 Acordo
                </Button>
                <Button
                  className="agenda-modal-tab-btn"
                  variant={abaAtiva === "parcelas" ? "default" : "outline"}
                  onClick={() => {
                    setAbaAtiva("parcelas");
                    setRightMode("visualizarParcelas");
                  }}
                >
                  💰 Parcelas
                </Button>
              </div>




              
                {abaAtiva === "acordo" && (
                  <ModalLeftAcordo
                    form={form}
                    setForm={setForm}
                    salvarRef={salvarRef}
                    setEventoSelecionado={setAcordoSelecionado}
                    modo={editando ? "editar" : visualizando ? "visualizar" : "criar"}
                  />
                )}
                
                {abaAtiva === "parcelas" && (
                  <ModalLeftParcelas
                    parcelas={form?.parcelas || []}
                    parcelaSelecionada={form?.parcelaSelecionada}
                    setParcelaSelecionada={(p) =>
                      setForm((prev) => ({ ...prev, parcelaSelecionada: p }))
                    }
                    setRightMode={setRightMode}
                    modo={editando ? "editar" : visualizando ? "visualizar" : "criar"}
                  />
                
                )}

                
            </div>

            {/* LADO DIREITO */}
            <div className="agenda-modal-split-right">
              {abaAtiva === "parcelas" ? (
                <ModalRightParcelas
                  rightMode={rightMode}
                  setRightMode={setRightMode}
                  parcelaSelecionada={form?.parcelaSelecionada}
                  setParcelaSelecionada={(p) =>
                    setForm((prev) => ({ ...prev, parcelaSelecionada: p }))
                  }
                  modo={editando ? "editar" : visualizando ? "visualizar" : "criar"}
                />
              ) : (
                <ModalRightAtribuicoes
                  rightMode={rightMode}
                  setRightMode={setRightMode}
                  atribs={atribs}
                  colabs={colabs}
                  historicoAtribs={historicoAtribs}
                  formAtrib={formAtrib}
                  setFormAtrib={setFormAtrib}
                  handleCriarAtribuicao={handleCriarAtribuicao}
                  handleEditarAtribuicao={handleEditarAtribuicao}
                  form={form}
                  setForm={setForm}
                  entityType="acordo"
                  modo={editando ? "editar" : visualizando ? "visualizar" : "criar"}
                />
              )}

            </div>
          </div>
        </DialogContent>
      </Dialog>



    </div>
  );
}
