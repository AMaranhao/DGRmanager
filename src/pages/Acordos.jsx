// src/pages/Acordos.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Check, X } from "lucide-react";
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
} from "@/services/ENDPOINTS_ServiceAcordoPagamento";

import {
  fetchAtribuicoesAcordo,
} from "@/services/ENDPOINTS_ServiceAtribuicoes";

import {
  createAtribuicaoEvento,
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
        <div className="acordos-modal-split-left">
          <p className="acordos-modal-title">Acordo</p>

          {/* Grid linha 1: Contrato + Parte Adversa */}
          <div className="acordos-grid acordos-grid-2">
            <div className="acordos-campo">
              <label className="acordos-label">Contrato</label>
              <input className="acordos-input" value={form?.contrato?.numero || ""} disabled />
            </div>
            <div className="acordos-campo">
              <label className="acordos-label">Parte Adversa</label>
              <input className="acordos-input" value={form?.parte_adversa?.nome || ""} disabled />
            </div>
          </div>

          {/* Grid linha 2: Valor do Acordo, Valor Parcela, Número de Parcelas */}
          <div className="acordos-grid acordos-grid-3">
            <div className="acordos-campo">
              <label className="acordos-label">Valor do Acordo</label>
              <input className="acordos-input" value={form?.proposta?.valor_acordo?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || ""} disabled />
            </div>
            <div className="acordos-campo">
              <label className="acordos-label">Valor da Parcela</label>
              <input className="acordos-input" value={form?.proposta?.valor_parcela?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || ""} disabled />
            </div>
            <div className="acordos-campo">
              <label className="acordos-label">Número de Parcelas</label>
              <input className="acordos-input" value={form?.proposta?.numero_parcelas || ""} disabled />
            </div>
          </div>

          {/* Grid linha 3: Status + Data de Início */}
          <div className="acordos-grid acordos-grid-2">
            <div className="acordos-campo">
              <label className="acordos-label">Status</label>
              <input className="acordos-input" value={form?.status || ""} disabled />
            </div>
            <div className="acordos-campo">
              <label className="acordos-label">Data de Início</label>
              <input className="acordos-input" value={form?.data_vencimento || ""} disabled />
            </div>
          </div>

          {/* Observações */}
          {visualizando === false && (
            <div className="acordos-grid">
              <div className="acordos-campo" style={{ gridColumn: "1 / -1" }}>
                <label className="acordos-label">Observações</label>
                <textarea
                  className="acordos-textarea"
                  value={form?.observacao || ""}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                />
              </div>
            </div>
          )}

          {!visualizando && (
            <div className="acordo-left-actions">
              <Button variant="default" onClick={salvar}>Salvar</Button>
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
      visualizando,
    }) {
      return (
        <div className="acordo-modal-right-panel">
    
          {rightMode === "visualizarAtrib" ? (
            <div className="acordo-right-wrapper">
              {/* Cabeçalho fixo */}
              <div className="acordo-right-header">
                <p className="dashboard-heading">Atribuições</p>
              </div>

              {/* Lista scrollável */}
              <div className="acordo-right-scroll">
                <ul className="processo-modal-right-lista" style={{ marginTop: "0.75rem" }}>
                  {(atribs || []).map((a, idx, arr) => {
                    const ultima = idx === arr.length - 1;
                    return (
                      <li
                        key={a.id}
                        className={`processo-modal-right-item processo-atr-item ${ultima ? "atual" : ""}`}
                        onClick={() => {
                          setFormAtrib({
                            atribuicao_id: a.atribuicao_id,
                            responsavel_id: a?.responsavel?.id ?? "",
                            solucionador_id: a?.solucionador?.id ?? "",
                            prazo: a?.prazo ?? "",
                            observacao: a?.observacao ?? "",
                          });
                          setRightMode("novaAtrib");
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

              {/* Rodapé fixo */}
              {!visualizando && (
                <div className="acordo-modal-right-footer">
                  <Button onClick={() => setRightMode("novaAtrib")}>
                    Próxima Atribuição
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="acordo-right-wrapper nova-atrib-wrapper">
              <div className="atrib-form">
                <div className="acordo-right-header">
                  <p className="dashboard-heading">Atribuições</p>
                </div>
                <div className="usuarios-modal-linha">
                  <label className="usuarios-label">Responsável</label>
                  <select
                    className="usuarios-modal-input"
                    value={formAtrib.responsavel_id}
                    onChange={(e) =>
                      setFormAtrib({ ...formAtrib, responsavel_id: e.target.value })
                    }
                  >
                    <option value="">Selecione</option>
                    {colabs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
    
                <div className="usuarios-modal-linha">
                  <label className="usuarios-label">Solucionador</label>
                  <select
                    className="usuarios-modal-input"
                    value={formAtrib.solucionador_id}
                    onChange={(e) =>
                      setFormAtrib({ ...formAtrib, solucionador_id: e.target.value })
                    }
                  >
                    <option value="">Selecione</option>
                    {colabs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
    
                <div className="usuarios-modal-linha">
                  <label className="usuarios-label">Prazo</label>
                  <input
                    type="date"
                    className="usuarios-modal-input"
                    value={formAtrib.prazo}
                    onChange={(e) =>
                      setFormAtrib({ ...formAtrib, prazo: e.target.value })
                    }
                  />
                </div>
    
                <div className="usuarios-modal-linha">
                  <label className="usuarios-label">Observações</label>
                  <textarea
                    className="usuarios-modal-textarea"
                    value={formAtrib.observacao}
                    onChange={(e) =>
                      setFormAtrib({ ...formAtrib, observacao: e.target.value })
                    }
                  />
                </div>
              </div>
    
              <div className="modal-split-footer">
                <Button 
                  variant="ghost" 
                  onClick={() => setRightMode("visualizarAtrib")}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCriarAtribuicao}
                > 
                  Salvar
                </Button>

              </div>
            </div>
          )}
        </div>
      );
    }
    
    function ModalLeftParcelas({ parcelas, parcelaSelecionada, setParcelaSelecionada }) {
      return (
        <div className="acordo-modal-split-left">
          <h5 className="dashboard-heading">Parcelas</h5>
          <ul className="acordo-parcela-lista">
            {parcelas.map((p, idx) => (
              <li
                key={idx}
                className={`acordo-parcela-item ${parcelaSelecionada?.numero_parcela === p.numero_parcela ? "selecionada" : ""}`}
                onClick={() => setParcelaSelecionada(p)}
              >
                <div className="acordo-parcela-linha">
                  <span>Parcela {p.numero}</span>
                  <span>{p.data_vencimento ? new Date(p.data_vencimento).toLocaleDateString("pt-BR") : "—"}</span>
                  <span>{p.valor_parcela?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—"}</span>
                  <span>{p.pago ? "✅" : "—"}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    function ModalRightPagamentos({ pagamentos, parcelaSelecionada, abaPagamentos, setAbaPagamentos }) {
      return (
        <div className="acordo-modal-split-right">
          <div className="acordo-pag-tabs">
            <button onClick={() => setAbaPagamentos("lista")}>Pagamentos</button>
            <button onClick={() => setAbaPagamentos("detalhe")} disabled={!parcelaSelecionada}>Detalhar</button>
            <button onClick={() => setAbaPagamentos("novo")} disabled={!parcelaSelecionada}>Novo Pagamento</button>
          </div>
    
          <div className="acordo-pag-conteudo">
            {abaPagamentos === "lista" && (
              <ul className="acordo-pag-lista">
                {pagamentos.map((pg, idx) => (
                  <li key={idx} className="acordo-pag-item">
                    <span>{new Date(pg.data_pagamento).toLocaleDateString("pt-BR")}</span>
                    <span>{pg.valor_pago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </li>
                ))}
              </ul>
            )}
    
            {abaPagamentos === "detalhe" && parcelaSelecionada && (
              <div className="acordo-pag-detalhe">
                <p><strong>Parcela:</strong> {parcelaSelecionada.numero_parcela}</p>
                <p><strong>Vencimento:</strong> {new Date(parcelaSelecionada.data_vencimento).toLocaleDateString("pt-BR")}</p>
                <p><strong>Valor:</strong> {parcelaSelecionada.valor_parcela?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—"}</p>
                <p><strong>Status:</strong> {parcelaSelecionada.pago ? "Pago" : "Em aberto"}</p>
              </div>
            )}


 
            {abaPagamentos === "novo" && parcelaSelecionada && (
              <div className="acordo-pag-novo-form">
                <p>Formulário de inserção de pagamento (a implementar)</p>
              </div>
            )}
          </div>
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
      setAtribs(dados.atribuicoes_evento || []);
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
      const atribuicoes = await fetchAtribuicoesAcordo(acordo.acordo_id);
      const colaboradores = await fetchColaboradores();

      setAcordoSelecionado(dados);
      setForm(dados);
      setAtribs(dados.atribuicoes_evento || []);
      setColabs(colaboradores);
      setModalAberto(true);

    } catch (err) {
      console.error("Erro ao buscar acordo:", err);
    }
  };

  const salvar = async () => {
    if (!acordoSelecionado?.acordo_id) return;
    try {
      await updateAcordo(acordoSelecionado.acordo_id, form);
      const atualizados = await fetchAcordosUnificados();
      setLista(atualizados);
      setModalAberto(false);
    } catch (err) {
      console.error("Erro ao atualizar acordo:", err);
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
  
      const novas = await fetchAtribuicoesAcordo(acordoSelecionado.acordo_id);
      setAtribs(novas);
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
                visualizando={visualizando}
              />

            </div>
          </DialogContent>
      </Dialog>

      <Dialog open={modalParcelasAberto} onOpenChange={setModalParcelasAberto}>
        <DialogOverlay className="dialog-overlay" />
        <DialogContent className="acordo-modal-container">
          
          <DialogTitle asChild>
            <h2 className="acordo-modal-titulo">Parcelas do Acordo</h2>
          </DialogTitle>
          
          <DialogDescription asChild>
            <p className="acordo-modal-subtitulo">Informações detalhadas das parcelas e seus pagamentos</p>
          </DialogDescription>

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
