import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";

import "./styles.css";

export default function ModalLeftAcordo({ 
    form, 
    setForm, 
    salvar, 
    salvarRef, 
    setEventoSelecionado,
    modo = "visualizar" // padrão
  }) {
    const isEditar = modo === "editar";
    const isVisualizar = modo === "visualizar";
    const isVisualizarAgenda = modo === "visualizarAgenda";
  
    return (
      <div className="modalleft-acordo-wrapper">
        <div className="modalleft-acordo-content">
  
          {/* Linha 1 - Contrato + Parte Adversa */}
          <div className="modalleft-acordo-row">
            <LinhaInput label="Contrato">
              <Input
                className="modalleft-acordo-input input-readonly"
                value={form?.contrato?.numero || ""}
                readOnly
              />
            </LinhaInput>
  
            <LinhaInput label="Parte Adversa">
              <Input
                className="modalleft-acordo-input input-readonly"
                value={form?.parte_adversa?.nome || ""}
                readOnly
              />
            </LinhaInput>
          </div>
  
          {/* Linha 2 - Valores + Número de Parcelas */}
          <div className="modalleft-acordo-row triple">
            <LinhaInput label="Valor do Acordo">
              <Input
                className={`modalleft-acordo-input ${isEditar ? "input-editable" : "input-readonly"}`}
                value={
                  form?.proposta?.valor_acordo
                    ? Number(form.proposta.valor_acordo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : ""
                }
                readOnly={!isEditar}
                onChange={(e) => isEditar && setForm({ ...form, proposta: { ...form.proposta, valor_acordo: e.target.value } })}
              />
            </LinhaInput>
  
            <LinhaInput label="Valor da Parcela">
              <Input
                className={`modalleft-acordo-input ${isEditar ? "input-editable" : "input-readonly"}`}
                value={
                  form?.proposta?.valor_parcela
                    ? Number(form.proposta.valor_parcela).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : ""
                }
                readOnly={!isEditar}
              />
            </LinhaInput>
  
            <LinhaInput label="Número de Parcelas">
              <Input
                className={`modalleft-acordo-input ${isEditar ? "input-editable" : "input-readonly"}`}
                value={form?.proposta?.numero_parcelas || ""}
                readOnly={!isEditar}
              />
            </LinhaInput>
          </div>
  
          {/* Linha 3 - Status + Data de Início */}
          <div className="modalleft-acordo-row">
            <LinhaInput label="Status">
              <Input
                className={`modalleft-acordo-input ${isEditar ? "input-editable" : "input-readonly"}`}
                value={form?.status || ""}
                readOnly={!isEditar}
              />
            </LinhaInput>
  
            <LinhaInput label="Data de Início">
              <Input
                type="date"
                className={`modalleft-acordo-input ${isEditar ? "input-editable" : "input-readonly"}`}
                value={form?.data_vencimento || ""}
                readOnly={!isEditar}
              />
            </LinhaInput>
          </div>
  
          {/* Observações */}
          <LinhaInput label="Observações">
            <textarea
              className={`modalleft-acordo-textarea ${
                isEditar || isVisualizarAgenda ? "input-editable" : "input-readonly"
              }`}
              rows={2}
              value={form?.observacao || ""}
              onChange={(e) => {
                if (isEditar || isVisualizarAgenda) {
                  setForm({ ...form, observacao: e.target.value });
                }
              }}
              readOnly={isVisualizar}
            />
          </LinhaInput>
        </div>
  
        {/* Rodapé */}
        <div className="modalleft-acordo-footer">
            {/* Exibe sempre em editar e visualizarAgenda */}
            {(isEditar || isVisualizarAgenda) && (
                <Button
                variant="ghost"
                onClick={() => setForm({ ...form, status: "Cancelado" })}
                >
                Cancelar Acordo
                </Button>
            )}

            <Button
                variant="outline"
                onClick={() => {
                setEventoSelecionado(null);
                setForm({});
                }}
            >
                Voltar para Lista
            </Button>

            {/* Salvar permanece sempre visível conforme seu código atual */}
            {(isEditar || isVisualizarAgenda) && (
                <Button onClick={salvar}>Salvar</Button>
            )}
        </div>

      </div>
    );
  }
  