// src/components/modais/processos/ModalLeftProcesso.jsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";
import "./styles.css";

export default function ModalLeftProcesso({ 
  form, 
  setForm, 
  visualizando, 
  salvar, 
  tiposEvento, 
  setEventoSelecionado 
}) {
  return (
    <div className="processo-form-wrapper">
      <div className="agenda-modal-left-content">
        {/* Linha 1 - CNJ e Contrato */}
        <div className="processo-input-row">
          <LinhaInput label="Número (CNJ)">
            <Input
              className="processo-modal-input processo-modal-input-cnj input-readonly"
              value={form.numero || ""}
              readOnly
            />
          </LinhaInput>

          <LinhaInput label="Contrato (nº ou ID)">
            <Input
              className="processo-modal-input input-readonly"
              value={(form.contrato_numero || form.contrato_id || "").toString()}
              readOnly
            />
          </LinhaInput>
        </div>

        {/* Linha 2 - Datas */}
        <div className="processo-input-row triple">
          <LinhaInput label="Data de Distribuição">
            <Input
              type="date"
              className="processo-modal-input input-readonly"
              value={form.data_distribuicao || ""}
              readOnly
            />
          </LinhaInput>
          <LinhaInput label="Publicação do Processo">
            <Input
              type="date"
              className="processo-modal-input input-readonly"
              value={form.data_publicacao || ""}
              readOnly
            />
          </LinhaInput>
          <LinhaInput label="Comarca">
            <Input
              className="processo-modal-input input-readonly"
              value={form.comarca || ""}
              readOnly
            />
          </LinhaInput>
        </div>

        {/* Etapa */}
        <h4 className="agenda-modal-section-title">Etapa do Processo</h4>
        <div className="processo-input-row">
          <LinhaInput label="Etapa">
            <select
              className="processo-modal-input input-editable"
              value={form.processo_evento?.tipo?.id || ""}
              onChange={(e) => {
                const selected = tiposEvento.find(te => te.id === Number(e.target.value));
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    tipo: selected,
                  },
                });
              }}
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
              className="processo-modal-input input-editable"
              value={form.processo_evento?.data_publicacao || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    data_publicacao: e.target.value,
                  },
                })
              }
            />
          </LinhaInput>
        </div>

        {/* Prazos */}
        <div className="processo-input-row triple">
          <LinhaInput label="Prazo Jurídico (dias)">
            <Input
              type="number"
              className="processo-modal-input input-editable"
              value={form.processo_evento?.prazo_juridico?.toString() || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    prazo_juridico: e.target.value,
                  },
                })
              }
            />
          </LinhaInput>

          <LinhaInput label="Prazo Interno">
            <Input
              type="date"
              className="processo-modal-input input-editable"
              value={form.processo_evento?.prazo_interno || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    prazo_interno: e.target.value,
                  },
                })
              }
            />
          </LinhaInput>

          <LinhaInput label="Prazo Fatal">
            <Input
              type="date"
              className="processo-modal-input input-editable"
              value={form.processo_evento?.prazo_fatal || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  processo_evento: {
                    ...form.processo_evento,
                    prazo_fatal: e.target.value,
                  },
                })
              }
            />
          </LinhaInput>
        </div>

        {/* Observação */}
        <LinhaInput label="Observação">
          <textarea
            className="processo-textarea input-editable"
            rows={2}
            value={form.processo_evento?.observacao || ""}
            onChange={(e) =>
              setForm({
                ...form,
                processo_evento: {
                  ...form.processo_evento,
                  observacao: e.target.value,
                },
              })
            }
          />
        </LinhaInput>
      </div>

      <div className="agenda-btn-modal-left-footer">
        <Button 
          variant="outline"
          onClick={() => setEventoSelecionado(null)}
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
