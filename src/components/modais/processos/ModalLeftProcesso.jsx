import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";
import "./styles.css";

export default function ModalLeftProcesso({ 
  form, 
  setForm, 
  salvar, 
  tiposEvento, 
  setEventoSelecionado,
  modo,
}) {
  const isCriar = modo === "criar";
  const isEditar = modo === "editar";
  const isVisualizar = modo === "visualizar";
  const isVisualizarAgenda = modo === "visualizarAgenda";

  const isEditavelFull = isCriar || isEditar;
  const isEditavelEvento = isCriar || isEditar || isVisualizarAgenda;

  return (
    <div className="processo-form-wrapper">
      <div className="agenda-modal-left-content">

        {/* Linha 1 - CNJ e Contrato */}
        <div className="processo-input-row">
          <LinhaInput label="Número (CNJ)">
            <Input
              className={`processo-modal-input processo-modal-input-cnj ${isEditavelFull ? "input-editable" : "input-readonly"}`}
              value={form.numero || ""}
              onChange={(e) => {
                if (isEditavelFull) setForm({ ...form, numero: e.target.value });
              }}
              readOnly={!isEditavelFull}
            />
          </LinhaInput>

          <LinhaInput label="Contrato (nº ou ID)">
            <Input
              className={`processo-modal-input ${isEditavelFull ? "input-editable" : "input-readonly"}`}
              value={(form.contrato_numero || form.contrato_id || "").toString()}
              onChange={(e) => {
                if (isEditavelFull) {
                  setForm({ ...form, contrato_numero: e.target.value });
                }
              }}
              readOnly={!isEditavelFull}
            />
          </LinhaInput>
        </div>

        {/* Linha 2 - Datas */}
        <div className="processo-input-row triple">
          <LinhaInput label="Data de Distribuição">
            <Input
              type="date"
              className={`processo-modal-input ${isEditavelFull ? "input-editable" : "input-readonly"}`}
              value={form.data_distribuicao || ""}
              onChange={(e) => {
                if (isEditavelFull) setForm({ ...form, data_distribuicao: e.target.value });
              }}
              readOnly={!isEditavelFull}
            />
          </LinhaInput>

          <LinhaInput label="Publicação do Processo">
            <Input
              type="date"
              className={`processo-modal-input ${isEditavelFull ? "input-editable" : "input-readonly"}`}
              value={form.data_publicacao || ""}
              onChange={(e) => {
                if (isEditavelFull) setForm({ ...form, data_publicacao: e.target.value });
              }}
              readOnly={!isEditavelFull}
            />
          </LinhaInput>

          <LinhaInput label="Comarca">
            <Input
              className={`processo-modal-input ${isEditavelFull ? "input-editable" : "input-readonly"}`}
              value={form.comarca || ""}
              onChange={(e) => {
                if (isEditavelFull) setForm({ ...form, comarca: e.target.value });
              }}
              readOnly={!isEditavelFull}
            />
          </LinhaInput>
        </div>

        {/* Etapa */}
        <h4 className="agenda-modal-section-title">Etapa do Processo</h4>
        <div className="processo-input-row">
          <LinhaInput label="Etapa">
            <select
              className={`processo-modal-input ${isEditavelEvento ? "input-editable" : "input-readonly"}`}
              value={form.processo_evento?.tipo?.id || ""}
              onChange={(e) => {
                if (!isEditavelEvento) return;
                const selected = tiposEvento.find(te => te.id === Number(e.target.value));
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    tipo: selected,
                  },
                });
              }}
              disabled={!isEditavelEvento}
            >
              <option value="">Selecione</option>
              {tiposEvento.map((te) => (
                <option key={te.id} value={te.id}>
                  {te.tipo}
                </option>
              ))}
            </select>
          </LinhaInput>

          <LinhaInput label="Publicação da Etapa">
            <Input
              type="date"
              className={`processo-modal-input ${isEditavelEvento ? "input-editable" : "input-readonly"}`}
              value={form.processo_evento?.data_publicacao || ""}
              onChange={(e) => {
                if (isEditavelEvento) {
                  setForm({
                    ...form,
                    processo_evento: {
                      ...form.processo_evento,
                      data_publicacao: e.target.value,
                    },
                  });
                }
              }}
              readOnly={!isEditavelEvento}
            />
          </LinhaInput>
        </div>

        {/* Prazos */}
        <div className="processo-input-row triple">
          <LinhaInput label="Prazo Jurídico (dias)">
            <Input
              type="number"
              className={`processo-modal-input ${isEditavelEvento ? "input-editable" : "input-readonly"}`}
              value={form.processo_evento?.prazo_juridico?.toString() || ""}
              onChange={(e) => {
                if (isEditavelEvento) {
                  setForm({
                    ...form,
                    processo_evento: {
                      ...form.processo_evento,
                      prazo_juridico: e.target.value,
                    },
                  });
                }
              }}
              readOnly={!isEditavelEvento}
            />
          </LinhaInput>

          <LinhaInput label="Prazo Interno">
            <Input
              type="date"
              className={`processo-modal-input ${isEditavelEvento ? "input-editable" : "input-readonly"}`}
              value={form.processo_evento?.prazo_interno || ""}
              onChange={(e) => {
                if (isEditavelEvento) {
                  setForm({
                    ...form,
                    processo_evento: {
                      ...form.processo_evento,
                      prazo_interno: e.target.value,
                    },
                  });
                }
              }}
              readOnly={!isEditavelEvento}
            />
          </LinhaInput>

          <LinhaInput label="Prazo Fatal">
            <Input
              type="date"
              className={`processo-modal-input ${isEditavelEvento ? "input-editable" : "input-readonly"}`}
              value={form.processo_evento?.prazo_fatal || ""}
              onChange={(e) => {
                if (isEditavelEvento) {
                  setForm({
                    ...form,
                    processo_evento: {
                      ...form.processo_evento,
                      prazo_fatal: e.target.value,
                    },
                  });
                }
              }}
              readOnly={!isEditavelEvento}
            />
          </LinhaInput>
        </div>

        {/* Observação */}
        <LinhaInput label="Observação">
          <textarea
            className={`processo-textarea ${isEditavelEvento ? "input-editable" : "input-readonly"}`}
            rows={2}
            value={form.processo_evento?.observacao || ""}
            onChange={(e) => {
              if (isEditavelEvento) {
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    observacao: e.target.value,
                  },
                });
              }
            }}
            readOnly={!isEditavelEvento}
          />
        </LinhaInput>
      </div>

        {modo !== "visualizar" && (
            <div className="agenda-btn-modal-left-footer">
                {modo === "visualizarAgenda" && (
                <Button 
                    variant="outline"
                    onClick={() => setEventoSelecionado(null)}
                >
                    Voltar para Lista
                </Button>
                )}

                {(isEditar || isCriar || isVisualizarAgenda) && (
                <Button onClick={salvar}>
                    {isCriar ? "Criar Processo" : "Salvar"}
                </Button>
                )}
            </div>
        )}

    </div>
  );
}
