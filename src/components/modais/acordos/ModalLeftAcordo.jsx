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
  modo,
}) {
  const isEditar = modo === "editar";
  const isCriar = modo === "criar";
  const isVisualizar = modo === "visualizar";
  const isVisualizarAgenda = modo === "visualizarAgenda";

  const isEditavelGeral = isEditar || isCriar;
  const isEditavelObservacao = isEditavelGeral || isVisualizarAgenda;

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

        {/* Linha 2 - Valores + Parcelas */}
        <div className="modalleft-acordo-row triple">
          <LinhaInput label="Valor do Acordo">
            <Input
              className={`modalleft-acordo-input ${isEditavelGeral ? "input-editable" : "input-readonly"}`}
              value={
                form?.proposta?.valor_acordo
                  ? Number(form.proposta.valor_acordo).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    })
                  : ""
              }
              readOnly={!isEditavelGeral}
              onChange={(e) => {
                if (isEditavelGeral) {
                  const raw = e.target.value.replace(/\D/g, "");
                  const valor = raw ? parseFloat(raw) / 100 : "";
                  setForm({ 
                    ...form, 
                    proposta: { 
                      ...form.proposta, 
                      valor_acordo: valor 
                    } 
                  });
                }
              }}
            />
          </LinhaInput>

          <LinhaInput label="Valor da Parcela">
            <Input
              className={`modalleft-acordo-input ${isEditavelGeral ? "input-editable" : "input-readonly"}`}
              value={
                form?.proposta?.valor_parcela
                  ? Number(form.proposta.valor_parcela).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    })
                  : ""
              }
              readOnly={!isEditavelGeral}
              onChange={(e) => {
                if (isEditavelGeral) {
                  const raw = e.target.value.replace(/\D/g, "");
                  const valor = raw ? parseFloat(raw) / 100 : "";
                  setForm({ 
                    ...form, 
                    proposta: { 
                      ...form.proposta, 
                      valor_parcela: valor 
                    } 
                  });
                }
              }}
            />
          </LinhaInput>

          <LinhaInput label="Número de Parcelas">
            <Input
              className={`modalleft-acordo-input ${isEditavelGeral ? "input-editable" : "input-readonly"}`}
              value={form?.proposta?.numero_parcelas || ""}
              readOnly={!isEditavelGeral}
              onChange={(e) => {
                if (isEditavelGeral) {
                  setForm({ 
                    ...form, 
                    proposta: { 
                      ...form.proposta, 
                      numero_parcelas: e.target.value 
                    } 
                  });
                }
              }}
            />
          </LinhaInput>
        </div>

        {/* Linha 3 - Status + Data */}
        <div className="modalleft-acordo-row">
          <LinhaInput label="Status">
            <Input
              className={`modalleft-acordo-input ${isEditavelGeral ? "input-editable" : "input-readonly"}`}
              value={form?.status || ""}
              readOnly={!isEditavelGeral}
              onChange={(e) => {
                if (isEditavelGeral) {
                  setForm({ ...form, status: e.target.value });
                }
              }}
            />
          </LinhaInput>

          <LinhaInput label="Data de Início">
            <Input
              type="date"
              className={`modalleft-acordo-input ${isEditavelGeral ? "input-editable" : "input-readonly"}`}
              value={form?.data_vencimento || ""}
              readOnly={!isEditavelGeral}
              onChange={(e) => {
                if (isEditavelGeral) {
                  setForm({ ...form, data_vencimento: e.target.value });
                }
              }}
            />
          </LinhaInput>
        </div>

        {/* Observação */}
        <LinhaInput label="Observações">
          <textarea
            className={`modalleft-acordo-textarea ${isEditavelObservacao ? "input-editable" : "input-readonly"}`}
            rows={2}
            value={form?.observacao || ""}
            onChange={(e) => {
              if (isEditavelObservacao) {
                setForm({ ...form, observacao: e.target.value });
              }
            }}
            readOnly={!isEditavelObservacao}
          />
        </LinhaInput>
      </div>

      {/* Rodapé */}
        {modo !== "visualizar" && (
            <div className="modalleft-acordo-footer">
                {(isEditar || isVisualizarAgenda) && (
                <Button
                    variant="ghost"
                    onClick={() => setForm({ ...form, status: "Cancelado" })}
                >
                    Cancelar Acordo
                </Button>
                )}

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

                {(isEditar || isCriar || isVisualizarAgenda) && (
                <Button onClick={salvar}>
                    {isCriar ? "Criar Acordo" : "Salvar"}
                </Button>
                )}
            </div>
        )}

    </div>
  );
}
