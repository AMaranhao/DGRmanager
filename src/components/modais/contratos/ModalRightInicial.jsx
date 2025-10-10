// src/components/modais/contratos/ModalRightInicial.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";

import "./styles.css";


export default function ModalRightInicial({ form, setForm, setRightMode, rightMode, modo, }) {
    return (
    <div className="agenda-modal-right">
        <div className="agenda-modal-right-header">
            <div className="agenda-modal-tabs">
            <Button
                className="agenda-modal-tab-btn"
                variant={rightMode === "visualizarAtrib" ? "default" : "outline"}
                onClick={() => setRightMode("visualizarAtrib")}
            >
                Atribuições
            </Button>
            <Button
                className="agenda-modal-tab-btn"
                variant={rightMode === "inicialContrato" ? "default" : "outline"}
                onClick={() => setRightMode("inicialContrato")}
            >
                Inicial
            </Button>
            <Button
                className="agenda-modal-tab-btn"
                variant={rightMode === "partes" ? "default" : "outline"}
                onClick={() => setRightMode("partes")}
            >
                Partes
            </Button>
            </div>
        </div>
  
        <div className="agenda-modal-right-wrapper">
            <div className="agenda-modal-right-content form">
                <LinhaInput label="Valor do Contrato Atualizado">
                <Input
                    className="agenda-modal-right-input input-editable"
                    value={
                    form?.valor_atualizado !== undefined && form?.valor_atualizado !== null
                        ? Number(form.valor_atualizado).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        })
                        : ""
                    }
                    onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const numericValue = raw ? parseFloat(raw) / 100 : "";
                    setForm({ ...form, valor_atualizado: numericValue });
                    }}
                    placeholder="Digite o valor"
                />
                </LinhaInput>

                <div className="modalright-inicial-botoes">
                    <Button variant="outline">📝 Word</Button>
                    <Button variant="outline">📄 PDF</Button>
                </div>
            </div>
        </div>
    </div>
  );
}
