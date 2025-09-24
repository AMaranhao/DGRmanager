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
  fetchAcordoById 
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



function ModalLeftAgendaLista({ eventos, handleSelecionarEvento }) {
  return (
    <div className="agenda-modal-left-scroll">
      <div className="agenda-modal-left-content">
        <div className="agenda-modal-colunas">
          {Array.from({ length: 3 }).map((_, colIdx) => (
            <div className="agenda-modal-coluna" key={colIdx}>
              {eventos
                .slice(colIdx * 8, colIdx * 8 + 8)
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



function AgendaModalAtribuicoes({ open, onClose, eventos, dataSelecionada }) {
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
        const dados = await fetchAcordoById(evento.entity_id);
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
              ? new Date(dataSelecionada).toLocaleDateString("pt-BR", {
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
            <div className="agenda-modal-right-header">
              <h2 className="agenda-modal-title">Detalhes</h2>
            </div>

            <div className="agenda-modal-right-content">
              {eventoSelecionado ? (
                <div>
                  <p><b>Tipo:</b> {eventoSelecionado.entity_type}</p>
                  <p><b>Descrição:</b> {eventoSelecionado.descricao}</p>
                  <p><b>Responsável:</b> {eventoSelecionado.responsavel?.nome || "—"}</p>
                  <p><b>Data Definida:</b> {eventoSelecionado.data_definida}</p>
                  {eventoSelecionado.horario && (
                    <p><b>Horário:</b> {new Date(eventoSelecionado.horario).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"})}</p>
                  )}
                  <p><b>Status:</b> {eventoSelecionado.status}</p>
                  {eventoSelecionado.entidade?.numero && (
                    <p><b>Número:</b> {eventoSelecionado.entidade.numero}</p>
                  )}
                </div>
              ) : (
                <p className="agenda-modal-atr-label">
                  Clique em uma atribuição à esquerda para detalhar aqui.
                </p>
              )}
            </div>

            <div className="agenda-modal-right-footer">

            </div>
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
      // força local YYYY-MM-DD sem UTC
      const chave = dia.toLocaleDateString("sv-SE");  // ✅ 2025-09-17
      mapa[chave] = [];
    });
  
    compromissos.forEach((evento) => {
      // garante que o campo já vem como string pura
      const data = evento.data_definida;  // ✅ já está em "2025-09-17"
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
                    eventos = [...eventos].sort((a, b) => {
                      const isAudA =
                        a.entity_type === "processo" &&
                        a.descricao?.toLowerCase().includes("audiencia");
                      const isAudB =
                        b.entity_type === "processo" &&
                        b.descricao?.toLowerCase().includes("audiencia");

                      if (isAudA && !isAudB) return -1;
                      if (!isAudA && isAudB) return 1;

                      if (isAudA && isAudB) {
                        const hA = a.horario ? new Date(a.horario).getTime() : 0;
                        const hB = b.horario ? new Date(b.horario).getTime() : 0;
                        return hA - hB;
                      }

                      if (a.status === "pendente" && b.status !== "pendente") return -1;
                      if (b.status === "pendente" && a.status !== "pendente") return 1;

                      if (a.status === "resolvido" && b.status !== "resolvido") return 1;
                      if (b.status === "resolvido" && a.status !== "resolvido") return -1;

                      return 0;
                    });

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
                            <li key={i} className={`agenda-item ${corClasse}`}>
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
      // força local YYYY-MM-DD sem UTC
      const chave = dia.toLocaleDateString("sv-SE");  // ✅ 2025-09-17
      mapa[chave] = [];
    });
  
    compromissos.forEach((evento) => {
      // garante que o campo já vem como string pura
      const data = evento.data_definida;  // ✅ já está em "2025-09-17"
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
                    eventos = [...eventos].sort((a, b) => {
                      const isAudA =
                        a.entity_type === "processo" &&
                        a.descricao?.toLowerCase().includes("audiencia");
                      const isAudB =
                        b.entity_type === "processo" &&
                        b.descricao?.toLowerCase().includes("audiencia");

                      if (isAudA && !isAudB) return -1;
                      if (!isAudA && isAudB) return 1;

                      if (isAudA && isAudB) {
                        const hA = a.horario ? new Date(a.horario).getTime() : 0;
                        const hB = b.horario ? new Date(b.horario).getTime() : 0;
                        return hA - hB;
                      }

                      if (a.status === "pendente" && b.status !== "pendente") return -1;
                      if (b.status === "pendente" && a.status !== "pendente") return 1;

                      if (a.status === "resolvido" && b.status !== "resolvido") return 1;
                      if (b.status === "resolvido" && a.status !== "resolvido") return -1;

                      return 0;
                    });

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
                            <li key={i} className={`agenda-item ${corClasse}`}>
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


