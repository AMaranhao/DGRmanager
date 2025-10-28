// src/components/modais/atrib/ModalRightAtribuicoes.jsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinhaInput } from "@/components/modais/shared/utilsFunctionsModals";
import { ordenarAtribuicoes } from "@/components/modais/shared/utilsFunctionsModals";

import {
createAtribuicaoEvento,
updateAtribuicaoEvento,
} from "@/services/ENDPOINTS_ServiceAtribuicaoEvento";
  
  import { fetchAcordoUnificadoById } from "@/services/ENDPOINTS_ServiceAcordos";
  import { fetchContratoById } from "@/services/ENDPOINTS_ServiceContratos";
  import { fetchProcessoById } from "@/services/ENDPOINTS_ServiceProcessos";
  import { fetchModalParcelasByAcordoId } from "@/services/ENDPOINTS_ServiceParcelasAcordo";


import "./styles.css";

export default function ModalRightAtribuicoes({
  rightMode,
  setRightMode,
  atribs,
  colabs,
  historicoAtribs,
  formAtrib,
  setFormAtrib,
  entityType,
  form,
  setForm,
  modo,
}) {

    // =============================
// Funções internas de API
// =============================
const handleCriarAtribuicao = async () => {
    if (!form?.id && !form?.acordo_id && !form?.contrato_id && !form?.processo_id) {
      console.error("❌ Nenhum ID encontrado para criar atribuição.");
      return;
    }
  
    try {
      const entityId =
        form?.id || form?.acordo_id || form?.contrato_id || form?.processo_id;
  
      const payload = {
        entity_type: entityType || "acordo", // padrão
        entity_id: entityId,
        prazo: formAtrib.prazo,
        observacao: formAtrib.observacao,
        solucionador_id: formAtrib.solucionador_id,
        proxima_atr_id: formAtrib.proxima_atr_id,
        proximo_resp_id: formAtrib.proximo_resp_id,
        horario: formAtrib.horario || null,
      };
  
      console.log("🟢 Criando atribuição:", payload);
      await createAtribuicaoEvento(payload);
  
      // 🔁 Recarrega o item atualizado (com parcelas se for acordo)
      let dadosAtualizados = null;
      if (entityType === "acordo") {
        dadosAtualizados = await fetchAcordoUnificadoById(entityId);
      const parcelasAtualizadas = await fetchModalParcelasByAcordoId(entityId);
      dadosAtualizados = {
          ...dadosAtualizados,
          parcelas: parcelasAtualizadas || [],
      };
      }
      if (entityType === "contrato") {
        dadosAtualizados = await fetchContratoById(entityId);
      }
      if (entityType === "processo") {
        dadosAtualizados = await fetchProcessoById(entityId);
      }

      setForm(dadosAtualizados);

      setFormAtrib({
        atribuicao_id: "",
        responsavel_id: "",
        solucionador_id: "",
        prazo: "",
        observacao: "",
      });
      setRightMode("visualizarAtrib");
  
      console.log("✅ Atribuição criada e dados recarregados!");
    } catch (err) {
      console.error("❌ Erro ao criar atribuição:", err);
    }
  };
  
  
  const handleEditarAtribuicao = async () => {
    if (!formAtrib?.atribuicao_id) {
      console.error("❌ Nenhum ID de atribuição encontrado.");
      return;
    }
  
    try {
      const entityId =
        form?.id || form?.acordo_id || form?.contrato_id || form?.processo_id;
  
      const payload = {
        entity_type: entityType || "acordo",
        entity_id: entityId,
        prazo: formAtrib.prazo,
        observacao: formAtrib.observacao,
        responsavel_id: formAtrib.responsavel_id,
        horario: formAtrib.horario || null,
      };
  
      console.log("🟡 Atualizando atribuição:", payload);
      await updateAtribuicaoEvento(formAtrib.atribuicao_id, payload);
  
      // 🔁 Recarrega dados atualizados (com parcelas se for acordo)
      let dadosAtualizados = null;
      if (entityType === "acordo") {
      dadosAtualizados = await fetchAcordoUnificadoById(entityId);
      const parcelasAtualizadas = await fetchModalParcelasByAcordoId(entityId);
      dadosAtualizados = {
          ...dadosAtualizados,
          parcelas: parcelasAtualizadas || [],
      };
      }
      if (entityType === "contrato") {
        dadosAtualizados = await fetchContratoById(entityId);
      }
      if (entityType === "processo") {
        dadosAtualizados = await fetchProcessoById(entityId);
      }

      setForm(dadosAtualizados);

      setRightMode("visualizarAtrib");
  
      console.log("✅ Atribuição atualizada com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao atualizar atribuição:", err);
    }
  };
  
  return (
    <div className="modalright-atribuicoes-content">
      <div className="modalright-atribuicoes-header">
        <div className="modalright-atribuicoes-tabs">
          <Button
            className="modalright-atribuicoes-tab-btn"
            variant={
              ["visualizarAtrib", "editarAtrib", "novaAtrib"].includes(rightMode)
                ? "default"
                : "outline"
            }
            onClick={() => setRightMode("visualizarAtrib")}
          >
            Atribuições
          </Button>

          {entityType === "contrato" && (
            <>
              <Button
                className="modalright-atribuicoes-tab-btn"
                variant={rightMode === "inicialContrato" ? "default" : "outline"}
                onClick={() => setRightMode("inicialContrato")}
              >
                Inicial
              </Button>
              <Button
                className="modalright-atribuicoes-tab-btn"
                variant={rightMode === "partes" ? "default" : "outline"}
                onClick={() => setRightMode("partes")}
              >
                Partes
              </Button>
            </>
          )}
        </div>
      </div>

      {rightMode === "visualizarAtrib" && (
        <div className="modalright-atribuicoes-body">
          <div className="modalright-atribuicoes-scroll">
            <ul className="modalright-atribuicoes-lista">
              {(() => {
                const { listaOrdenada, atual } = ordenarAtribuicoes(historicoAtribs);

                return listaOrdenada.map((a) => {
                  const isAtual = atual && atual.id === a.id;

                  return (
                    <li
                      key={a.id}
                      className={`modalright-atribuicoes-item agenda-atr-item cursor-pointer ${
                        isAtual ? "atual" : ""
                      }`}
                      onClick={() => {
                        setFormAtrib({
                          atribuicao_id: a.atribuicao_id,
                          atribuicao_descricao: a.atribuicao_descricao,
                          status_atual: a.atribuicao_descricao,
                          data_inicial: a.data_inicial,
                          prazo: a.prazo ?? "",
                          responsavel_id: a?.responsavel?.id ?? "",
                          observacao: a?.observacao ?? "",
                        });
                        setRightMode("editarAtrib");
                      }}
                    >
                      <div className="agenda-modal-right-texto">
                        <div className="atr-desc">{a.atribuicao_descricao}</div>
                        <div className="atr-lista">
                          <div className="modalright-atribuicoes-atr-linha">
                            <span className="modalright-atribuicoes-atr-label">Definida em</span>
                            <span className="modalright-atribuicoes-atr-valor">
                              {a.data_inicial
                                ? new Date(a.data_inicial).toLocaleDateString("pt-BR")
                                : "—"}
                            </span>
                          </div>
                          <div className="modalright-atribuicoes-atr-linha">
                            <span className="modalright-atribuicoes-atr-label">Prazo</span>
                            <span className="modalright-atribuicoes-atr-valor">
                              {a.prazo
                                ? new Date(a.prazo).toLocaleDateString("pt-BR")
                                : "—"}
                            </span>
                          </div>
                          <div className="modalright-atribuicoes-atr-linha">
                            <span className="modalright-atribuicoes-atr-label">Responsável</span>
                            <span className="modalright-atribuicoes-atr-valor">{a.responsavel?.nome || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                });
              })()}
            </ul>
          </div>

            {modo !== "visualizar" && (
                <div className="modalright-atribuicoes-footer">
                    <Button onClick={() => setRightMode("novaAtrib")}>
                        Próxima Atribuição
                    </Button>
                </div>
            )}
        </div>
      )}

      {rightMode === "editarAtrib" && (
        <div className="modalright-atribuicoes-body">
          <div className="agenda-modal-right-content form">
            <div className="agenda-atr-section">
              <h4 className="modalright-atribuicoes-section-title">Atribuição atual</h4>
              <div className="modalright-atribuicoes-atr-linha">
                <span className="modalright-atribuicoes-atr-label">Status Atual</span>
                <span className="modalright-atribuicoes-atr-valor">{formAtrib.atribuicao_descricao || "—"}</span>
              </div>
              <div className="modalright-atribuicoes-atr-linha">
                <span className="modalright-atribuicoes-atr-label">Definida em</span>
                <span className="modalright-atribuicoes-atr-valor">
                  {formAtrib.data_inicial
                    ? new Date(formAtrib.data_inicial).toLocaleDateString("pt-BR")
                    : "—"}
                </span>
              </div>
              <div className="modalright-atribuicoes-atr-linha">
                <span className="modalright-atribuicoes-atr-label">Tempo no Status</span>
                <span className="modalright-atribuicoes-atr-valor">
                  {formAtrib.data_inicial
                    ? `${Math.floor(
                        (new Date() - new Date(formAtrib.data_inicial)) /
                        (1000 * 60 * 60 * 24)
                      )} dias`
                    : "—"}
                </span>
              </div>
            </div>

            <LinhaInput label="Prazo">
              <Input
                type="date"
                className="modalright-atribuicoes-input input-editable"
                value={formAtrib.prazo || ""}
                onChange={(e) =>
                  setFormAtrib({ ...formAtrib, prazo: e.target.value })
                }
              />
            </LinhaInput>

            {entityType === "processo" && (
              <LinhaInput label="Horário Agendado">
                <Input
                  type="datetime-local"
                  className="modalright-atribuicoes-input input-editable"
                  value={formAtrib.horario || ""}
                  onChange={(e) =>
                    setFormAtrib({ ...formAtrib, horario: e.target.value })
                  }
                />
              </LinhaInput>
            )}

            <LinhaInput label="Responsável">
              <select
                className="modalright-atribuicoes-input input-editable"
                value={formAtrib.responsavel_id}
                onChange={(e) =>
                  setFormAtrib({ ...formAtrib, responsavel_id: e.target.value })
                }
              >
                <option value="">Selecione…</option>
                {colabs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </LinhaInput>

            <LinhaInput label="Observação">
              <textarea
                className="modalright-atribuicoes-textarea input-editable"
                rows={2}
                value={formAtrib.observacao || ""}
                onChange={(e) =>
                  setFormAtrib({ ...formAtrib, observacao: e.target.value })
                }
              />
            </LinhaInput>
          </div>

            {modo !== "visualizar" && (
                <div className="modalright-atribuicoes-footer">
                    <Button variant="secondary" onClick={() => setRightMode("visualizarAtrib")}>Cancelar</Button>
                    <Button onClick={handleEditarAtribuicao}>Atualizar</Button>
                </div>
            )}
        </div>
      )}

      {rightMode === "novaAtrib" && (
        <div className="modalright-atribuicoes-body">
          <div className="agenda-modal-right-content form">
            <h4 className="modalright-atribuicoes-section-title">Atribuição Atual</h4>

            <LinhaInput label="Solucionador">
              <select
                className="modalright-atribuicoes-input input-editable"
                value={formAtrib.solucionador_id}
                onChange={(e) =>
                  setFormAtrib({ ...formAtrib, solucionador_id: e.target.value })
                }
              >
                <option value="">Selecione…</option>
                {colabs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </LinhaInput>

            <h4 className="modalright-atribuicoes-section-title">Próxima Atribuição</h4>

            <LinhaInput label="Status">
              <select
                className="modalright-atribuicoes-input input-editable"
                value={formAtrib.proxima_atr_id}
                onChange={(e) =>
                  setFormAtrib({ ...formAtrib, proxima_atr_id: e.target.value })
                }
              >
                <option value="">Selecione…</option>
                {atribs.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.descricao}
                  </option>
                ))}
              </select>
            </LinhaInput>

            <LinhaInput label="Responsável">
              <select
                className="modalright-atribuicoes-input input-editable"
                value={formAtrib.proximo_resp_id}
                onChange={(e) =>
                  setFormAtrib({ ...formAtrib, proximo_resp_id: e.target.value })
                }
              >
                <option value="">Selecione…</option>
                {colabs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </LinhaInput>

            <LinhaInput label="Prazo">
              <Input
                type="date"
                className="modalright-atribuicoes-input input-editable"
                value={formAtrib.prazo || ""}
                onChange={(e) => setFormAtrib({ ...formAtrib, prazo: e.target.value })}
              />
            </LinhaInput>

            {entityType === "processo" && (
              <LinhaInput label="Horário Agendado">
                <Input
                  type="datetime-local"
                  className="modalright-atribuicoes-input input-editable"
                  value={formAtrib.horario || ""}
                  onChange={(e) =>
                    setFormAtrib({ ...formAtrib, horario: e.target.value })
                  }
                />
              </LinhaInput>
            )}
          </div>

            {modo !== "visualizar" && (
                <div className="modalright-atribuicoes-footer">
                    <Button variant="secondary" onClick={() => setRightMode("visualizarAtrib")}>Cancelar</Button>
                    <Button onClick={handleCriarAtribuicao}>Salvar</Button>
                </div>
            )}

        </div>
      )}
    </div>
  );
}
