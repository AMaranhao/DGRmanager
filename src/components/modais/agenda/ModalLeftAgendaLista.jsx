import React from "react";
import "./styles.css"; 
import { ordenarEventosAgenda } from "@/components/modais/shared/utilsFunctionsModals";

export default function ModalLeftAgendaLista({ eventos = [], handleSelecionarEvento }) {
  const eventosOrdenados = ordenarEventosAgenda(eventos);

  return (
    <div className="modalleft-agenda-lista-scroll">
      <div className="modalleft-agenda-lista-content">
        <div className="modalleft-agenda-lista-colunas">
          {Array.from({ length: 3 }).map((_, colIdx) => (
            <div className="modalleft-agenda-lista-coluna" key={colIdx}>
              {eventosOrdenados
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

                  const cor =
                    evento.status === "resolvido"
                      ? "modalleft-agenda-lista-item-verde"
                      : evento.status === "com_hora"
                      ? "modalleft-agenda-lista-item-vermelho"
                      : "modalleft-agenda-lista-item-azul";

                  return (
                    <div
                      key={idx}
                      className={`modalleft-agenda-lista-item ${cor}`}
                      onClick={() => handleSelecionarEvento(evento)}
                    >
                      <span className="modalleft-agenda-lista-item-texto">
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
