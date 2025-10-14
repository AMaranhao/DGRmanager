import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";
import { useState } from "react";

import {
  createAcordo,
  updateAcordo,
  fetchAcordoUnificadoById,
} from "@/services/ENDPOINTS_ServiceAcordos";

import { fetchModalParcelasByAcordoId } from "@/services/ENDPOINTS_ServiceParcelasAcordo";


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

  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    try {
      setMensagem("");
      setLoading(true);
  
      // 🧩 Garante que o ID do acordo exista (para PUT)
      const acordoId = form?.id || form?.acordo_id;
      if ((modo === "editar" || modo === "visualizarAgenda") && !acordoId) {
        console.error("❌ O acordo não possui ID válido:", form);
        setMensagem("❌ ID do acordo não encontrado. Reabra o modal.");
        setLoading(false);
        return;
      }
  
  
      // --- CRIAÇÃO ---
      if (modo === "criar") {
        const payload = {
          contrato_id: form?.contrato?.id || null,
          parte_adversa_id: form?.parte_adversa?.id || null,
          data_vencimento: form?.data_vencimento || null,
          status: form?.status || "ativo",
          observacao: form?.observacao || "",
          valor_acordo: Number(form?.proposta?.valor_acordo || 0),
          valor_parcela: Number(form?.proposta?.valor_parcela || 0),
          numero_parcelas: Number(form?.proposta?.numero_parcelas || 0),
        };
  
        const novo = await createAcordo(payload);
  
        if (novo?.id || novo?.acordo_id) {
          const novoId = novo.id || novo.acordo_id;
          const atualizado = await fetchAcordoUnificadoById(novoId);
          setForm({ ...atualizado, id: novoId }); // garante persistência local do ID
          setMensagem("✅ Acordo criado com sucesso.");
        } else {
          setMensagem("⚠️ Acordo criado, mas sem retorno de ID.");
        }
      }
  
      // --- EDIÇÃO / VISUALIZAR AGENDA ---
      if (modo === "editar" || modo === "visualizarAgenda") {
        const payload =
          modo === "visualizarAgenda"
            ? { observacao: form.observacao }
            : {
                status: form.status,
                observacao: form.observacao,
                data_vencimento: form.data_vencimento,
              };
  
        await updateAcordo(acordoId, payload);
  
        const atualizado = await fetchAcordoUnificadoById(acordoId);

        // 🔹 Recarrega parcelas do acordo atualizado
        let parcelasAtualizadas = [];
        try {
        parcelasAtualizadas = await fetchModalParcelasByAcordoId(acordoId);
        } catch (err) {
        console.warn("⚠️ Falha ao recarregar parcelas:", err);
        }

        // Atualiza o form, mantendo id e anexando parcelas
        setForm({
        ...atualizado,
        id: acordoId,
        parcelas: parcelasAtualizadas || [],
        });

        setMensagem("✅ Acordo atualizado com sucesso.");

      }
    } catch (err) {
      console.error("❌ Erro ao salvar acordo:", err);
      setMensagem("❌ Erro ao salvar o acordo.");
    } finally {
      setLoading(false);
    }
  };
  
  


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
                    <Button onClick={handleSalvar} disabled={loading}>
                        {loading ? "Salvando..." : isCriar ? "Criar Acordo" : "Salvar"}
                    </Button>

                )}
            </div>
        )}

    </div>
  );
}
