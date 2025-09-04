// src/pages/Acordos.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogOverlay,
} from "@/components/ui/dialog";

import {
  fetchAcordosUnificados,
  fetchAcordos,
  updateAcordo,
} from "@/services/ENDPOINTS_ServiceAcordos";

import {
  fetchParcelasAcordo,
} from "@/services/ENDPOINTS_ServiceParcelasAcordo";

import {
  fetchPagamentosAcordo,
} from "@/services/ENDPOINTS_ServiceAcordoPagamento";

import {
  fetchAtribuicoesAcordo,
} from "@/services/ENDPOINTS_ServiceAtribuicoes";

import {
  createAtribuicaoEvento,
} from "@/services/ENDPOINTS_ServiceAtribuicaoEvento";


import { fetchColaboradores } from "@/services/ENDPOINTS_ServiceColaboradores";

import "@/styles/unified_styles.css";
import "@/styles/unified_refactored_styles.css";

const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();


    
export default function Acordos() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [visualizando, setVisualizando] = useState(false);
  const [editando, setEditando] = useState(false);
  const salvarRef = useRef(null);

  const [fStatus, setFStatus] = useState("");
  const [fBusca, setFBusca] = useState("");

  const [acordoSelecionado, setAcordoSelecionado] = useState(null);
  const [form, setForm] = useState({});

  const [rightMode, setRightMode] = useState("visualizarAtrib");
  const [atribs, setAtribs] = useState([]);
  const [colabs, setColabs] = useState([]);
  const [historicoAtribs, setHistoricoAtribs] = useState([]);
  const [formAtrib, setFormAtrib] = useState({
    atribuicao_id: "",
    responsavel_id: "",
    solucionador_id: "",
    prazo: "",
    observacao: ""
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const resposta = await fetchAcordosUnificados();

          setLista(Array.isArray(resposta.acordos) ? resposta.acordos : []);
          setAtribs(Array.isArray(resposta.atribuicoes) ? resposta.atribuicoes : []);
          setColabs(Array.isArray(resposta.colaboradores) ? resposta.colaboradores : []);

      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtrados = useMemo(() => {
    const termo = norm(fBusca);
    return lista.filter((a) => {
      const parte = norm(a.parte_adversa?.nome);
      const contrato = norm(a.contrato?.numero);
      const status = norm(a.status);
      return termo ? parte.includes(termo) || contrato.includes(termo) || status.includes(termo) : true;
    });
  }, [lista, fBusca]);

  const abrirDetalhar = async (acordo) => {
    setVisualizando(true);
    setEditando(false);
    setRightMode("visualizarAtrib");
    try {
      const dados = await fetchAcordo(acordo.acordo_id);
      setAcordoSelecionado(dados);
      setForm(dados);
      setModalAberto(true);
    } catch (err) {
      console.error("Erro ao buscar acordo:", err);
    }
  };

  const abrirEditar = async (acordo) => {
    setVisualizando(false);
    setEditando(true);
    setRightMode("visualizarAtrib");
    try {
      const dados = await fetchAcordo(acordo.acordo_id);
      setAcordoSelecionado(dados);
      setForm(dados);
      setModalAberto(true);
    } catch (err) {
      console.error("Erro ao buscar acordo:", err);
    }
  };

  const salvar = async () => {
    if (!acordoSelecionado?.acordo_id) return;
    try {
      await updateAcordo(acordoSelecionado.acordo_id, form);
      const atualizados = await fetchAcordosUnificados();
      setLista(atualizados);
      setModalAberto(false);
    } catch (err) {
      console.error("Erro ao atualizar acordo:", err);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Acordos</h3>

      {/* Filtros */}
      <div className="usuarios-header">
        <Input
          className="dashboard-select dashboard-filtro-usuario-input"
          placeholder="Parte, Contrato ou Status"
          value={fBusca}
          onChange={(e) => setFBusca(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela">
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Parte Adversa</th>
              <th>Telefone</th>
              <th>Último Pagamento</th>
              <th>Parcela em Aberto</th>
              <th>Valor Residual</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}>Carregando…</td></tr>
            ) : filtrados.length ? (
              filtrados.map((a) => (
                <tr key={a.acordo_id}>
                  <td>{a.contrato?.numero}</td>
                  <td>{a.parte_adversa?.nome}</td>
                  <td>{a.telefone}</td>
                  <td>{a.ultimo_pagamento || "—"}</td>
                  <td>{a.parcela_em_aberto?.numero}</td>
                  <td>{a.valor_residual?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td>
                    <div className="table-actions">
                      <Button variant="secondary" onClick={() => abrirEditar(a)}>✏️ Editar</Button>
                      <Button variant="outline" onClick={() => abrirDetalhar(a)}>👁️ Detalhar</Button>
                      <Button variant="default" onClick={() => console.log("Atualizar", a.acordo_id)}>🔄 Atualizar</Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7}>Nenhum acordo encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: a ser expandido nas próximas etapas */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogOverlay className="dialog-overlay" />
        <DialogContent>
          <DialogTitle>{visualizando ? "Detalhar Acordo" : "Editar Acordo"}</DialogTitle>
          <DialogDescription>Modal ainda em construção.</DialogDescription>
          {!visualizando && <Button onClick={salvar}>Salvar</Button>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
