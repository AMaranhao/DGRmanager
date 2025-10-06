import React from "react";
import { Button } from "@/components/ui/button";
import "./styles.css";


/* ===============================
   LinhaInput reutilizável para modais
   =============================== */

export const LinhaInput = React.memo(({ label, children }) => (
  <div className="linha-input-wrapper">
    <label className="linha-input-label">{label}</label>
    {children}
  </div>
));

/* ===============================
   Ordenação de atribuições
   =============================== */

export function ordenarAtribuicoes(historico) {
  if (!historico || historico.length === 0) return { listaOrdenada: [], atual: null };

  const listaOrdenada = [...historico].sort((a, b) => {
    const dA = a.data_inicial ? new Date(a.data_inicial).getTime() : 0;
    const dB = b.data_inicial ? new Date(b.data_inicial).getTime() : 0;
    return dB - dA;
  });

  return { listaOrdenada, atual: listaOrdenada[0] };
}

/* ===============================
   Tabs de modais (Agenda)
   =============================== */

export function renderModalLeftTabs(entityType, dataSelecionada, abaAtiva, setAbaAtiva, setRightMode) {
  let tabs = [];

  if (entityType === "contrato") {
    tabs = [{ id: "contrato", label: "Contrato" }];
  } else if (entityType === "processo") {
    tabs = [
      { id: "processo", label: "Processo" },
      { id: "propostas", label: "Propostas" },
    ];
  } else if (entityType === "acordo") {
    tabs = [
      { id: "acordo", label: "Acordo" },
      { id: "parcelas", label: "Parcelas" },
    ];
  } else {
    tabs = [{
      id: "agenda",
      label: `Agenda Dia - ${
        dataSelecionada
          ? new Date(`${dataSelecionada}T00:00:00`).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            })
          : "—"
      }`,
    }];
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
            if (tab.id === "propostas") setRightMode("visualizarPropostas");
            else if (tab.id === "processo") setRightMode("visualizarAtrib");
            else if (tab.id === "acordo") setRightMode("visualizarAtrib");
            else if (tab.id === "parcelas") setRightMode("visualizarParcelas");
          }}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

/* ===============================
   Dias da semana (Agenda)
   =============================== */

export function getDiasSemana(offset = 0) {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diffSegunda = hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
  const segunda = new Date(hoje.setDate(diffSegunda));
  segunda.setDate(segunda.getDate() + offset * 7);

  return Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    return d;
  });
}

/* ===============================
   Ordenação dos eventos da agenda
   =============================== */

export function ordenarEventosAgenda(eventos) {
  return [...eventos].sort((a, b) => {
    const isAudA = a.entity_type === "processo" && a.descricao?.toLowerCase().includes("audiencia");
    const isAudB = b.entity_type === "processo" && b.descricao?.toLowerCase().includes("audiencia");

    if (isAudA && !isAudB) return -1;
    if (!isAudA && isAudB) return 1;

    if (isAudA && isAudB) {
      const hA = a.horario ? new Date(a.horario).getTime() : 0;
      const hB = b.horario ? new Date(b.horario).getTime() : 0;
      return hA - hB;
    }

    const prioridadeStatus = { com_hora: 1, pendente: 2, resolvido: 3 };
    const prioridadeTipo = { acordo: 1, contrato: 2, processo: 3 };

    const statusA = prioridadeStatus[a.status] || 99;
    const statusB = prioridadeStatus[b.status] || 99;

    if (statusA !== statusB) return statusA - statusB;

    const tipoA = prioridadeTipo[a.entity_type] || 99;
    const tipoB = prioridadeTipo[b.entity_type] || 99;

    return tipoA - tipoB;
  });
}
