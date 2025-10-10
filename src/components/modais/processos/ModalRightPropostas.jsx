// src/components/modais/processos/ModalRightPropostas.jsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";

import "./styles.css";

export default function ModalRightPropostas({
  propostaSelecionada,
  formVencimento,
  setFormVencimento,
  formMes,
  setFormMes,
  handleEditarProposta,
  handleAceitarProposta,
  setPropostaSelecionada,
  editandoProposta,
  setEditandoProposta,
  modo,
}) {
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
                            className="agenda-modal-right-input input-readonly"
                            value={
                                propostaSelecionada?.valor_acordo?.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                }) || ""
                            }
                            readOnly
                            />
                        </LinhaInput>

                        <LinhaInput label="Número de Parcelas">
                            <Input
                            className="agenda-modal-right-input input-readonly"
                            value={propostaSelecionada?.numero_parcelas || ""}
                            readOnly
                            />
                        </LinhaInput>

                        <LinhaInput label="Valor da Parcela">
                            <Input
                            className="agenda-modal-right-input input-readonly"
                            value={
                                propostaSelecionada?.valor_parcela?.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                }) || ""
                            }
                            readOnly
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
                            <Button onClick={handleEditarProposta}>Editar</Button>
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
                        </div>
                    )}

                </div>
                
            ) : (
                <div className="agenda-modal-right-content">
                    <p className="agenda-modal-atr-label">
                        Clique em uma proposta à esquerda para detalhar aqui.
                    </p>
                </div>
            )}
        </div>

    </div>
  );
}