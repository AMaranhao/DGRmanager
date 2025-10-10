// src/components/modais/contratos/ModalLeftContrato.jsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";
import "./styles.css";

export default function ModalLeftContrato({ 
    form,
    setForm,
    salvar,
    salvarRef,
    setEventoSelecionado,
    setRightMode,
    modo
  }) {
    const isEditar = modo === "editar";
    const isCriar = modo === "criar";
    const isVisualizar = modo === "visualizar";
    const isVisualizarAgenda = modo === "visualizarAgenda";
  
    const isCamposEditaveis = isEditar || isCriar;                    // Número, Valor, Lote
    const isObservacaoEditavel = isCamposEditaveis || isVisualizarAgenda; // Observação
  
    return (
      <div className="agenda-modal-left">
        <div className="agenda-modal-left-content">
  
          <LinhaInput label="Número">
            <Input
              className={`processo-modal-input ${isCamposEditaveis ? "input-editable" : "input-readonly"}`}
              value={form.numero || ""}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              readOnly={!isCamposEditaveis}
            />
          </LinhaInput>
  
          <LinhaInput label="Valor">
            <Input
              className={`processo-modal-input ${isCamposEditaveis ? "input-editable" : "input-readonly"}`}
              value={
                form.valor !== undefined && form.valor !== null
                  ? Number(form.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : ""
              }
              onChange={(e) => {
                if (!isCamposEditaveis) return;
                const raw = e.target.value.replace(/\D/g, "");
                const numericValue = raw ? parseFloat(raw) / 100 : "";
                setForm({ ...form, valor: numericValue });
              }}
              readOnly={!isCamposEditaveis}
            />
          </LinhaInput>
  
          <LinhaInput label="Lote">
            <Input
              className={`processo-modal-input ${isCamposEditaveis ? "input-editable" : "input-readonly"}`}
              value={form.lote || ""}
              onChange={(e) => setForm({ ...form, lote: e.target.value })}
              readOnly={!isCamposEditaveis}
            />
          </LinhaInput>
  
          <LinhaInput label="Observação">
            <textarea
              className={`contrato-textarea ${isObservacaoEditavel ? "input-editable" : "input-readonly"}`}
              rows={4}
              value={form.observacao || ""}
              onChange={(e) => {
                if (isObservacaoEditavel) {
                  setForm({ ...form, observacao: e.target.value });
                }
              }}
              readOnly={!isObservacaoEditavel}
            />
          </LinhaInput>
        </div>
  
        {modo !== "visualizar" && (
            <div className="agenda-btn-modal-left-footer">
                {modo === "visualizarAgenda" && (
                    <Button 
                        variant="outline"
                        onClick={() => {
                        setEventoSelecionado(null);
                        setForm({});
                        }}
                    >
                        Voltar para Lista
                    </Button>
                )}

                <Button onClick={salvar}>
                    {isCriar ? "Criar Contrato" : "Salvar"}
                </Button>
            </div>
        )}

      </div>
    );
  }
  