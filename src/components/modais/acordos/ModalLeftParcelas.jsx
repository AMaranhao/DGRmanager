// src/components/modais/acordos/ModalLeftParcelas.jsx
import React from "react";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";

import "./styles.css";


export default function ModalLeftParcelas({ 
  parcelas = [], 
  setParcelaSelecionada,
  setRightMode,
  modo,
}) {
  // Normaliza "hoje" para comparar só a data (sem hora)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const getCardClass = (parcela) => {
    const st = (parcela.status || "").toLowerCase();
    const estaPaga = !!parcela.data_pagamento || st === "pago" || st === "paga";

    if (estaPaga) {
      // fundo verde claro
      return "modalleft-parcelas-card pago";
    }

    // Se não está paga, verifica atraso
    if (parcela.vencimento) {
      const venc = new Date(parcela.vencimento);
      venc.setHours(0, 0, 0, 0);
      if (venc < hoje) {
        // fundo vermelho claro
        return "modalleft-parcelas-card atrasada";
      }
    }

    // padrão
    return "modalleft-parcelas-card";
  };

  // Garante ordenação por número da parcela
  const itens = Array.isArray(parcelas) ? [...parcelas] : [];
  itens.sort((a, b) => (a.numero_parcela ?? 0) - (b.numero_parcela ?? 0));

  return (
    <div className="modalleft-parcelas-wrapper">
      <div className="modalleft-parcelas-content">
        <div className="modalleft-parcelas-grid">
          {itens.length > 0 ? (
            itens.map((parcela) => (
              <div
                key={parcela.id || parcela.numero_parcela || parcela.key}
                className={getCardClass(parcela)}
                onClick={() => {
                  setParcelaSelecionada?.(parcela);
                  setRightMode("parcelaSelecionada"); // abre detalhe da parcela
                }}
              >
                <div className="modalleft-parcelas-linha">
                  <span className="modalleft-parcelas-data">
                    {parcela.vencimento
                      ? new Date(parcela.vencimento).toLocaleDateString("pt-BR")
                      : "—"}
                  </span>
                </div>

                <div className="modalleft-parcelas-linha">
                  <span className="modalleft-parcelas-valor">
                    {parcela.valor_parcela != null
                      ? Number(parcela.valor_parcela).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="modalleft-parcelas-empty">Nenhuma parcela encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
