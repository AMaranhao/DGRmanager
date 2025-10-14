// src/components/modais/acordos/ModalAcordoCompleto.jsx


import { useEffect, useState } from "react";

import { fetchAcordoUnificadoById } from "@/services/ENDPOINTS_ServiceAcordos";
import { fetchColaboradores } from "@/services/ENDPOINTS_ServiceColaboradores";
import { fetchAtribuicoesAcordo } from "@/services/ENDPOINTS_ServiceAtribuicoes";

import ModalLeftAcordo from "./ModalLeftAcordo";
import ModalLeftParcelas from "./ModalLeftParcelas";
import ModalRightParcelas from "./ModalRightParcelas";
import ModalRightAtribuicoes from "../atribuicoes/ModalRightAtribuicoes";

export default function ModalAcordoCompleto({ 
  form, 
  setForm, 
  modo, 
  rightMode,
  setRightMode
}) {
  const [colaboradores, setColaboradores] = useState([]);
  const [historicoAtribs, setHistoricoAtribs] = useState([]);
  const [formAtrib, setFormAtrib] = useState({});
  const [tiposAtribuicao, setTiposAtribuicao] = useState([]);

  useEffect(() => {
    if (modo !== "criar" && form?.id) {
      fetchAcordoUnificadoById(form.id)
        .then((data) => {
          setForm(data);
          setHistoricoAtribs(data.atribuicoes_evento || []);
        })
        .catch(console.error);
    }
  }, [form?.id, modo]);

  useEffect(() => {
    fetchColaboradores().then(setColaboradores).catch(console.error);
    fetchAtribuicoesAcordo().then(setTiposAtribuicao).catch(console.error);
  }, []);

  return (
    <div className="acordo-split-modal">
      {/* LADO ESQUERDO */}
      <div className="acordo-split-left">
        {rightMode?.startsWith("parcelas") ? (
          <ModalLeftParcelas 
            form={form}
            setForm={setForm}
            modo={modo}
            setRightMode={setRightMode}
          />
        ) : (
          <ModalLeftAcordo 
            form={form}
            setForm={setForm}
            modo={modo}
          />
        )}
      </div>
  
      {/* LADO DIREITO */}
      <div className="acordo-split-right">
        {rightMode?.startsWith("parcelas") ? (
          <ModalRightParcelas 
            form={form}
            setForm={setForm}
            modo={modo}
            rightMode={rightMode}
            setRightMode={setRightMode}
          />
        ) : (
          <ModalRightAtribuicoes
            rightMode={rightMode}
            setRightMode={setRightMode}
            atribs={form?.atribuicoes_evento || []}
            colabs={colaboradores}
            historicoAtribs={historicoAtribs}
            formAtrib={formAtrib}
            setFormAtrib={setFormAtrib}
            entityType="acordo"
            form={form}
            setForm={setForm}
            modo={modo}
            tiposAtribuicao={tiposAtribuicao}
          />
        )}
      </div>
    </div>
  );
  
  
}
