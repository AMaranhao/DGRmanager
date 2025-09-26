// src/pages/Agenda.jsx
import React from "react";
import { 
  useEffect, 
  useState, 
  useMemo,
  useRef, 
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription
} from "@/components/ui/dialog";

import { useAuth } from "@/contexts/AuthContext";

import {
  fetchAtribuicoesAcordo,
  fetchAtribuicoesProcesso,
  fetchAtribuicoesContratos,
  } from "@/services/ENDPOINTS_ServiceAtribuicoes";
  
import { 
  fetchTiposEventoProcesso,
  fetchProcessoById  
} from "@/services/ENDPOINTS_ServiceProcessos";

import { 
  fetchContratoById 
} from "@/services/ENDPOINTS_ServiceContratos";

import { 
  fetchAcordoUnificadoById 
} from "@/services/ENDPOINTS_ServiceAcordos";

import { 
  getAgenda, 
  getAgendaByColaborador, 
  getAgendaDefinicao,
  updateAgendaDefinicao,
} from "@/services/ENDPOINTS_ServiceAgenda";

import { 
  fetchColaboradores 
} from "@/services/ENDPOINTS_ServiceColaboradores";


import "@/styles/unified_refactored_styles.css";


const LinhaInput = React.memo(({ label, children }) => (
  <div className="processo-input-wrapper">
    <label className="processo-label">{label}</label>
    {children}
  </div>
));

// 🔽 Função utilitária para ordenar eventos da agenda
function ordenarEventosAgenda(eventos) {
  return [...eventos].sort((a, b) => {
    // 1. Vermelhos de audiência (processo + audiencia)
    const isAudA = a.entity_type === "processo" && a.descricao?.toLowerCase().includes("audiencia");
    const isAudB = b.entity_type === "processo" && b.descricao?.toLowerCase().includes("audiencia");

    if (isAudA && !isAudB) return -1;
    if (!isAudA && isAudB) return 1;

    // Se ambos forem audiência, ordena pelo horário crescente
    if (isAudA && isAudB) {
      const hA = a.horario ? new Date(a.horario).getTime() : 0;
      const hB = b.horario ? new Date(b.horario).getTime() : 0;
      return hA - hB;
    }

    // 2. Ordem de status + tipo
    const prioridadeStatus = { com_hora: 1, pendente: 2, resolvido: 3 }; // vermelho → azul → verde
    const prioridadeTipo = { acordo: 1, contrato: 2, processo: 3 };

    const statusA = prioridadeStatus[a.status] || 99;
    const statusB = prioridadeStatus[b.status] || 99;

    if (statusA !== statusB) return statusA - statusB;

    const tipoA = prioridadeTipo[a.entity_type] || 99;
    const tipoB = prioridadeTipo[b.entity_type] || 99;

    return tipoA - tipoB;
  });
}


// Função utilitária para calcular os dias úteis da semana atual
function getDiasSemana(offset = 0) {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda ...
  const diffSegunda = hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
  const segunda = new Date(hoje.setDate(diffSegunda));

  // aplica deslocamento de semanas
  segunda.setDate(segunda.getDate() + offset * 7);

  return Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    return d;
  });
}

// src/pages/Agenda.jsx

function ModalLeftProcesso({ 
  form, 
  setForm, 
  visualizando, 
  salvar, 
  tiposEvento, 
  setEventoSelecionado 
}) {
  return (
    <div className="processo-form-wrapper">
      <div className="agenda-modal-left-content">
        {/* Linha 1 - CNJ e Contrato */}
        <h4 className="agenda-modal-section-title">Processo</h4>
        <div className="processo-input-row">
          <LinhaInput label="Número (CNJ)">
            <Input
              className="processo-modal-input"
              value={form.numero || ""}
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Contrato (nº ou ID)">
            <Input
              className="processo-modal-input"
              value={(form.contrato_numero || form.contrato_id || "").toString()}
              readOnly
            />
          </LinhaInput>
        </div>

        {/* Linha 2 - Datas */}
        <div className="processo-input-row triple">
          <LinhaInput label="Data de Distribuição">
            <Input
              type="date"
              className="processo-modal-input"
              value={form.data_distribuicao || ""}
              readOnly
            />
          </LinhaInput>
          <LinhaInput label="Publicação do Processo">
            <Input
              type="date"
              className="processo-modal-input"
              value={form.data_publicacao || ""}
              readOnly
            />
          </LinhaInput>
          <LinhaInput label="Comarca">
            <Input
              className="processo-modal-input"
              value={form.comarca || ""}
              readOnly
            />
          </LinhaInput>
        </div>

        {/* Etapa */}
        <h4 className="agenda-modal-section-title">Etapa do Processo</h4>
        <div className="processo-input-row">
          <LinhaInput label="Etapa">
            <select
              className="processo-modal-input"
              value={form.processo_evento?.tipo?.id || ""}
              onChange={(e) => {
                const selected = tiposEvento.find(te => te.id === Number(e.target.value));
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    tipo: selected,
                  },
                });
              }}
            >
              <option value="">Selecione</option>
              {tiposEvento.map((te) => (
                <option key={te.id} value={te.id}>
                  {te.tipo}
                </option>
              ))}
            </select>
          </LinhaInput>

          <LinhaInput label="Publicação da Etapa">
            <Input
              type="date"
              className="processo-modal-input"
              value={form.processo_evento?.data_publicacao || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    data_publicacao: e.target.value,
                  },
                })
              }
            />
          </LinhaInput>
        </div>

        {/* Prazos */}
        <div className="processo-input-row triple">
          <LinhaInput label="Prazo Jurídico (dias)">
            <Input
              type="number"
              className="processo-modal-input"
              value={form.processo_evento?.prazo_juridico?.toString() || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    prazo_juridico: e.target.value,
                  },
                })
              }
            />
          </LinhaInput>

          <LinhaInput label="Prazo Interno">
            <Input
              type="date"
              className="processo-modal-input"
              value={form.processo_evento?.prazo_interno || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    prazo_interno: e.target.value,
                  },
                })
              }
            />
          </LinhaInput>

          <LinhaInput label="Prazo Fatal">
            <Input
              type="date"
              className="processo-modal-input"
              value={form.processo_evento?.prazo_fatal || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    prazo_fatal: e.target.value,
                  },
                })
              }
            />
          </LinhaInput>
        </div>

        {/* Observação */}
        <LinhaInput label="Observação">
          <textarea
            className="processo-textarea"
            rows={2}
            value={form.processo_evento?.observacao || ""}
            onChange={(e) =>
              setForm({
                ...form,
                processo_evento: {
                  ...form.processo_evento,
                  observacao: e.target.value,
                },
              })
            }
          />
        </LinhaInput>
      </div>
      


      <div className="agenda-btn-modal-left-footer">
        <Button 
          variant="outline"
          onClick={() => {
            setEventoSelecionado(null); // volta para lista visível do dia (já está em eventosExtras)
          }}
        >
          Voltar para Lista
        </Button>

        <Button onClick={salvar}>
          Salvar
        </Button>
      </div>

    </div>
  );
}

