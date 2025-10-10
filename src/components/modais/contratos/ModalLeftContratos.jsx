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
  modo = "visualizar" // novo valor padrão
}) {
    const isEditar = modo === "editar";
    const isVisualizar = modo === "visualizar";
    const isVisualizarAgenda = modo === "visualizarAgenda";
  return (
    <div className="agenda-modal-left">
      <div className="agenda-modal-left-content">
            <LinhaInput label="Número">
                <Input
                    className={`processo-modal-input ${
                    isEditar ? "input-editable" : "input-readonly"
                    }`}
                    value={form.numero || ""}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    readOnly={!isEditar}
                />
            </LinhaInput>

            <LinhaInput label="Valor">
                <Input
                    className={`processo-modal-input ${
                    isEditar ? "input-editable" : "input-readonly"
                    }`}
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
                    readOnly={!isEditar}
                />
            </LinhaInput>

            <LinhaInput label="Lote">
                <Input
                    className={`processo-modal-input ${
                    isEditar ? "input-editable" : "input-readonly"
                    }`}
                    value={form.lote || ""}
                    onChange={(e) => setForm({ ...form, lote: e.target.value })}
                    readOnly={!isEditar}
                />
            </LinhaInput>

            <LinhaInput label="Observação">
                <Input
                    className={`processo-textarea ${
                    isEditar || isVisualizarAgenda ? "input-editable" : "input-readonly"
                    }`}
                    value={form.observacao || ""}
                    onChange={(e) => {
                    if (isEditar || isVisualizarAgenda) {
                        setForm({ ...form, observacao: e.target.value });
                    }
                    }}
                    readOnly={isVisualizar && !isVisualizarAgenda}
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
