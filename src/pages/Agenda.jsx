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

import { 
  createProposta,              
  fetchPropostasByProcesso,    
  updateProposta,             
} from "@/services/ENDPOINTS_ServicePropostas";

import { 
  fetchModalParcelasByAcordoId 
} from "@/services/ENDPOINTS_ServiceParcelasAcordo";


import { createAcordo } from "@/services/ENDPOINTS_ServiceAcordos.js"; 

// 🧩  modais modularizados Acordo
import ModalLeftAcordo from "@/components/modais/acordos/ModalLeftAcordo";
import ModalLeftParcelas from "@/components/modais/acordos/ModalLeftParcelas";
import ModalRightParcelas from "@/components/modais/acordos/ModalRightParcelas";
// 🧩  modais modularizados Agenda
import ModalLeftAgendaLista from "@/components/modais/agenda/ModalLeftAgendaLista";
// 🧩  modais modularizados de Contratos
import ModalLeftContratos from "@/components/modais/contratos/ModalLeftContratos";
import ModalRightInicial from "@/components/modais/contratos/ModalRightInicial";
import ModalRightPartes from "@/components/modais/contratos/ModalRightPartes";
// 🧩  modais modularizados de Atribuição
import ModalRightAtribuicoes from "@/components/modais/atribuicoes/ModalRightAtribuicoes";
// 🧩  modais modularizados de Processo
import ModalLeftProcesso from "@/components/modais/processos/ModalLeftProcesso";
import ModalLeftPropostas from "@/components/modais/processos/ModalLeftPropostas";
import ModalRightPropostas from "@/components/modais/processos/ModalRightPropostas";




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



// 🔽 Ordena atribuições por data_inicial (decrescente) e retorna também a mais recente
function ordenarAtribuicoes(historico) {
  if (!historico || historico.length === 0) return { listaOrdenada: [], atual: null };

  const listaOrdenada = [...historico].sort((a, b) => {
    const dA = a.data_inicial ? new Date(a.data_inicial).getTime() : 0;
    const dB = b.data_inicial ? new Date(b.data_inicial).getTime() : 0;
    return dB - dA; // 🔽 mais recente primeiro
  });

  return { listaOrdenada, atual: listaOrdenada[0] }; // primeira é a mais atual
}