function ModalLeftContrato({ 
  form, 
  setForm, 
  salvar, 
  visualizando, 
  editando, 
  salvarRef,
  setEventoSelecionado, 
}) {
  return (
    <div className="agenda-modal-left">
      <div className="agenda-modal-left-content">
        <h4 className="agenda-modal-section-title">Contrato</h4>
        <LinhaInput label="Número">
          <Input
            className="processo-modal-input"
            value={form.numero || ""}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            readOnly={visualizando}
          />
        </LinhaInput>

        <LinhaInput label="Valor">
          <Input
            className="processo-modal-input"
            value={
              form.valor !== undefined && form.valor !== null
                ? Number(form.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : ""
            }
            onChange={(e) => {
              // Remove tudo que não for número
              const raw = e.target.value.replace(/\D/g, "");
              // Converte para número
              const numericValue = raw ? parseFloat(raw) / 100 : "";
              setForm({ ...form, valor: numericValue });
            }}
            readOnly={visualizando}
          />
        </LinhaInput>

        <LinhaInput label="Lote">
          <Input
            className="processo-modal-input"
            value={form.lote || ""}
            onChange={(e) => setForm({ ...form, lote: e.target.value })}
            readOnly={visualizando}
          />
        </LinhaInput>

        <LinhaInput label="Observação">
          <Input
            className="processo-textarea"
            value={form.observacao || ""}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            readOnly={visualizando}
          />
        </LinhaInput>

      </div>
      


      <div className="agenda-btn-modal-left-footer">
        <Button 
          variant="outline"
          onClick={() => {
            setEventoSelecionado(null); // volta para lista
            setForm({});
          }}
        >
          Voltar para Lista
        </Button>

        <Button onClick={salvar}>
          Salvar
        </Button>
      </div>

    </div>
  );
}


function ModalLeftAcordo({ 
  form, 
  setForm, 
  salvar, 
  visualizando, 
  editando, 
  salvarRef, 
  setEventoSelecionado 
}) {
  return (
    <div className="agenda-modal-left">
      <div className="agenda-modal-left-content">
        <h4 className="agenda-modal-section-title">Acordo</h4>

        {/* Linha 1 - Contrato + Parte Adversa */}
        <div className="processo-input-row">
          <LinhaInput label="Contrato">
            <Input
              className="processo-modal-input"
              value={form?.contrato?.numero || ""}
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Parte Adversa">
            <Input
              className="processo-modal-input"
              value={form?.parte_adversa?.nome || ""}
              readOnly
            />
          </LinhaInput>
        </div>

        {/* Linha 2 - Valores + Número de Parcelas */}
        <div className="processo-input-row triple">
          <LinhaInput label="Valor do Acordo">
            <Input
              className="processo-modal-input"
              value={
                form?.proposta?.valor_acordo
                  ? Number(form.proposta.valor_acordo).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : ""
              }
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Valor da Parcela">
            <Input
              className="processo-modal-input"
              value={
                form?.proposta?.valor_parcela
                  ? Number(form.proposta.valor_parcela).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : ""
              }
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Número de Parcelas">
            <Input
              className="processo-modal-input"
              value={form?.proposta?.numero_parcelas || ""}
              readOnly
            />
          </LinhaInput>
        </div>

        {/* Linha 3 - Status + Data de Início */}
        <div className="processo-input-row">
          <LinhaInput label="Status">
            <Input
              className="processo-modal-input"
              value={form?.status || ""}
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Data de Início">
            <Input
              type="date"
              className="processo-modal-input"
              value={form?.data_vencimento || ""}
              readOnly
            />
          </LinhaInput>
        </div>

        {/* Observações */}
        <LinhaInput label="Observações">
          <textarea
            className="processo-textarea"
            rows={2}
            value={form?.observacao || ""}
            onChange={(e) => {
              if (!visualizando) {
                setForm({ ...form, observacao: e.target.value });
              }
            }}
            readOnly={visualizando}
          />
        </LinhaInput>
      </div>

      {/* Rodapé */}
      <div className="agenda-btn-modal-left-footer">
        <Button 
          variant="outline"
          onClick={() => {
            setEventoSelecionado(null);
            setForm({});
          }}
        >
          Voltar para Lista
        </Button>
        <Button onClick={salvar}>
          Salvar
        </Button>

        {!visualizando && (
          <>
            <Button
              variant="ghost"
              onClick={() => setForm({ ...form, status: "Cancelado" })}
            >
              Cancelar Acordo
            </Button>
            <Button onClick={salvar}>Salvar</Button>
          </>
        )}
      </div>
    </div>
  );
}




function ModalLeftAgendaLista({ eventos, handleSelecionarEvento }) {
  const eventosOrdenados = ordenarEventosAgenda(eventos);

  
  return (
    <div className="agenda-modal-left-scroll">
      <div className="agenda-modal-left-content">
        <div className="agenda-modal-colunas">
          {Array.from({ length: 3 }).map((_, colIdx) => (
            <div className="agenda-modal-coluna" key={colIdx}>
              {eventosOrdenados
                .slice(colIdx * 8, colIdx * 8 + 8) // ✅ agora usa os ordenados
                .map((evento, idx) => {
                  const isAudiencia =
                    evento.entity_type === "processo" &&
                    evento.descricao?.toLowerCase().includes("audiencia");

                  const horario =
                    isAudiencia && evento.horario
                      ? new Date(evento.horario).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : null;

                  return (
                    <div
                      key={idx}
                      className={`agenda-modal-item cursor-pointer ${
                        evento.status === "resolvido"
                          ? "agenda-modal-item-verde"
                          : evento.status === "com_hora"
                          ? "agenda-modal-item-vermelho"
                          : "agenda-modal-item-azul"
                      }`}
                      onClick={() => handleSelecionarEvento(evento)}
                    >
                      <span className="agenda-modal-item-texto">
                        {evento.entity_type} → {evento.descricao}
                        {horario ? ` → ${horario}` : ""}
                      </span>
                      <div>{evento.responsavel?.nome || "—"}</div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function ModalRightAtribuicoesAgenda({
  rightMode,
  setRightMode,
  atribs,
  colabs,
  historicoAtribs,
  formAtrib,
  setFormAtrib,
  handleCriarAtribuicao,
  handleEditarAtribuicao,
}) {
  return (
    <div className="agenda-modal-right">
      {/* Cabeçalho fixo */}
      <div className="agenda-modal-right-header">
        <h3 className="agenda-modal-right-title">Atribuições</h3>
      </div>

      {/* Modo: visualizar atribuições */}
      {rightMode === "visualizarAtrib" && (
        <div className="agenda-modal-right-wrapper">
          <div className="agenda-modal-right-scroll">
            <ul className="agenda-modal-right-lista">
              {(historicoAtribs || []).map((a, idx, arr) => {
                const ultima = idx === arr.length - 1;
                return (
                  <li
                    key={a.id}
                    className={`agenda-modal-right-item agenda-atr-item ${ultima ? "atual" : ""}`}
                    onClick={() => {
                      setFormAtrib({
                        atribuicao_id: a.atribuicao_id,
                        atribuicao_descricao: a.atribuicao_descricao,
                        status_atual: a.atribuicao_descricao,
                        data_inicial: a.data_inicial,
                        prazo: a.prazo ?? "",
                        responsavel_id: a?.responsavel?.id ?? "",
                        observacao: a?.observacao ?? "",
                      });
                      setRightMode("editarAtrib");
                    }}
                  >
                    <div className="agenda-modal-right-texto">
                      <div className="atr-desc">{a.atribuicao_descricao}</div>
                      <div className="atr-lista">
                        <div className="atr-linha">
                          <span className="atr-label">Definida em</span>
                          <span className="atr-valor">
                            {a.data_inicial
                              ? new Date(a.data_inicial).toLocaleDateString("pt-BR")
                              : "—"}
                          </span>
                        </div>
                        <div className="atr-linha">
                          <span className="atr-label">Prazo</span>
                          <span className="atr-valor">
                            {a.prazo
                              ? new Date(a.prazo).toLocaleDateString("pt-BR")
                              : "—"}
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

          <div className="agenda-btn-modal-right-footer">
            <Button onClick={() => setRightMode("novaAtrib")}>Próxima Atribuição</Button>
          </div>
        </div>
      )}

      {/* Modo: editar atribuição */}
      {rightMode === "editarAtrib" && (
        <div className="agenda-modal-right-wrapper">
          <div className="agenda-modal-right-content form">
            <h4 className="agenda-atr-section-title">Atribuição Atual</h4>

            <LinhaInput label="Status Atual">
              <Input
                className="agenda-modal-right-input"
                value={formAtrib.atribuicao_descricao || ""}
                readOnly
              />
            </LinhaInput>

            <LinhaInput label="Definida em">
              <Input
                type="date"
                className="agenda-modal-right-input"
                value={formAtrib.data_inicial || ""}
                readOnly
              />
            </LinhaInput>

            <LinhaInput label="Prazo">
              <Input
                type="date"
                className="agenda-modal-right-input"
                value={formAtrib.prazo || ""}
                onChange={(e) => setFormAtrib({ ...formAtrib, prazo: e.target.value })}
              />
            </LinhaInput>

            <LinhaInput label="Responsável">
              <select
                className="agenda-modal-right-input"
                value={formAtrib.responsavel_id}
                onChange={(e) =>
                  setFormAtrib({ ...formAtrib, responsavel_id: e.target.value })
                }
              >
                <option value="">Selecione…</option>
                {colabs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </LinhaInput>

            <LinhaInput label="Observação">
              <textarea
                className="agenda-textarea"
                rows={2}
                value={formAtrib.observacao || ""}
                onChange={(e) =>
                  setFormAtrib({ ...formAtrib, observacao: e.target.value })
                }
              />
            </LinhaInput>
          </div>

          <div className="agenda-btn-modal-right-footer">
            <Button variant="secondary" onClick={() => setRightMode("visualizarAtrib")}>
              Cancelar
            </Button>
            <Button onClick={handleEditarAtribuicao}>Atualizar</Button>
          </div>
        </div>
      )}

      {/* Modo: nova atribuição */}
      {rightMode === "novaAtrib" && (
        <div className="agenda-modal-right-wrapper">
          <div className="agenda-modal-right-scroll">
            <div className="agenda-modal-right-content form">
              <h4 className="agenda-atr-section-title">Nova Atribuição</h4>

              <LinhaInput label="Solucionador">
                <select
                  className="agenda-modal-right-input"
                  value={formAtrib.solucionador_id}
                  onChange={(e) =>
                    setFormAtrib({ ...formAtrib, solucionador_id: e.target.value })
                  }
                >
                  <option value="">Selecione…</option>
                  {colabs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </LinhaInput>

              <LinhaInput label="Status">
                <select
                  className="agenda-modal-right-input"
                  value={formAtrib.proxima_atr_id}
                  onChange={(e) =>
                    setFormAtrib({ ...formAtrib, proxima_atr_id: e.target.value })
                  }
                >
                  <option value="">Selecione…</option>
                  {atribs.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.descricao}
                    </option>
                  ))}
                </select>
              </LinhaInput>

              <LinhaInput label="Responsável">
                <select
                  className="agenda-modal-right-input"
                  value={formAtrib.proximo_resp_id}
                  onChange={(e) =>
                    setFormAtrib({ ...formAtrib, proximo_resp_id: e.target.value })
                  }
                >
                  <option value="">Selecione…</option>
                  {colabs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </LinhaInput>

              <LinhaInput label="Prazo">
                <Input
                  type="date"
                  className="agenda-modal-right-input"
                  value={formAtrib.prazo || ""}
                  onChange={(e) => setFormAtrib({ ...formAtrib, prazo: e.target.value })}
                />
              </LinhaInput>
            </div>
          </div>

          <div className="agenda-btn-modal-right-footer">
            <Button variant="secondary" onClick={() => setRightMode("visualizarAtrib")}>
              Cancelar
            </Button>
            <Button onClick={handleCriarAtribuicao}>Salvar</Button>
          </div>
        </div>
      )}
    </div>
  );
}



function AgendaModalAtribuicoes({ open, onClose, eventos, dataSelecionada, eventoInicial }) {
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [form, setForm] = useState({});
  const [visualizando, setVisualizando] = useState(true);
  const [editando, setEditando] = useState(false);
  const salvarRef = useRef(null);

  // ✅ Estados para tipos e atribuições
  const [tiposEvento, setTiposEvento] = useState([]);
  const [atribuicoesAcordo, setAtribuicoesAcordo] = useState([]);
  const [atribuicoesProcesso, setAtribuicoesProcesso] = useState([]);
  const [atribuicoesContratos, setAtribuicoesContratos] = useState([]);

  useEffect(() => {
    if (eventoInicial) {
      handleSelecionarEvento(eventoInicial);  // abre direto no evento clicado
    } else if (eventos.length === 1) {
      handleSelecionarEvento(eventos[0]);
    } else {
      setEventoSelecionado(null);
    }
  }, [eventos, eventoInicial]);
  

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const [tipos, atribAcordo, atribProc, atribContrato] = await Promise.all([
          fetchTiposEventoProcesso(),
          fetchAtribuicoesAcordo(),
          fetchAtribuicoesProcesso(),
          fetchAtribuicoesContratos(),
        ]);
        setTiposEvento(tipos);
        setAtribuicoesAcordo(atribAcordo);
        setAtribuicoesProcesso(atribProc);
        setAtribuicoesContratos(atribContrato);
      } catch (erro) {
        console.error("Erro ao carregar dados iniciais:", erro);
      }
    }
  
    carregarDadosIniciais();
  }, []);


  async function handleSelecionarEvento(evento) {
    setEventoSelecionado(evento);
  
    try {
      if (evento.entity_type === "processo") {
        const dados = await fetchProcessoById(evento.entity_id);
        setForm(dados);
        setVisualizando(false); // Abre em modo edição
        setEditando(true);
      }
  
      else if (evento.entity_type === "contrato") {
        const dados = await fetchContratoById(evento.entity_id);
        setForm(dados);
        setVisualizando(true); // Abre somente leitura
        setEditando(false);
      }
  
      else if (evento.entity_type === "acordo") {
        const dados = await fetchAcordoUnificadoById(evento.entity_id);
        setForm(dados);
        setVisualizando(true); // Abre somente leitura
        setEditando(false);
      }
  
      else {
        // Caso o tipo não seja reconhecido
        setForm({});
        setVisualizando(true);
        setEditando(false);
      }
    } catch (err) {
      console.error(`Erro ao carregar dados de ${evento.entity_type}:`, err);
      setForm({});
      setVisualizando(true);
      setEditando(false);
    }
  }
  

  async function salvar() {
    try {
      console.log("Salvando formulário:", form);
      // aqui você pode chamar um endpoint ex: updateProcesso(form.id, form)
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  }
  

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setEventoSelecionado(null); // volta para lista
          setForm({});
          setVisualizando(true);
          onClose(isOpen);
        }

      }}
    >
      <DialogOverlay className="agenda-modal-overlay" />
      <DialogContent
        className="agenda-modal-container"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="agenda-modal-split">
          {/* LADO ESQUERDO */}
          <div className="agenda-modal-split-left">
          <DialogTitle className="agenda-modal-title">
            Atribuições Dia - {" "}
            {dataSelecionada
            ? new Date(`${dataSelecionada}T00:00:00`).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              })
            : "—"}
          </DialogTitle>

            <DialogDescription className="agenda-modal-description">
              Lista de atribuições adicionais deste dia
            </DialogDescription>

              {eventoSelecionado?.entity_type === "processo" && (
                <ModalLeftProcesso
                  form={form}
                  setForm={setForm}
                  salvar={salvar}
                  tiposEvento={tiposEvento}
                  setEventoSelecionado={setEventoSelecionado}
                />
              )}

              {eventoSelecionado?.entity_type === "contrato" && (
                <ModalLeftContrato
                  form={form}
                  setForm={setForm}
                  salvar={salvar}
                  visualizando={visualizando}
                  editando={editando}
                  salvarRef={salvarRef}
                  setEventoSelecionado={setEventoSelecionado} 
                />
              )}

              {eventoSelecionado?.entity_type === "acordo" && (
                <ModalLeftAcordo
                  form={form}
                  setForm={setForm}
                  salvar={salvar}
                  visualizando={visualizando}
                  editando={editando}
                  salvarRef={salvarRef}
                  setEventoSelecionado={setEventoSelecionado}
                />
              )}

              {/* Fallback para quando não é processo nem contrato (ex: lista de eventos do dia) */}
              {!eventoSelecionado?.entity_type && (
                <ModalLeftAgendaLista
                  eventos={eventos}
                  handleSelecionarEvento={handleSelecionarEvento}
                />
              )}


          </div>

          {/* LADO DIREITO */}
          <div className="agenda-modal-split-right">
            {eventoSelecionado?.entity_type ? (
              <ModalRightAtribuicoesAgenda
                rightMode="visualizarAtrib"
                setRightMode={() => {}} // depois você pode ligar ao state
                atribs={[
                  ...atribuicoesProcesso,
                  ...atribuicoesContratos,
                  ...atribuicoesAcordo,
                ]}
                colabs={[]} // pode carregar com fetchColaboradores se quiser
                historicoAtribs={form.atribuicoes_evento || []} // ✅ pega do JSON do form
                formAtrib={{}}
                setFormAtrib={() => {}}
                handleCriarAtribuicao={() => {}}
                handleEditarAtribuicao={() => {}}
              />
            ) : (
              <div className="agenda-modal-right-content">
                <p className="agenda-modal-atr-label">
                  Clique em uma atribuição à esquerda para detalhar aqui.
                </p>
              </div>
            )}
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
}






function AgendaDesignacao() {
  const [definicoes, setDefinicoes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [edicoes, setEdicoes] = useState({}); 
  // { [idItem]: { responsavel_id, data_definida_atribuicao_evento } }

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resDefinicao, resColabs] = await Promise.all([
          getAgendaDefinicao(),
          fetchColaboradores()
        ]);
  
        // 🔽 ordena pelo campo prazo (crescente)
        const definicoesOrdenadas = [...resDefinicao].sort((a, b) => {
          const dataA = a.prazo ? new Date(a.prazo).getTime() : Infinity;
          const dataB = b.prazo ? new Date(b.prazo).getTime() : Infinity;
          return dataA - dataB;
        });
  
        setDefinicoes(definicoesOrdenadas);
        setColaboradores(resColabs);
  
        // inicializa edições com valores atuais
        const inicial = {};
        definicoesOrdenadas.forEach((item) => {
          inicial[item.id] = {
            responsavel_id: item.responsavel?.id || "",
            data_definida_atribuicao_evento: item.data_definida_atribuicao_evento || "",
          };
        });
        setEdicoes(inicial);
      } catch (err) {
        console.error("Erro ao carregar dados da designação:", err);
      }
    }
  
    carregarDados();
  }, []);
  

  const handleChange = (id, campo, valor) => {
    setEdicoes((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));
  };

  const handleSalvar = async (item) => {
    try {
      const dados = edicoes[item.id];
      await updateAgendaDefinicao(item.id, {
        responsavel_id: Number(dados.responsavel_id),
        data_definida_atribuicao_evento: dados.data_definida_atribuicao_evento,
      });
    } catch (err) {
    }
  };

  return (
    <div className="agenda-section">
      <div className="agenda-tabela-wrapper">
        <table className="agenda-tabela">
          <thead>
            <tr>
              <th className="agenda-col-tipo">Tipo</th>
              <th className="agenda-col-descricao">Descrição</th>
              <th className="agenda-col-prazo">Prazo</th>
              <th className="agenda-col-responsavel">Responsável</th>
              <th className="agenda-col-numero">Número</th>
              <th className="agenda-col-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {definicoes.length === 0 ? (
              <tr>
                <td colSpan="6" className="agenda-col-vazio">
                  Nenhuma definição encontrada
                </td>
              </tr>
            ) : (
              definicoes.map((item) => (
                <tr key={item.id}>
                  <td>{item.entity_type}</td>
                  <td>{item.descricao}</td>
                  <td>{item.prazo ? new Date(item.prazo).toLocaleDateString("pt-BR") : "—"}</td>
                  <td>{item.responsavel?.nome || "—"}</td>
                  <td>{item.entidade?.numero}</td>
                  <td>
                    <div className="agenda-acoes-wrapper">
                      <select
                        className="agenda-input agenda-select"
                        value={edicoes[item.id]?.responsavel_id || ""}
                        onChange={(e) =>
                          handleChange(item.id, "responsavel_id", e.target.value)
                        }
                      >
                        <option value="">Responsável</option>
                        {colaboradores.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome}
                          </option>
                        ))}
                      </select>

                      <input
                        type="date"
                        className="agenda-input agenda-date"
                        value={
                          edicoes[item.id]?.data_definida_atribuicao_evento || ""
                        }
                        onChange={(e) =>
                          handleChange(
                            item.id,
                            "data_definida_atribuicao_evento",
                            e.target.value
                          )
                        }
                      />

                      <Button
                        size="sm"
                        className="tabela-acao-botao"
                        onClick={() => handleSalvar(item)}
                      >
                        Salvar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}




function AgendaPessoal({ semanaOffset, setSemanaOffset }) {
  const diasSemana = getDiasSemana(semanaOffset);
  const [compromissos, setCompromissos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [eventosExtras, setEventosExtras] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [eventoInicial, setEventoInicial] = useState(null);



  const { user } = useAuth();

  useEffect(() => {
    async function carregarDados() {
      try {
        if (!user?.id) return;
        const resAgenda = await getAgendaByColaborador(user.id);
        setCompromissos(resAgenda);
      } catch (err) {
        console.error("Erro ao carregar agenda pessoal:", err);
      }
    }

    carregarDados();
  }, [user]);

  const compromissosPorDia = useMemo(() => {
    const mapa = {};
    diasSemana.forEach((dia) => {
      const chave = dia.toLocaleDateString("sv-SE"); // formato YYYY-MM-DD
      mapa[chave] = [];
    });

    compromissos.forEach((evento) => {
      const data = evento.data_definida;
      if (mapa[data]) {
        mapa[data].push(evento);
      }
    });

    return mapa;
  }, [diasSemana, compromissos]);
  
  
  

  return (
    <div className="agenda-section">
      <div className="agenda-grid-wrapper">
        <button
          className="agenda-arrow left"
          onClick={() => setSemanaOffset(semanaOffset - 1)}
        >
          ⬅️
        </button>

        <div className="agenda-grid">
          {diasSemana.map((dia, idx) => (
            <div key={idx} className="agenda-card">
              <h3 className="agenda-card-title">
                {dia.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </h3>
                <ul className="agenda-lista">
                  {(() => {
                    const chave = dia.toLocaleDateString("sv-SE");

                    let eventos = compromissosPorDia[chave] || [];

                    if (eventos.length === 0) {
                      return (
                        <li className="agenda-item agenda-item-azul">
                          <span className="agenda-item-texto">🔵 Nenhum compromisso</span>
                        </li>
                      );
                    }

                    // ---- ORDENAR EVENTOS ----
                    eventos = ordenarEventosAgenda(eventos);

                    // ---- LIMITAR EXIBIÇÃO ----
                    const temMais = eventos.length > 8;
                    const eventosVisiveis = temMais ? eventos.slice(0, 7) : eventos;

                    return (
                      <>
                        {eventosVisiveis.map((evento, i) => {
                          let corClasse = "";
                          switch (evento.status) {
                            case "com_hora":
                              corClasse = "agenda-item-vermelho";
                              break;
                            case "resolvido":
                              corClasse = "agenda-item-verde";
                              break;
                            case "pendente":
                            default:
                              corClasse = "agenda-item-azul";
                              break;
                          }
                          

                          const horario =
                            evento.entity_type === "processo" &&
                            evento.descricao?.toLowerCase().includes("audiencia") &&
                            evento.horario
                              ? new Date(evento.horario).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : null;

                          return (
                            <li
                              key={i}
                              className={`agenda-item ${corClasse} cursor-pointer`}
                              onClick={() => {
                                const chave = evento.data_definida.split("T")[0];
                                const listaVisivel = compromissosPorDia[chave] || [];
                              
                                setEventosExtras(listaVisivel);
                                setDataSelecionada(chave);
                                setEventoInicial(evento);   // ✅ passa o evento clicado para o modal
                                setMostrarModal(true);
                              }}
                              
                              
                            >
                              <span className="agenda-item-texto">
                                {evento.entity_type} → {evento.descricao}
                                {horario ? ` ${horario}` : ""}
                              </span>
                              <div>{evento.responsavel?.nome || "—"}</div>
                            </li>
                          );
                        })}

                        {temMais && (
                          <li
                          className="agenda-item agenda-item-azul cursor-pointer"
                          onClick={() => {
                            setEventosExtras(eventos);
                            if (eventos.length > 0) {
                              setDataSelecionada(eventos[0].data_definida); // usa a data do primeiro evento
                            }
                            setMostrarModal(true);
                          }}
                          
                        >
                          <span className="agenda-item-texto">+ Mais Atribuições</span>
                        </li>
                        
                        )}
                      </>
                    );
                  })()}

                </ul>

            </div>
          ))}
        </div>

        <button
          className="agenda-arrow right"
          onClick={() => setSemanaOffset(semanaOffset + 1)}
        >
          ➡️
        </button>
      </div>
      <AgendaModalAtribuicoes
        open={mostrarModal}
        onClose={() => setMostrarModal(false)}
        eventos={eventosExtras}
        dataSelecionada={dataSelecionada}
        eventoInicial={eventoInicial}
      />


    </div>
  );
}






function AgendaEquipe({ semanaOffset, setSemanaOffset, responsavelFiltro }) {
  const diasSemana = getDiasSemana(semanaOffset);
  const [compromissos, setCompromissos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [eventosExtras, setEventosExtras] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [eventoInicial, setEventoInicial] = useState(null);



  useEffect(() => {
    async function carregarColaboradores() {
      try {
        const res = await fetchColaboradores();
        setColaboradores(res);
      } catch (err) {
        console.error("Erro ao carregar colaboradores:", err);
      }
    }
    carregarColaboradores();
  }, []);

  useEffect(() => {
    async function carregarDados() {
      try {
        const resAgenda = await getAgenda();
        setCompromissos(resAgenda);
      } catch (err) {
        console.error("Erro ao carregar agenda da equipe:", err);
      }
    }
    carregarDados();
  }, []);

  const compromissosPorDia = useMemo(() => {
    const mapa = {};
    diasSemana.forEach((dia) => {
      const chave = dia.toLocaleDateString("sv-SE");
      mapa[chave] = [];
    });

    compromissos
      .filter((evento) => {
        if (!responsavelFiltro) return true; // sem filtro → todos
        return String(evento.responsavel?.id) === String(responsavelFiltro);
      })
      .forEach((evento) => {
        const data = evento.data_definida;
        if (mapa[data]) {
          mapa[data].push(evento);
        }
      });

    return mapa;
  }, [diasSemana, compromissos, responsavelFiltro]);

  return (
    <div className="agenda-section">
      <div className="agenda-grid-wrapper">
        <button
          className="agenda-arrow left"
          onClick={() => setSemanaOffset(semanaOffset - 1)}
        >
          ⬅️
        </button>

        <div className="agenda-grid">
          {diasSemana.slice(0, 7).map((dia, idx) => (
            <div key={idx} className="agenda-card">
              <h3 className="agenda-card-title">
                {dia.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </h3>
                <ul className="agenda-lista">
                  {(() => {
                    const chave = dia.toLocaleDateString("sv-SE");
                    let eventos = compromissosPorDia[chave] || [];

                    if (eventos.length === 0) {
                      return (
                        <li className="agenda-item agenda-item-azul">
                          <span className="agenda-item-texto">🔵 Nenhum compromisso</span>
                        </li>
                      );
                    }

                    // ---- ORDENAR EVENTOS ----
                    eventos = ordenarEventosAgenda(eventos);
                    

                    // ---- LIMITAR EXIBIÇÃO ----
                    const temMais = eventos.length > 8;
                    const eventosVisiveis = temMais ? eventos.slice(0, 7) : eventos;

                    return (
                      <>
                        {eventosVisiveis.map((evento, i) => {
                          let corClasse = "";
                          switch (evento.status) {
                            case "com_hora":
                              corClasse = "agenda-item-vermelho";
                              break;
                            case "resolvido":
                              corClasse = "agenda-item-verde";
                              break;
                            case "pendente":
                            default:
                              corClasse = "agenda-item-azul";
                              break;
                          }
                          

                          const horario =
                            evento.entity_type === "processo" &&
                            evento.descricao?.toLowerCase().includes("audiencia") &&
                            evento.horario
                              ? new Date(evento.horario).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : null;

                          return (
                            <li
                              key={i}
                              className={`agenda-item ${corClasse} cursor-pointer`}
                              onClick={() => {
                                const chave = evento.data_definida.split("T")[0];
                                const listaVisivel = compromissosPorDia[chave] || [];
                              
                                setEventosExtras(listaVisivel);
                                setDataSelecionada(chave);
                                setEventoInicial(evento);   // ✅ passa o evento clicado para o modal
                                setMostrarModal(true);
                              }}
                              
                            >
                              <span className="agenda-item-texto">
                                {evento.entity_type} → {evento.descricao}
                                {horario ? ` ${horario}` : ""}
                              </span>
                              <div>{evento.responsavel?.nome || "—"}</div>
                            </li>

                          );
                        })}

                        {temMais && (
                          <li
                            className="agenda-item agenda-item-azul cursor-pointer"
                            onClick={() => {
                              setEventosExtras(eventos);
                              if (eventos.length > 0) {
                                setDataSelecionada(eventos[0].data_definida); // usa a data do primeiro evento
                              }
                              setMostrarModal(true);
                            }}
                            
                          >
                            <span className="agenda-item-texto">+ Mais Atribuições</span>
                          </li>
                        )}
                      </>
                    );
                  })()}

                </ul>

            </div>
          ))}

          {/* Card extra */}
          {diasSemana.length > 7 && (
            <div
              className="agenda-card agenda-card-extra"
              onClick={() => {
                const extras = diasSemana.slice(7).map((dia) => {
                  const chave = dia.toLocaleDateString("sv-SE");
                  return compromissosPorDia[chave] || [];
                }).flat();
              
                setEventosExtras(extras);
              
                if (extras.length > 0) {
                  setDataSelecionada(extras[0].data_definida);
                }
              
                setMostrarModal(true);
              }}
              
            >
              <h3 className="agenda-card-title">+ Mais</h3>
              <p className="agenda-item-texto">Clique para ver atribuições extras</p>
            </div>
          )}
        </div>

        <button
          className="agenda-arrow right"
          onClick={() => setSemanaOffset(semanaOffset + 1)}
        >
          ➡️
        </button>
      </div>
      <AgendaModalAtribuicoes
        open={mostrarModal}
        onClose={() => setMostrarModal(false)}
        eventos={eventosExtras}
        dataSelecionada={dataSelecionada}
        eventoInicial={eventoInicial}
      />
    </div>
  );
}





// src/pages/Agenda.jsx
export default function Agenda() {
  const [abaAtiva, setAbaAtiva] = useState("pessoal");
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [colaboradores, setColaboradores] = useState([]);
  const [responsavelFiltro, setResponsavelFiltro] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    async function carregarColaboradores() {
      try {
        const res = await fetchColaboradores();
        setColaboradores(res);
      } catch (err) {
        console.error("Erro ao carregar colaboradores:", err);
      }
    }
    carregarColaboradores();
  }, []);

  const tituloAba = {
    pessoal: "👤 Minha Agenda",
    equipe: "👥 Agenda da Equipe",
    designacao: "📋 Designação de Atribuições",
  };

  return (
    <div className="agenda-main-wrapper">
      <h3 className="agenda-heading">{tituloAba[abaAtiva]}</h3>

      {/* Cabeçalho com tabs e filtro */}
      <div className="agenda-main-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Botões de navegação */}
        <div className="agenda-tabs">
          <Button
            variant={abaAtiva === "pessoal" ? "default" : "outline"}
            className="agenda-tabs-btn"
            onClick={() => setAbaAtiva("pessoal")}
          >
            👤 Minha Agenda
          </Button>
          <Button
            variant={abaAtiva === "equipe" ? "default" : "outline"}
            className="agenda-tabs-btn"
            onClick={() => setAbaAtiva("equipe")}
          >
            👥 Agenda da Equipe
          </Button>
          <Button
            variant={abaAtiva === "designacao" ? "default" : "outline"}
            className="agenda-tabs-btn"
            onClick={() => setAbaAtiva("designacao")}
          >
            📋 Designação
          </Button>
          {/* Filtro aparece só na aba equipe */}
          {abaAtiva === "equipe" && (
            <select
              value={responsavelFiltro}
              onChange={(e) => setResponsavelFiltro(e.target.value)}
              className="agenda-select"
            >
              <option value="">Todos os responsáveis</option>
              {colaboradores.map((colab) => (
                <option key={colab.id} value={colab.id}>
                  {colab.nome}
                </option>
              ))}
            </select>
          )}
        </div>


      </div>

      {/* Renderização condicional */}
      {abaAtiva === "pessoal" && (
        <AgendaPessoal
          semanaOffset={semanaOffset}
          setSemanaOffset={setSemanaOffset}
        />
      )}
      {abaAtiva === "equipe" && (
        <AgendaEquipe
          semanaOffset={semanaOffset}
          setSemanaOffset={setSemanaOffset}
          responsavelFiltro={responsavelFiltro} // passa filtro como prop
        />
      )}
      {abaAtiva === "designacao" && <AgendaDesignacao />}
    </div>
  );
}


