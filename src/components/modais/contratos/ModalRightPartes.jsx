// src/components/modais/contratos/ModalRightPartes.jsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import "./styles.css";

export default function ModalRightPartes({
  contratoSelecionado,
  partesVinculadas,
  rightMode,
  setRightMode,
  setPartesVinculadas,
  visualizando,
  showFormParte,
  setShowFormParte,
  fetchParte,
  setFetchParte,
  foundParte,
  setFoundParte,
  parteAviso,
  setParteAviso,
  parteParaRemover,
  setParteParaRemover,
  handleBuscarParte,
  handleAdicionarParte,
  handleRemoverParte,
  parteEditando,
  setParteEditando,
  parteEncontrada,
  setParteEncontrada,
  modo,
}) {
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

        <div className="modalright-partes-scroll form">
            {showFormParte ? (
                <div className="parte-contrato-modal">
                {parteEditando ? (
                    <>
                    <div className="non-editable-input-wrapper">
                        <label className="usuarios-label">Nome</label>
                        <Input className="usuarios-modal-input input-readonly" value={parteEditando.nome} readOnly />
                    </div>
                    <div className="non-editable-input-wrapper">
                        <label className="usuarios-label">CPF</label>
                        <Input className="usuarios-modal-input input-readonly" value={parteEditando.cpf} readOnly />
                        <div className="checkbox-wrapper">
                        <label className="flex items-center gap-2">
                            <input
                            type="checkbox"
                            checked={parteEditando?.principal || parteEncontrada?.principal || false}
                            onChange={(e) => {
                                if (parteEditando) {
                                setParteEditando({ ...parteEditando, principal: e.target.checked });
                                } else if (parteEncontrada) {
                                setParteEncontrada({ ...parteEncontrada, principal: e.target.checked });
                                }
                            }}
                            />
                            Parte Principal
                        </label>
                        </div>
                    </div>
                    </>
                ) : (
                    <>
                    <div className="editable-input-wrapper">
                        <label className="usuarios-label">CPF</label>
                        <Input
                        className="usuarios-modal-input input-editable"
                        value={fetchParte}
                        onChange={(e) => setFetchParte(e.target.value)}
                        placeholder="Digite o CPF"
                        />
                    </div>

                    <div className="non-editable-input-wrapper">
                        <label className="usuarios-label">Nome</label>
                        <Input
                        className="usuarios-modal-input input-readonly"
                        value={parteEncontrada?.nome || ""}
                        readOnly
                        placeholder="—"
                        />
                    </div>

                    <div className="checkbox-wrapper">
                        <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={parteEditando?.principal || parteEncontrada?.principal || false}
                            onChange={(e) => {
                            if (parteEditando) {
                                setParteEditando({ ...parteEditando, principal: e.target.checked });
                            } else if (parteEncontrada) {
                                setParteEncontrada({ ...parteEncontrada, principal: e.target.checked });
                            }
                            }}
                        />
                        Parte Principal
                        </label>
                    </div>
                    </>
                )}

                {parteAviso && (
                    <div className="dashboard-modal-error" style={{ margin: "0.5rem 0" }}>
                    {parteAviso}
                    </div>
                )}
                </div>
            ) : (
                <ul>
                {partesVinculadas?.length ? (
                    partesVinculadas.map((p) => (
                    <li
                        key={p.id ?? p.cpf}
                        onClick={() => {
                        setParteEditando(p);
                        setShowFormParte(true);
                        }}
                        className={`agenda-modal-right-item ${p.principal ? "atual" : ""}`}
                    >
                        <div className="contratos-modal-right-texto">
                        <div className={p.principal ? "font-bold" : ""}>{p.nome}</div>
                        <div className="text-xs text-gray-500">
                            {p.cpf ? `CPF: ${p.cpf}` : p.tipo_parte}
                        </div>
                        </div>
                    </li>
                    ))
                ) : (
                    <p>Nenhuma parte vinculada ainda.</p>
                )}
                </ul>
            )}

            
        </div>
        <div className="agenda-btn-modal-right-footer">
                {parteEditando ? (
                <>
                    <Button variant="destructive" onClick={handleRemoverParte}>Remover</Button>
                    <Button
                    onClick={() => {
                        setPartesVinculadas(prev =>
                        prev.map(parte =>
                            parte.id === parteEditando.id ? parteEditando : parte
                        )
                        );
                        setShowFormParte(false);
                        setParteEditando(null);
                    }}
                    >
                    Atualizar
                    </Button>
                    <Button
                    variant="outline"
                    onClick={() => {
                        setShowFormParte(false);
                        setParteEditando(null);
                    }}
                    >
                    Cancelar
                    </Button>
                </>
                ) : parteEncontrada ? (
                <>
                    <Button onClick={handleAdicionarParte}>Salvar</Button>
                    <Button onClick={handleBuscarParte}>Buscar</Button>
                    <Button
                    variant="outline"
                    onClick={() => {
                        setShowFormParte(false);
                        setFetchParte("");
                        setParteEncontrada(null);
                        setParteEditando(null);
                        setParteAviso("");
                    }}
                    >
                    Cancelar
                    </Button>
                </>
                ) : showFormParte ? (
                <>
                    <Button onClick={handleBuscarParte}>Buscar</Button>
                    <Button
                    variant="outline"
                    onClick={() => {
                        setShowFormParte(false);
                        setFetchParte("");
                        setParteEncontrada(null);
                    }}
                    >
                    Cancelar
                    </Button>
                </>
                ) : (
                <>
                    <Button
                    onClick={() => {
                        setShowFormParte(true);
                        setParteAviso("");
                        setParteEditando(null);
                        setParteEncontrada(null);
                    }}
                    >
                    + Parte
                    </Button>
                </>
                )}
            </div>
    </div>
  );
}
