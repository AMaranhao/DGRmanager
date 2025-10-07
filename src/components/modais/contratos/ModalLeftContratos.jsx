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
  visualizando, 
  editando, 
  salvarRef,
  setEventoSelecionado,
  setRightMode,
}) {
  return (
    <div className="agenda-modal-left">
      <div className="agenda-modal-left-content">
        <LinhaInput label="Número">
          <Input
            className={`processo-modal-input ${visualizando ? "input-readonly" : "input-editable"}`}
            value={form.numero || ""}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            readOnly={visualizando}
          />
        </LinhaInput>

        <LinhaInput label="Valor">
          <Input
            className={`processo-modal-input ${visualizando ? "input-readonly" : "input-editable"}`}
            value={
              form.valor !== undefined && form.valor !== null
                ? Number(form.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : ""
            }
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              const numericValue = raw ? parseFloat(raw) / 100 : "";
              setForm({ ...form, valor: numericValue });
            }}
            readOnly={visualizando}
          />
        </LinhaInput>

        <LinhaInput label="Lote">
          <Input
            className={`processo-modal-input ${visualizando ? "input-readonly" : "input-editable"}`}
            value={form.lote || ""}
            onChange={(e) => setForm({ ...form, lote: e.target.value })}
            readOnly={visualizando}
          />
        </LinhaInput>

        <LinhaInput label="Observação">
          <Input
            className={`processo-textarea ${visualizando ? "input-readonly" : "input-editable"}`}
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
