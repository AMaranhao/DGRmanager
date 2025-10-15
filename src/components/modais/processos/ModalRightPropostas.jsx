// src/components/modais/processos/ModalRightPropostas.jsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";

import { createProposta, fetchPropostasByProcesso } from "@/services/ENDPOINTS_ServicePropostas";
import { createAcordo } from "@/services/ENDPOINTS_ServiceAcordos";


import "./styles.css";

export default function ModalRightPropostas({
    propostaSelecionada,
    setPropostaSelecionada,
    editandoProposta,
    setEditandoProposta,
    formVencimento,
    setFormVencimento,
    processoSel,
    setPropostasProcesso,
    modo,
}) {
    
    const isNovaProposta = editandoProposta && !propostaSelecionada?.id;

  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  // =======================================
  // Salvar nova proposta
  // =======================================
  const handleSalvarNovaProposta = async () => {
    try {
      setMensagem("");
      setLoading(true);

      if (!processoSel?.id) {
        setMensagem("❌ Nenhum processo selecionado.");
        return;
      }

      const payload = {
        processo_id: processoSel.id,
        numero_parcelas: Number(propostaSelecionada?.numero_parcelas || 0),
        valor_parcela: Number(propostaSelecionada?.valor_parcela || 0),
        valor_acordo: Number(propostaSelecionada?.valor_acordo || 0),
        primeiro_vencimento: formVencimento || null,
      };

      const nova = await createProposta(payload);

      if (nova?.id) {
        const atualizadas = await fetchPropostasByProcesso(processoSel.id);
        setPropostasProcesso(atualizadas || []);
        setMensagem("✅ Proposta criada com sucesso!");
      } else {
        setMensagem("⚠️ Proposta criada, mas sem retorno de ID.");
      }

      setEditandoProposta(false);
      setPropostaSelecionada(null);
      setFormVencimento("");
    } catch (err) {
      console.error("❌ Erro ao salvar proposta:", err);
      setMensagem("❌ Erro ao salvar proposta.");
    } finally {
      setLoading(false);
    }
  };

  // =======================================
  // Aceitar proposta
  // =======================================
  const handleAceitarProposta = async () => {
    try {
      setMensagem("");
      setLoading(true);

      if (!processoSel?.id || !propostaSelecionada?.id) {
        setMensagem("❌ Selecione uma proposta.");
        return;
      }

      if (!formVencimento?.trim()) {
        setMensagem("⚠️ Preencha a data do 1º vencimento.");
        return;
      }

      const payload = {
        processo_id: processoSel.id,
        proposta_processo_id: propostaSelecionada.id,
        data_vencimento: formVencimento.trim(),
      };

      await createAcordo(payload);

      const atualizadas = await fetchPropostasByProcesso(processoSel.id);
      setPropostasProcesso(atualizadas || []);
      setMensagem("✅ Proposta aceita e acordo criado!");

      setEditandoProposta(false);
      setPropostaSelecionada(null);
      setFormVencimento("");
    } catch (err) {
      console.error("❌ Erro ao aceitar proposta:", err);
      setMensagem("❌ Erro ao aceitar proposta.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="agenda-modal-right">
        <div className="agenda-modal-right-header">
            <div className="agenda-modal-tabs">
                <Button className="agenda-modal-tab-btn" variant="default">
                Proposta
                </Button>
            </div>
        </div>

  


        <div className="agenda-modal-right-wrapper">
            {propostaSelecionada ? (
                <div>

                    <div className="agenda-proposta-modal-right-content form">
                    <LinhaInput label="Valor Total da Proposta">
                        <Input
                        className={`agenda-modal-right-input ${isNovaProposta ? "input-editable" : "input-readonly"}`}
                        value={
                            isNovaProposta
                            ? propostaSelecionada?.valor_acordo || ""
                            : propostaSelecionada?.valor_acordo?.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                }) || ""
                        }
                        onChange={(e) => {
                            if (isNovaProposta) {
                            const raw = e.target.value.replace(/\D/g, "");
                            const valor = raw ? parseFloat(raw) / 100 : "";
                            setPropostaSelecionada({
                                ...propostaSelecionada,
                                valor_acordo: valor,
                            });
                            }
                        }}
                        readOnly={!isNovaProposta}
                        />
                    </LinhaInput>

                    <LinhaInput label="Número de Parcelas">
                        <Input
                        className={`agenda-modal-right-input ${isNovaProposta ? "input-editable" : "input-readonly"}`}
                        value={propostaSelecionada?.numero_parcelas || ""}
                        onChange={(e) => {
                            if (isNovaProposta) {
                            setPropostaSelecionada({
                                ...propostaSelecionada,
                                numero_parcelas: e.target.value,
                            });
                            }
                        }}
                        readOnly={!isNovaProposta}
                        />
                    </LinhaInput>

                    <LinhaInput label="Valor da Parcela">
                        <Input
                        className={`agenda-modal-right-input ${isNovaProposta ? "input-editable" : "input-readonly"}`}
                        value={
                            isNovaProposta
                            ? propostaSelecionada?.valor_parcela || ""
                            : propostaSelecionada?.valor_parcela?.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                }) || ""
                        }
                        onChange={(e) => {
                            if (isNovaProposta) {
                            const raw = e.target.value.replace(/\D/g, "");
                            const valor = raw ? parseFloat(raw) / 100 : "";
                            setPropostaSelecionada({
                                ...propostaSelecionada,
                                valor_parcela: valor,
                            });
                            }
                        }}
                        readOnly={!isNovaProposta}
                        />
                    </LinhaInput>

                    <LinhaInput label="Data do 1º Vencimento">
                        <Input
                        className="agenda-modal-right-input input-editable"
                        type="date"
                        value={formVencimento || ""}
                        onChange={(e) => setFormVencimento(e.target.value)}
                        />
                    </LinhaInput>
                    </div>


                    {modo !== "visualizar" && (
                        <div className="agenda-btn-modal-right-footer">
                        {isNovaProposta ? (
                          <>
                            <Button onClick={handleSalvarNovaProposta} disabled={loading}>
                            {loading ? "Salvando..." : "Salvar"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditandoProposta(false);
                                setPropostaSelecionada(null);
                              }}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={handleAceitarProposta}>Aceitar</Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditandoProposta(false);
                                setPropostaSelecionada(null);
                              }}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                      
                    )}

                </div>
                
            ) : (
                <div>
                    <div className="agenda-modal-right-proposta-wrapper">
                        <p className="agenda-modal-atr-label">
                            Clique em uma proposta à esquerda para detalhar aqui.
                        </p>
                        </div>
                        <div className="agenda-btn-modal-right-footer">
                        {/* ✅ Novo botão "+ Proposta" */}
                        {modo !== "visualizar" && (
                            
                                <Button
                                    onClick={() => {
                                    setPropostaSelecionada({
                                        numero_parcelas: "",
                                        valor_parcela: "",
                                        valor_acordo: "",
                                    });
                                    setEditandoProposta(true);
                                    }}
                                >
                                    + Proposta
                                </Button>
                           
                        )}
                        </div>
                    
                </div>
            )}
        </div>

    </div>
  );
}