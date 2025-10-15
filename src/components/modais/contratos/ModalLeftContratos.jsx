// src/components/modais/contratos/ModalLeftContrato.jsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";

import {
    createContrato,
    updateContrato,
    fetchContratos,
  } from "@/services/ENDPOINTS_ServiceContratos";

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
    
    // =============================
// Função de salvar contrato
// =============================
const handleSalvar = async () => {
    try {
      const payload = {
        numero: form.numero,
        valor: form.valor,
        lote: form.lote,
        observacao: form.observacao,
      };
  
      if (form.id) {
        await updateContrato(form.id, payload);
      } else {
        await createContrato(payload);
      }
  
      const atualizados = await fetchContratos();
  
      // Fecha modal e atualiza interface pai
      if (typeof salvar === "function") salvar();
    } catch (err) {
      console.error("❌ Erro ao salvar contrato:", err);
    }
  };
  
    const isEditar = modo === "editar";
    const isCriar = modo === "criar";
    const isVisualizar = modo === "visualizar";
    const isVisualizarAgenda = modo === "visualizarAgenda";
  
    const isCamposEditaveis = isEditar || isCriar;                   
    const isObservacaoEditavel = isCamposEditaveis || isVisualizarAgenda; 
  
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

                <Button onClick={handleSalvar}>
                    {isCriar ? "Criar Contrato" : "Salvar"}
                </Button>
            </div>
        )}

      </div>
    );
  }
  