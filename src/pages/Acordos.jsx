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
  fetchAcordos,
  updateAcordo,
} from "@/services/ENDPOINTS_ServiceAcordos";

import {
  fetchModalParcelasByAcordoId,
} from "@/services/ENDPOINTS_ServiceParcelasAcordo";

import {
  fetchPagamentosAcordo,
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

import "@/styles/unified_styles.css";
import "@/styles/unified_refactored_styles.css";

const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

    function ModalLeftAcordo({ form, visualizando, setForm, salvar }) {
      return (
        <div className="acordo-modal-split-left">
          <DialogTitle className="acordo-modal-title">
            {visualizando ? "Detalhar Acordo" : "Editar Acordo"}
          </DialogTitle>
    
          <DialogDescription className="acordo-modal-description">
            Preencha os dados do acordo.
          </DialogDescription>
    
          {/* Scrollável */}
          <div className="acordo-modal-scroll">
            {/* Linha 1 - Contrato + Parte Adversa */}
            <div className="acordo-input-row">
              <div>
                <label className="acordo-label">Contrato</label>
                <input
                  className="acordo-modal-input"
                  value={form?.contrato?.numero || ""}
                  readOnly
                />
              </div>
              <div>
                <label className="acordo-label">Parte Adversa</label>
                <input
                  className="acordo-modal-input"
                  value={form?.parte_adversa?.nome || ""}
                  readOnly
                />
              </div>
            </div>
    
            {/* Linha 2 - Valores e número de parcelas */}
            <div className="acordo-input-row triple">
              <div>
                <label className="acordo-label">Valor do Acordo</label>
                <input
                  className="acordo-modal-input"
                  value={
                    form?.proposta?.valor_acordo?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }) || ""
                  }
                  readOnly
                />
              </div>
              <div>
                <label className="acordo-label">Valor da Parcela</label>
                <input
                  className="acordo-modal-input"
                  value={
                    form?.proposta?.valor_parcela?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }) || ""
                  }
                  readOnly
                />
              </div>
              <div>
                <label className="acordo-label">Número de Parcelas</label>
                <input
                  className="acordo-modal-input"
                  value={form?.proposta?.numero_parcelas || ""}
                  readOnly
                />
              </div>
            </div>
    
            {/* Linha 3 - Status + Data de Início */}
            <div className="acordo-input-row">
              <div>
                <label className="acordo-label">Status</label>
                <input
                  className="acordo-modal-input"
                  value={form?.status || ""}
                  readOnly
                />
              </div>
              <div>
                <label className="acordo-label">Data de Início</label>
                <input
                  type="date"
                  className="acordo-modal-input"
                  value={form?.data_vencimento || ""}
                  readOnly
                />
              </div>
            </div>
    
            {/* Observações */}
              <div>
                <label className="acordo-label">Observações</label>
                <textarea
                  className="acordo-textarea"
                  rows={2}
                  value={form?.observacao || ""}
                  onChange={(e) => {
                    if (!visualizando) {
                      setForm({ ...form, observacao: e.target.value });
                    }
                  }}
                  readOnly={visualizando}
                />
              </div>

          </div>
    
          {/* Rodapé fixo com botão apenas no modo editar */}
          {!visualizando && (
            <div className="acordo-botao-salvar-bottom">
              <Button
                variant="ghost"
                onClick={() => setForm({ ...form, status: "Cancelado" })}
              >
                Cancelar Acordo
              </Button>
              <Button onClick={salvar}>Salvar</Button>
            </div>
          )}
        </div>
      );
    }
    
    

    function ModalRightAtribuicoesAcordo({
      rightMode,
      setRightMode,
      atribs,
      colabs,
      historicoAtribs,
      formAtrib,
      setFormAtrib,
      handleCriarAtribuicao,
      handleEditarAtribuicao,
      visualizando,
    }) {
      return (
        <div className="acordo-modal-split-right">
          {/* Cabeçalho fixo (sempre visível) */}
          <div className="acordo-right-header">
            <h2 className="acordo-modal-title">
              {rightMode === "editarAtrib"
                ? "Atribuições do Acordo"
                : rightMode === "novaAtrib"
                ? "Atribuições do Acordo"
                : "Atribuições do Acordo"}
            </h2>
          </div>

      
          {/* Modo: visualizar atribuições */}
          {rightMode === "visualizarAtrib" && (
            <div className="acordo-right-wrapper">
              <div className="acordo-right-scroll">
                <ul className="processo-modal-right-lista" style={{ marginTop: "0.75rem" }}>
                  {(historicoAtribs || []).map((a, idx, arr) => {

                    const ultima = idx === arr.length - 1;
                    return (
                      <li
                        key={a.id}
                        className={`processo-modal-right-item processo-atr-item ${ultima ? "atual" : ""}`}
                        onClick={() => {
                          setFormAtrib({
                            atribuicao_id: a.atribuicao_id,
                            atribuicao_descricao: a.atribuicao_descricao,
                            status_atual: a.atribuicao_descricao,
                            data_inicial: a.data_inicial,
                            prazo: a.prazo ?? "",
                            responsavel_id: a?.responsavel?.id ?? "",  // ⬅️ Corrigido aqui
                            observacao: a?.observacao ?? "",
                          });
                          setRightMode("editarAtrib");
                        }}
                      >
                        <div className="processo-modal-right-texto">
                          <div className="atr-desc">{a.atribuicao_descricao}</div>
                          <div className="atr-lista">
                            <div className="atr-linha">
                              <span className="atr-label">Definida em</span>
                              <span className="atr-valor">
                                {a.data_inicial ? new Date(a.data_inicial).toLocaleDateString("pt-BR") : "—"}
                              </span>
                            </div>
                            <div className="atr-linha">
                              <span className="atr-label">Prazo</span>
                              <span className="atr-valor">
                                {a.prazo ? new Date(a.prazo).toLocaleDateString("pt-BR") : "—"}
                              </span>
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
              </div>
      
              {!visualizando && (
                <div className="acordo-modal-right-footer">
                  <Button onClick={() => setRightMode("novaAtrib")}>Próxima Atribuição</Button>
                </div>
              )}
            </div>
          )}
      
          {/* Modo: editar atribuição */}
          {rightMode === "editarAtrib" && (
            <div className="acordo-right-wrapper">
              <div className="acordo-right-content">
                <div className="acordo-atr-section">
                  <p className="acordo-atr-section-title">Atribuição Atual</p>
                  <div className="acordo-atr-linha">
                    <span className="acordo-atr-label">Status Atual</span>
                    <span className="acordo-atr-valor">{formAtrib.atribuicao_descricao || "—"}</span>
                  </div>
                  <div className="acordo-atr-linha">
                    <span className="acordo-atr-label">Definida em</span>
                    <span className="acordo-atr-valor">
                      {formAtrib.data_inicial
                        ? new Date(formAtrib.data_inicial).toLocaleDateString("pt-BR")
                        : "—"}
                    </span>
                  </div>
                  <div className="acordo-atr-linha">
                    <span className="acordo-atr-label">Tempo no Status</span>
                    <span className="acordo-atr-valor">
                      {formAtrib.data_inicial
                        ? `${Math.floor(
                            (new Date() - new Date(formAtrib.data_inicial)) / (1000 * 60 * 60 * 24)
                          )} dias`
                        : "—"}
                    </span>
                  </div>
                </div>
      
                <div className="acordo-input-wrapper">
                  <label className="acordo-label">Prazo</label>
                  <input
                    type="date"
                    className="acordo-modal-input"
                    value={formAtrib.prazo}
                    onChange={(e) => setFormAtrib({ ...formAtrib, prazo: e.target.value })}
                  />
                </div>
      
                <div className="acordo-input-wrapper">
                  <label className="acordo-label">Responsável</label>
                  <select
                    className="acordo-modal-input"
                    value={formAtrib.responsavel_id}
                    onChange={(e) => setFormAtrib({ ...formAtrib, responsavel_id: e.target.value })}
                  >
                    <option value="">Selecione…</option>
                    {colabs.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
      
                <div className="acordo-input-wrapper">
                  <label className="acordo-label">Observação</label>
                  <textarea
                    className="acordo-textarea"
                    rows={2}
                    value={formAtrib.observacao || ""}
                    onChange={(e) => setFormAtrib({ ...formAtrib, observacao: e.target.value })}
                  />
                </div>
              </div>
      
                <div className="acordo-modal-right-footer">
                  <Button variant="secondary" onClick={() => setRightMode("visualizarAtrib")}>Cancelar</Button>
                  <Button onClick={handleEditarAtribuicao}>Atualizar</Button>
                </div>
            </div>
          )}
      
          {/* Modo: nova atribuição */}
          {rightMode === "novaAtrib" && (
            <div className="acordo-right-wrapper">
              <div className="acordo-right-scroll">
                <div className="acordo-right-content">
                  <div className="acordo-atr-section-title">Atribuição Atual</div>
                  <div className="acordo-input-wrapper">
                    <label className="acordo-label">Solucionador</label>
                    <select
                      className="acordo-modal-input"
                      value={formAtrib.solucionador_id}
                      onChange={(e) => setFormAtrib({ ...formAtrib, solucionador_id: e.target.value })}
                    >
                      <option value="">Selecione…</option>
                      {colabs.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
      
                  <div className="acordo-atr-section-title" style={{ marginTop: "2rem" }}>Próxima Atribuição</div>
      
                  <div className="acordo-input-wrapper">
                    <label className="acordo-label">Status</label>
                    <select
                      className="acordo-modal-input"
                      value={formAtrib.proxima_atr_id}
                      onChange={(e) => setFormAtrib({ ...formAtrib, proxima_atr_id: e.target.value })}
                    >
                      <option value="">Selecione…</option>
                      {atribs.map((a) => (
                        <option key={a.id} value={a.id}>{a.descricao}</option>
                      ))}
                    </select>
                  </div>
      
                  <div className="acordo-input-wrapper">
                    <label className="acordo-label">Responsável</label>
                    <select
                      className="acordo-modal-input"
                      value={formAtrib.proximo_resp_id}
                      onChange={(e) => setFormAtrib({ ...formAtrib, proximo_resp_id: e.target.value })}
                    >
                      <option value="">Selecione…</option>
                      {colabs.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
      
                  <div className="acordo-input-wrapper">
                    <label className="acordo-label">Prazo</label>
                    <input
                      type="date"
                      className="acordo-modal-input"
                      value={formAtrib.prazo}
                      onChange={(e) => setFormAtrib({ ...formAtrib, prazo: e.target.value })}
                    />
                  </div>
      

                </div>
              </div>
      
              <div className="acordo-modal-right-footer">
                <Button variant="secondary" onClick={() => setRightMode("visualizarAtrib")}>Cancelar</Button>
                <Button onClick={handleCriarAtribuicao}>Salvar</Button>
              </div>
            </div>
          )}
        </div>
      );
      
      
      
    }
    
    
    function ModalLeftParcelas({ parcelas, parcelaSelecionada, setParcelaSelecionada }) {
      const linhas = 7;
      const colunas = Math.ceil(parcelas.length / linhas);
    
      // Distribui as parcelas em colunas verticais
      const colunasDeParcelas = Array.from({ length: colunas }, (_, colIdx) =>
        parcelas.slice(colIdx * linhas, colIdx * linhas + linhas)
      );
    
      return (
        <div className="acordo-modal-split-left">
          <DialogTitle className="acordo-modal-title">Parcelas do Acordo</DialogTitle>
    
          <DialogDescription className="acordo-modal-description">
            Clique em uma parcela para ver ou registrar um pagamento.
          </DialogDescription>
    
          <div className="acordo-modal-parcelas">
            {colunasDeParcelas.map((coluna, colIdx) => (
              <div className="acordo-parcela-coluna" key={colIdx}>
                {coluna.map((parcela, idx) => (
                  <div
                    key={idx}
                    className={`acordo-parcela-item ${
                      parcelaSelecionada?.numero_parcela === parcela.numero_parcela
                        ? "selecionada"
                        : ""
                    }`}
                    onClick={() => setParcelaSelecionada(parcela)}
                  >
                    <div className="acordo-parcela-linha">
                      <span className="parcela-check">
                        {parcela.status === "pago" && "✅"}
                        {parcela.status === "em_atraso" && (
                          <span style={{ color: "red", fontWeight: "bold" }}>❗</span>
                        )}
                        {parcela.status !== "pago" && parcela.status !== "em_atraso" && "•"}
                      </span>
                      <div className="parcela-duas-linhas">
                        <span className="parcela-data">
                          {parcela.vencimento
                            ? new Date(parcela.vencimento).toLocaleDateString("pt-BR")
                            : "—"}
                        </span>
                        <span className="parcela-valor">
                          {parcela.valor_parcela?.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }) ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    
    
    
    
    
    
    function ModalRightPagamentos({ pagamentos, parcelaSelecionada }) {
      // Soma os pagamentos da parcela selecionada
      const totalPago = pagamentos.reduce((soma, pg) => soma + pg.valor_pago, 0);
      const [editandoPagamento, setEditandoPagamento] = useState(false);
      const [dataPagamento, setDataPagamento] = useState("");
      const [valorPago, setValorPago] = useState("");

      const handleCancelar = () => {
        setEditandoPagamento(false);
        setDataPagamento("");
        setValorPago("");
      };

      const handleSalvar = async () => {
        if (!dataPagamento || !valorPago) {
          alert("Preencha todos os campos.");
          return;
        }

        try {
          await updatePagamentoAcordo(parcelaSelecionada.id, {
            data_pagamento: dataPagamento,
            valor_pago: parseFloat(valorPago),
          });
          handleCancelar(); // limpa e fecha formulário
          // Se tiver um recarregamento automático dos dados:
          // await recarregarPagamentos();
        } catch (error) {
          alert("Erro ao salvar pagamento.");
          console.error(error);
        }
      };

      // Última data de pagamento (se houver)
      const ultimaDataPagamento = pagamentos.length > 0
        ? new Date(pagamentos[pagamentos.length - 1].data_pagamento).toLocaleDateString("pt-BR")
        : "—";
    
      return (
        <div className="acordo-modal-split-right">
          {/* Cabeçalho */}
          <div className="acordo-right-header">
            <h2 className="acordo-modal-title">Pagamentos</h2>
          </div>
    
          {/* Conteúdo scrollável */}
          <div className="acordo-right-scroll">
            <div className="acordo-right-content">
              {parcelaSelecionada ? (
                <>
                  <div className="acordo-pag-detalhe">
                    <div className="acordo-atr-linha">
                      <span className="acordo-atr-label">Parcela</span>
                      <span className="acordo-atr-valor">{parcelaSelecionada.numero_parcela}</span>
                    </div>
                    <div className="acordo-atr-linha">
                      <span className="acordo-atr-label">Data do Vencimento</span>
                      <span className="acordo-atr-valor">
                        {new Date(parcelaSelecionada.vencimento).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="acordo-atr-linha">
                      <span className="acordo-atr-label">Data do Pagamento</span>
                      <span className="acordo-atr-valor">
                        {parcelaSelecionada.data_pagamento
                          ? new Date(parcelaSelecionada.data_pagamento).toLocaleDateString("pt-BR")
                          : "—"}
                      </span>
                    </div>
                    <div className="acordo-atr-linha">
                      <span className="acordo-atr-label">Valor</span>
                      <span className="acordo-atr-valor">
                        {parcelaSelecionada.valor_parcela?.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }) ?? "—"}
                      </span>
                    </div>
                    <div className="acordo-atr-linha">
                      <span className="acordo-atr-label">Valor Pago</span>
                      <span className="acordo-atr-valor">
                        {(parcelaSelecionada.valor_pago ?? 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="acordo-atr-linha">
                      <span className="acordo-atr-label">Status</span>
                      <span
                        className={`acordo-atr-valor status-${parcelaSelecionada.status}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: "bold",
                        }}
                      >
                        {parcelaSelecionada.status === "pago" && (
                          <>
                            <CheckCircle size={16} className="status-icon status-icon-pago" />
                            Pago
                          </>
                        )}
                        {parcelaSelecionada.status === "em_atraso" && (
                          <>
                            <AlertCircle size={16} className="status-icon status-icon-atraso" />
                            Em Atraso
                          </>
                        )}
                        {parcelaSelecionada.status === "pendente" && <>Pendente</>}
                      </span>
                    </div>
                      {editandoPagamento && (
                        <div className="pagamento-formulario">
                          <input
                            type="date"
                            value={dataPagamento}
                            onChange={(e) => setDataPagamento(e.target.value)}
                            className="acordo-modal-input"
                            placeholder="Data do Pagamento"
                          />
                          <input
                            type="number"
                            value={valorPago}
                            onChange={(e) => setValorPago(e.target.value)}
                            className="acordo-modal-input"
                            placeholder="Valor Pago"
                          />
                        </div>
                      )}

                  </div>

                  
                </>
              ) : (
                <p className="acordo-pag-empty">
                  Selecione uma parcela para visualizar os pagamentos.
                </p>
              )}

              
            </div>
          </div>
    
          {/* Rodapé com botão */}
            {parcelaSelecionada && (
              <div className="acordo-modal-right-footer">
                {!editandoPagamento ? (
                  <Button onClick={() => setEditandoPagamento(true)}>
                    Realizar Pagamento
                  </Button>
                ) : (
                  
                  <div className="acordo-formulario-botoes">
                  <Button onClick={handleCancelar} variant="ghost">Cancelar</Button>
                  <Button
                    onClick={handleSalvar}
                    disabled={!dataPagamento || !valorPago}
                  >
                    Salvar
                  </Button>

                </div>
                  
                )}
              </div>
            )}

        </div>
      );
    }
    
    
    
    
    
export default function Acordos() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [visualizando, setVisualizando] = useState(false);
  const [editando, setEditando] = useState(false);
  const salvarRef = useRef(null);

  const [fStatus, setFStatus] = useState("");
  const [fBusca, setFBusca] = useState("");

  const [acordoSelecionado, setAcordoSelecionado] = useState(null);
  const [form, setForm] = useState({});

  const [modalParcelasAberto, setModalParcelasAberto] = useState(false);
  const [acordoIdParcelas, setAcordoIdParcelas] = useState(null);
  const [parcelas, setParcelas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [parcelaSelecionada, setParcelaSelecionada] = useState(null);
  const [abaPagamentos, setAbaPagamentos] = useState("lista");

  const abrirModalParcelas = async (acordo_id) => {
    setAcordoIdParcelas(acordo_id);
    setAbaPagamentos("lista");
    setParcelaSelecionada(null);
  
    try {
      const resParcelas = await fetchModalParcelasByAcordoId(acordo_id);
      const resPagamentos = await fetchPagamentosAcordo(acordo_id);
  
      setParcelas(resParcelas);
      setPagamentos(resPagamentos);
      setModalParcelasAberto(true);
    } catch (err) {
      console.error("Erro ao abrir modal de parcelas", err);
    }
  };
  




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

  const filtrados = useMemo(() => {
    const termo = norm(fBusca);
    return lista.filter((a) => {
      const parte = norm(a.parte_adversa?.nome);
      const contrato = norm(a.contrato?.numero);
      return termo ? parte.includes(termo) || contrato.includes(termo) : true;
    });
  }, [lista, fBusca]);
  

  const abrirDetalhar = async (acordo) => {
    setVisualizando(true);
    setEditando(false);
    setRightMode("visualizarAtrib");
    try {
      const dados = await fetchAcordoUnificadoById(acordo.acordo_id);
      const atribuicoes = await fetchAtribuicoesAcordo(acordo.acordo_id);
      const colaboradores = await fetchColaboradores();

      setAcordoSelecionado(dados);
      setForm(dados);
      setAtribs(atribuicoes || []);
      setColabs(colaboradores);
      setModalAberto(true);

    } catch (err) {
      console.error("Erro ao buscar acordo:", err);
    }
  };

  const abrirEditar = async (acordo) => {
    setVisualizando(false);
    setEditando(true);
    setRightMode("visualizarAtrib");
    try {
      const dados = await fetchAcordoUnificadoById(acordo.acordo_id);
      const opcoesAtribuicoes = await fetchAtribuicoesAcordo(acordo.acordo_id);
      const colaboradores = await fetchColaboradores();
      
      setAcordoSelecionado(dados);
      setForm(dados);
      setHistoricoAtribs(dados.atribuicoes_evento || []); // ✅ lista de eventos reais
      setAtribs(opcoesAtribuicoes || []);                 // ✅ opções para o select
      setColabs(colaboradores);
      setModalAberto(true);
      
      setColabs(colaboradores);
      setModalAberto(true);

    } catch (err) {
      console.error("Erro ao buscar acordo:", err);
    }
  };

  const salvar = async () => {
    if (!acordoSelecionado?.acordo_id) return;
    try {
      await updateAcordo(acordoSelecionado.acordo_id, {
        status: form.status,
        observacao: form.observacao
      });
      const atualizados = await fetchAcordosUnificados();
      setLista(atualizados);
      setModalAberto(false);
    } catch (err) {
      console.error("Erro ao atualizar acordo:", err);
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
    try {
      const payload = montarPayloadAtribuicao(); // mesmo payload
      await updateAtribuicaoEvento(formAtrib.atribuicao_id, payload); // PUT com ID da atribuição
      const dadosAtualizados = await fetchAcordoUnificadoById(acordoSelecionado.acordo_id);
  
      setAcordoSelecionado(dadosAtualizados);
      setForm(dadosAtualizados); // ← atualiza os campos do lado esquerdo do modal
      setHistoricoAtribs(dadosAtualizados.atribuicoes_evento || []); // ← eventos reais
  
      setRightMode("visualizarAtrib"); // volta para modo de visualização
    } catch (error) {
      console.error("Erro ao editar atribuição:", error);
    }
  };
  
  
  

  const handleCriarAtribuicao = async () => {
    if (!acordoSelecionado?.acordo_id) return;
  
    try {
      await createAtribuicaoEvento({
        entity_type: "acordo",
        entity_id: acordoSelecionado.acordo_id,
        ...formAtrib,
      });
  
      const dadosAtualizados = await fetchAcordoUnificadoById(acordoSelecionado.acordo_id);
      setAcordoSelecionado(dadosAtualizados);
      setForm(dadosAtualizados); // ← garante que o lado esquerdo também reflita dados atualizados
      setHistoricoAtribs(dadosAtualizados.atribuicoes_evento || []);
      
      
      setRightMode("visualizarAtrib");
  
      setFormAtrib({
        atribuicao_id: "",
        responsavel_id: "",
        solucionador_id: "",
        prazo: "",
        observacao: "",
      });
  
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
                        <Button variant="default" onClick={() => abrirModalParcelas(a.acordo_id)}>🔄 Parcelas</Button>
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
        <DialogOverlay className="dialog-overlay" />
          <DialogContent className="acordo-modal-container">
            <DialogTitle>
              <VisuallyHidden>{visualizando ? "Detalhar Acordo" : "Editar Acordo"}</VisuallyHidden>
            </DialogTitle>
            <DialogDescription>
              <VisuallyHidden>Informações do acordo selecionado</VisuallyHidden>
            </DialogDescription>

            <div className="acordo-modal-split">
              {/* ESQUERDA */}
              <ModalLeftAcordo
                form={form}
                setForm={setForm}
                visualizando={visualizando}
                salvar={salvar}
              />


              {/* DIREITA */}
              <ModalRightAtribuicoesAcordo
                rightMode={rightMode}
                setRightMode={setRightMode}
                atribs={atribs}
                colabs={colabs}
                historicoAtribs={historicoAtribs}
                formAtrib={formAtrib}
                setFormAtrib={setFormAtrib}
                handleCriarAtribuicao={handleCriarAtribuicao}
                handleEditarAtribuicao={handleEditarAtribuicao}
                visualizando={visualizando}
              />

            </div>
          </DialogContent>
      </Dialog>

      <Dialog open={modalParcelasAberto} onOpenChange={setModalParcelasAberto}>
        <DialogOverlay className="dialog-overlay" />
        <DialogContent className="acordo-modal-container">
          


          <div className="acordo-modal-split">
            <ModalLeftParcelas
              parcelas={parcelas}
              parcelaSelecionada={parcelaSelecionada}
              setParcelaSelecionada={setParcelaSelecionada}
            />
            <ModalRightPagamentos
              pagamentos={pagamentos}
              parcelaSelecionada={parcelaSelecionada}
              abaPagamentos={abaPagamentos}
              setAbaPagamentos={setAbaPagamentos}
            />
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}
