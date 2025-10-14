import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";

import {
    createPagamentoAcordo,
    updatePagamentoAcordo,
  } from "@/services/ENDPOINTS_ServiceAcordoPagamento";
  
  import { fetchModalParcelasByAcordoId } from "@/services/ENDPOINTS_ServiceParcelasAcordo";
  import { fetchAcordoUnificadoById } from "@/services/ENDPOINTS_ServiceAcordos";
  

import "./styles.css";

export default function ModalRightParcelas({
  rightMode,
  setRightMode,
  parcelaSelecionada,
  setParcelaSelecionada,
  modo,
}) {

    const [mensagem, setMensagem] = useState("");
    const [loading, setLoading] = useState(false);
    const [pagamentos, setPagamentos] = useState([]);

    // ✅ Substituir função handleSalvar
    const handleSalvar = async () => {
        if (!parcelaSelecionada?.id) return;
        try {
        setMensagem("");
        setLoading(true);
    
        const payload = {
            data_pagamento: parcelaSelecionada.data_pagamento,
            valor_pago: Number(parcelaSelecionada.valor_pago || 0),
            observacao: parcelaSelecionada.observacao || "",
        };
    
    
        // ✅ PUT direto, igual ao Acordos.jsx
        await updatePagamentoAcordo(parcelaSelecionada.id, payload);
        setMensagem("✅ Pagamento atualizado com sucesso!");
    
        // 🔁 Recarrega parcelas atualizadas
        const parcelasAtualizadas = await fetchModalParcelasByAcordoId(
            parcelaSelecionada.acordo_id || parcelaSelecionada.id_acordo
        );
    
    
        // ✅ Atualiza visual (mantém a seleção)
        if (parcelasAtualizadas?.length) {
            const atualizada = parcelasAtualizadas.find((p) => p.id === parcelaSelecionada.id);
            setParcelaSelecionada(atualizada || parcelaSelecionada);
        }
    
        // ✅ Volta para modo de visualização
        setRightMode("parcelaSelecionada");
        } catch (err) {
        console.error("❌ Erro ao atualizar pagamento:", err);
        setMensagem("❌ Erro ao atualizar pagamento.");
        } finally {
        setLoading(false);
        }
    };
  
      
      


  if (rightMode === "visualizarParcelas") {
    return (
      <div className="modalright-parcelas-wrapper">
        <div className="modalright-parcelas-tabs">
          <Button className="modalright-parcelas-tab-btn" variant="default">
            Pagamentos
          </Button>
        </div>

        <div className="modalright-parcelas-scroll">
          <p className="modalright-parcelas-label">
            Clique em uma parcela à esquerda para detalhar aqui.
          </p>
        </div>
      </div>
    );
  }

  if (rightMode === "parcelaSelecionada" && parcelaSelecionada) {
    return (
      <div className="modalright-parcelas-wrapper">
        <div className="modalright-parcelas-tabs">
          <Button className="modalright-parcelas-tab-btn" variant="default">
            Pagamentos
          </Button>
        </div>

        <div className="modalright-parcelas-scroll">
          <LinhaInput label="Parcela">
            <Input
              className="modalright-parcelas-input input-readonly"
              value={parcelaSelecionada.numero_parcela}
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Data do Vencimento">
            <Input
              className="modalright-parcelas-input input-readonly"
              value={
                parcelaSelecionada.vencimento
                  ? new Date(parcelaSelecionada.vencimento).toLocaleDateString("pt-BR")
                  : "—"
              }
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Valor da Parcela">
            <Input
              className="modalright-parcelas-input input-readonly"
              value={Number(parcelaSelecionada.valor_parcela).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Data do Pagamento">
            <Input
              className="modalright-parcelas-input input-readonly"
              value={
                parcelaSelecionada.data_pagamento
                  ? new Date(parcelaSelecionada.data_pagamento).toLocaleDateString("pt-BR")
                  : "—"
              }
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Valor Pago">
            <Input
              className="modalright-parcelas-input input-readonly"
              value={
                parcelaSelecionada.valor_pago
                  ? Number(parcelaSelecionada.valor_pago).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "R$ 0,00"
              }
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Status">
            <span
              style={{
                color:
                  parcelaSelecionada.status === "pago"
                    ? "green"
                    : parcelaSelecionada.status === "em_atraso"
                    ? "red"
                    : "orange",
                fontWeight: "bold",
              }}
            >
              {parcelaSelecionada.status}
            </span>
          </LinhaInput>
        </div>

        {modo !== "visualizar" && (
            <div className="modalright-parcelas-footer">
                <Button
                    onClick={() => setRightMode("realizarPagamento")}
                    disabled={parcelaSelecionada.status === "pago"}
                    >
                    Realizar Pagamento
                </Button>
            </div>
        )}

      </div>
    );
  }

  if (rightMode === "realizarPagamento" && parcelaSelecionada) {
    return (
      <div className="modalright-parcelas-wrapper">
        <div className="modalright-parcelas-tabs">
          <Button className="modalright-parcelas-tab-btn" variant="default">
            Pagamentos
          </Button>
        </div>

        <div className="modalright-parcelas-scroll">
          <LinhaInput label="Parcela">
            <Input
              className="modalright-parcelas-input input-readonly"
              value={parcelaSelecionada.numero_parcela}
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Data do Vencimento">
            <Input
              className="modalright-parcelas-input input-readonly"
              value={
                parcelaSelecionada.vencimento
                  ? new Date(parcelaSelecionada.vencimento).toLocaleDateString("pt-BR")
                  : "—"
              }
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Valor da Parcela">
            <Input
              className="modalright-parcelas-input input-readonly"
              value={
                parcelaSelecionada.valor_parcela
                  ? Number(parcelaSelecionada.valor_parcela).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "R$ 0,00"
              }
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Data do Pagamento">
            <Input
              type="date"
              className="modalright-parcelas-input input-editable"
              value={parcelaSelecionada.data_pagamento || ""}
              onChange={(e) =>
                setParcelaSelecionada({
                  ...parcelaSelecionada,
                  data_pagamento: e.target.value,
                })
              }
            />
          </LinhaInput>

          <LinhaInput label="Valor Pago">
            <Input
              type="text"
              className="modalright-parcelas-input input-editable"
              value={
                parcelaSelecionada.valor_pago !== undefined && parcelaSelecionada.valor_pago !== null
                  ? Number(parcelaSelecionada.valor_pago).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : ""
              }
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "");
                const floatValue = numericValue ? parseFloat(numericValue) / 100 : 0;
                setParcelaSelecionada({
                  ...parcelaSelecionada,
                  valor_pago: floatValue,
                });
              }}
              placeholder="R$ 0,00"
            />
          </LinhaInput>
        </div>

        {modo !== "visualizar" && (
            <div className="modalright-parcelas-footer">
                <Button
                    variant="secondary"
                    onClick={() => setRightMode("parcelaSelecionada")}
                    >
                    Cancelar
                </Button>
                <Button onClick={handleSalvar} disabled={loading}>
                    {loading ? "Salvando..." : "Salvar"}
                </Button>

            </div>
        )}

      </div>
    );
  }

  return null;
}
