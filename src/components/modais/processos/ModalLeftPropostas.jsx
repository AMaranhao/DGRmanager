// src/components/modais/processos/ModalLeftPropostas.jsx

import React from "react";
import { Button } from "@/components/ui/button";
import "./styles.css";

export default function ModalLeftPropostas({ propostas, setPropostaSelecionada, setRightMode }) {
  return (
    <div className="agenda-modal-propostas-wrapper">
      {/* Área com rolagem e grid */}
      <div className="agenda-modal-propostas-content">
        <div className="agenda-modal-propostas-grid">
          {propostas.length > 0 ? (
            propostas.map((p) => (
              <div
                key={p.id}
                className="agenda-modal-propostas-card cursor-pointer"
                onClick={() => {
                  setPropostaSelecionada(p);
                  setRightMode("propostaSelecionada");
                }}
              >
                <div className="agenda-modal-propostas-linha">
                  <span className="agenda-modal-propostas-label">Parcelas:</span>
                  <span className="agenda-modal-propostas-valor">{p.numero_parcelas}</span>
                </div>
                <div className="agenda-modal-propostas-linha">
                  <span className="agenda-modal-propostas-label">Valor:</span>
                  <span className="agenda-modal-propostas-valor">
                    {Number(p.valor_parcela).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="agenda-modal-propostas-empty">Nenhuma proposta encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