function renderModalLeftTabs(entityType, dataSelecionada, abaAtiva, setAbaAtiva, setRightMode) {
  let tabs = [];

  if (entityType === "contrato") {
    tabs = [
      { id: "contrato", label: "Contrato" },
    ];
  } 
  else if (entityType === "processo") {
    tabs = [
      { id: "processo", label: "Processo" },
      { id: "propostas", label: "Propostas" },
    ];
  } 
  else if (entityType === "acordo") {
    tabs = [
      { id: "acordo", label: "Acordo" },
      { id: "parcelas", label: "Parcelas" },
    ];
  }
  else {
    // fallback → agenda lista
    tabs = [
      { 
        id: "agenda", 
        label: `Agenda Dia - ${
          dataSelecionada 
            ? new Date(`${dataSelecionada}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) 
            : "—"
        }` 
      },
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
        
            if (tab.id === "propostas") {
              setRightMode("visualizarPropostas");
            } else if (tab.id === "processo") {
              setRightMode("visualizarAtrib");
            } else if (tab.id === "acordo") {
              setRightMode("visualizarAtrib");   // 👈 força atribuições quando volta para acordo
            } else if (tab.id === "parcelas") {
              setRightMode("visualizarParcelas"); // 👈 força parcelas quando entra
            }
          }}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
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


function AgendaModalAtribuicoes({ open, onClose, eventos, dataSelecionada, eventoInicial }) {
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [form, setForm] = useState({});
  const [visualizando, setVisualizando] = useState(true);
  const [editando, setEditando] = useState(false);
  const salvarRef = useRef(null);
  const [formAtrib, setFormAtrib] = useState({});
  const [rightMode, setRightMode] = useState("visualizarAtrib"); // 👈 estado do modo
  const [historicoAtribs, setHistoricoAtribs] = useState([]);

    // 🔽 Estados específicos para manipular Partes no Contrato
  const [showFormParte, setShowFormParte] = useState(false);
  const [fetchParte, setFetchParte] = useState("");
  const [foundParte, setFoundParte] = useState(null);
  const [parteAviso, setParteAviso] = useState("");
  const [parteParaRemover, setParteParaRemover] = useState(null);
  const [parteEditando, setParteEditando] = useState(null);
  const [parteEncontrada, setParteEncontrada] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState(null);
  const [propostas, setPropostas] = useState([]);
  const [novaProposta, setNovaProposta] = useState({ numero_parcelas: "", valor_parcela: "" });
  const [propostaSelecionada, setPropostaSelecionada] = useState(null);
  const [vencimentoAcordo, setVencimentoAcordo] = useState("");
  const [formVencimento, setFormVencimento] = useState("");
  const [formMes, setFormMes] = useState("");
  const [editandoProposta, setEditandoProposta] = useState(false);

  useEffect(() => {
    async function carregarPropostas() {
      if (abaAtiva === "propostas" && eventoSelecionado?.entity_type === "processo") {
        try {
          const res = await fetchPropostasByProcesso(eventoSelecionado.entity_id);
          setPropostas(res || []);
        } catch (err) {
          console.error("Erro ao carregar propostas:", err);
          setPropostas([]);
        }
      }
    }
    carregarPropostas();
  }, [abaAtiva, eventoSelecionado]);

  async function handleAdicionarProposta() {
    if (!eventoSelecionado?.entity_id) return;
    try {
      const payload = {
        processo_id: eventoSelecionado.entity_id,
        numero_parcelas: Number(novaProposta.numero_parcelas),
        valor_parcela: Number(novaProposta.valor_parcela),
      };
      await createProposta(payload);
      const atualizadas = await fetchPropostasByProcesso(eventoSelecionado.entity_id);
      setPropostas(atualizadas);
      setNovaProposta({ numero_parcelas: "", valor_parcela: "" });
    } catch (err) {
      console.error("Erro ao adicionar proposta:", err);
    }
  }
  
  async function handleEditarProposta() {
    if (!propostaSelecionada) return;
    try {
      await updateProposta(propostaSelecionada.id, {
        numero_parcelas: Number(novaProposta.numero_parcelas),
        valor_parcela: Number(novaProposta.valor_parcela),
      });
      const atualizadas = await fetchPropostasByProcesso(eventoSelecionado.entity_id);
      setPropostas(atualizadas);
      setPropostaSelecionada(null);
    } catch (err) {
      console.error("Erro ao editar proposta:", err);
    }
  }
  
  async function handleAceitarProposta() {
    if (!propostaSelecionada || !eventoSelecionado?.entity_id) return;
    try {
      const payload = {
        processo_id: eventoSelecionado.entity_id,
        proposta_processo_id: propostaSelecionada.id,
        data_vencimento: vencimentoAcordo,
      };
      await createAcordo(payload);
      const atualizadas = await fetchPropostasByProcesso(eventoSelecionado.entity_id);
      setPropostas(atualizadas);
      setPropostaSelecionada(null);
      setVencimentoAcordo("");
    } catch (err) {
      console.error("Erro ao aceitar proposta:", err);
    }
  }
  
  


  useEffect(() => {
    if (eventoSelecionado?.entity_type === "contrato") {
      setAbaAtiva("contrato");
    } else if (eventoSelecionado?.entity_type === "processo") {
      setAbaAtiva("processo");
    } else if (eventoSelecionado?.entity_type === "acordo") {
      setAbaAtiva("acordo");
    } else {
      setAbaAtiva("agenda");
    }
  }, [eventoSelecionado]);

  useEffect(() => {
    if (abaAtiva !== "propostas") {
      setPropostaSelecionada(null);
      setNovaProposta({ numero_parcelas: "", valor_parcela: "" });
      setVencimentoAcordo("");
      setFormVencimento("");           // ⬅️ limpa o campo de data
      setFormMes("");                  // ⬅️ limpa o campo de mês
      setEditandoProposta(false);     // ⬅️ sai do modo edição
    }
  }, [abaAtiva]);
  

  // 🔽 Handlers de Partes
  function handleBuscarParte() {
    if (!fetchParte) {
      setParteAviso("Digite um CPF para buscar.");
      return;
    }
    const resultadoFake = { id: Date.now(), nome: "Parte Exemplo", cpf: fetchParte };
    setParteEncontrada(resultadoFake);  // 👈 vai cair no fluxo de "Salvar"
    setParteAviso("");
  }
  
  

  function handleAdicionarParte() {
    if (!foundParte) {
      setParteAviso("Nenhuma parte encontrada.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      partes_adversas: [...(prev.partes_adversas || []), foundParte],
    }));
    setShowFormParte(false);
    setFetchParte(""); 
    setFoundParte(null);
  }

  function handleRemoverParte() {
    if (!parteParaRemover) return;
    setForm((prev) => ({
      ...prev,
      partes_adversas: (prev.partes_adversas || []).filter(
        (p) => p.id !== parteParaRemover.id
      ),
    }));
    setParteParaRemover(null);
    setShowFormParte(false);
  }


  // ✅ Estados para tipos e atribuições
  const [tiposEvento, setTiposEvento] = useState([]);
  const [atribuicoesAcordo, setAtribuicoesAcordo] = useState([]);
  const [atribuicoesProcesso, setAtribuicoesProcesso] = useState([]);
  const [atribuicoesContratos, setAtribuicoesContratos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);

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
    setRightMode("visualizarAtrib");
 
    try {
      if (evento.entity_type === "processo") {
        const dados = await fetchProcessoById(evento.entity_id);
        setForm(dados);
        setHistoricoAtribs(dados.atribuicoes_evento || []); // 👈 pega do backend
        setVisualizando(false);
        setEditando(true);
      }
  
      else if (evento.entity_type === "contrato") {
        const dados = await fetchContratoById(evento.entity_id);
        setForm(dados);
        setHistoricoAtribs(dados.atribuicoes_evento || []); // 👈 idem
        setVisualizando(true);
        setEditando(false);
      }
  
      else if (evento.entity_type === "acordo") {
        const dados = await fetchAcordoUnificadoById(evento.entity_id);
        const parcelas = await fetchModalParcelasByAcordoId(evento.entity_id);
      
        setForm({
          ...dados,
          parcelas, // 👈 adiciona parcelas no form
        });
      
        setHistoricoAtribs(dados.atribuicoes_evento || []);
        setVisualizando(true);
        setEditando(false);
      }
      
  
      else {
        setForm({});
        setHistoricoAtribs([]); // 👈 limpa
        setVisualizando(true);
        setEditando(false);
      }
    } catch (err) {
      console.error(`Erro ao carregar dados de ${evento.entity_type}:`, err);
      setForm({});
      setHistoricoAtribs([]);
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
          // 🔽 Reseta apenas os estados internos
          setEventoSelecionado(null);
          setForm({});
          setVisualizando(true);
          setEditando(false);
          setRightMode("visualizarAtrib");
          setHistoricoAtribs([]);
          setFormAtrib({});
          setPropostaSelecionada(null);
          setNovaProposta({ numero_parcelas: "", valor_parcela: "" });
          setVencimentoAcordo("");
          
          // 🔽 O pai (AgendaPessoal/AgendaEquipe) cuida dos externos
          onClose(isOpen);
        }
      }}
    >

      <DialogOverlay className="agenda-modal-overlay" />
      <DialogContent
        aria-describedby={undefined}
        className="agenda-modal-container"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        
        <div className="agenda-modal-split">
          {/* LADO ESQUERDO */}
          <div className="agenda-modal-split-left">
          <DialogTitle className="agenda-modal-title">
            {renderModalLeftTabs(
              eventoSelecionado?.entity_type,
              dataSelecionada,
              abaAtiva,
              setAbaAtiva,
              setRightMode   
            )}
          </DialogTitle>


            {abaAtiva === "agenda" && (
              <DialogDescription className="agenda-modal-description">
                Atribuições deste dia
              </DialogDescription>
            )}


              {abaAtiva === "processo" && (
                <ModalLeftProcesso
                  form={form}
                  setForm={setForm}
                  salvar={salvar}
                  tiposEvento={tiposEvento}
                  setEventoSelecionado={setEventoSelecionado}
                />
              )}

              {abaAtiva === "propostas" && (
                <ModalLeftPropostas
                  propostas={propostas} 
                  setPropostaSelecionada={setPropostaSelecionada}
                  setRightMode={setRightMode}
                />
              )}


              {abaAtiva === "contrato" && (
                <ModalLeftContratos
                  form={form}
                  setForm={setForm}
                  salvar={salvar}
                  salvarRef={salvarRef}
                  setEventoSelecionado={setEventoSelecionado}
                  setRightMode={setRightMode}
                  modo="visualizarAgenda"
                />
              )}


              {abaAtiva === "acordo" && (
                <ModalLeftAcordo
                form={form}
                setForm={setForm}
                salvar={salvar}
                salvarRef={salvarRef}
                setEventoSelecionado={setEventoSelecionado}
                modo="visualizarAgenda"
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
                />
              )}




              {abaAtiva === "agenda" && (
                <ModalLeftAgendaLista
                  eventos={eventos}
                  handleSelecionarEvento={handleSelecionarEvento}
                />
              )}



          </div>

          {/* LADO DIREITO */}
          <div className="agenda-modal-split-right">
            {eventoSelecionado?.entity_type ? (
              // 🔹 1. Inicial do Contrato
              eventoSelecionado.entity_type === "contrato" && rightMode === "inicialContrato" ? (
                <ModalRightInicial
                  form={form}
                  setForm={setForm}
                  setRightMode={setRightMode}
                  rightMode={rightMode}
                />
              ) 
              // 🔹 2. Partes do Contrato
              : rightMode === "partes" ? (
                <ModalRightPartes
                  entityType={eventoSelecionado?.entity_type}
                  contratoSelecionado={form}
                  partesVinculadas={form.partes_adversas || []}
                  setPartesVinculadas={(novas) =>
                    setForm((prev) => ({ ...prev, partes_adversas: novas }))
                  }
                  visualizando={visualizando}
                  showFormParte={showFormParte}
                  setShowFormParte={setShowFormParte}
                  fetchParte={fetchParte}
                  foundParte={foundParte}
                  setFetchParte={setFetchParte}
                  setFoundParte={setFoundParte}
                  parteAviso={parteAviso}
                  setParteAviso={setParteAviso}
                  parteParaRemover={parteParaRemover}
                  setParteParaRemover={setParteParaRemover}
                  parteEditando={parteEditando}
                  setParteEditando={setParteEditando}
                  parteEncontrada={parteEncontrada}
                  setParteEncontrada={setParteEncontrada}
                  handleBuscarParte={handleBuscarParte}
                  handleAdicionarParte={handleAdicionarParte}
                  handleRemoverParte={handleRemoverParte}
                  setRightMode={setRightMode}
                  rightMode={rightMode}
                />
              ) 
              // 🔹 3. Propostas de Processo
              : abaAtiva === "propostas" ? (
                <ModalRightPropostas
                  propostaSelecionada={propostaSelecionada}
                  formVencimento={formVencimento}
                  setFormVencimento={setFormVencimento}
                  formMes={formMes}
                  setFormMes={setFormMes}
                  handleEditarProposta={handleEditarProposta}
                  handleAceitarProposta={handleAceitarProposta}
                  setPropostaSelecionada={setPropostaSelecionada}
                  editandoProposta={editandoProposta}
                  setEditandoProposta={setEditandoProposta}
                />
              )
              // 🔹 4. Parcelas de Acordo
              : abaAtiva === "parcelas" ? (
                <ModalRightParcelas
                  rightMode={rightMode}
                  setRightMode={setRightMode}
                  parcelaSelecionada={form?.parcelaSelecionada}
                  setParcelaSelecionada={(p) =>
                    setForm((prev) => ({ ...prev, parcelaSelecionada: p }))
                  }
                  handleSalvarPagamento={(p) =>
                    console.log("Salvar pagamento", p)
                  }
                />
              )
              // 🔹 5. Atribuições padrão (processo/acordo/contrato)
              : (
                <ModalRightAtribuicoes
                  rightMode={rightMode}
                  setRightMode={setRightMode}
                  atribs={
                    eventoSelecionado?.entity_type === "processo"
                      ? atribuicoesProcesso
                      : eventoSelecionado?.entity_type === "acordo"
                      ? atribuicoesAcordo
                      : eventoSelecionado?.entity_type === "contrato"
                      ? atribuicoesContratos
                      : []
                  }
                  colabs={colaboradores}
                  historicoAtribs={historicoAtribs}
                  formAtrib={formAtrib}
                  setFormAtrib={setFormAtrib}
                  handleCriarAtribuicao={() =>
                    console.log("Criar atribuição", formAtrib)
                  }
                  handleEditarAtribuicao={() =>
                    console.log("Editar atribuição", formAtrib)
                  }
                  entityType={eventoSelecionado?.entity_type}
                  form={form}
                  setForm={setForm}
                />
              )
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
        onClose={(isOpen) => {
          setMostrarModal(isOpen);
          if (!isOpen) {
            setEventosExtras([]);
            setDataSelecionada(null);
            setEventoInicial(null);
          }
        }}
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
        onClose={(isOpen) => {
          setMostrarModal(isOpen);
          if (!isOpen) {
            setEventosExtras([]);
            setDataSelecionada(null);
            setEventoInicial(null);
          }
        }}
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


