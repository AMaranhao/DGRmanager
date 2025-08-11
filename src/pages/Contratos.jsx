// src/pages/Contratos.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogOverlay,
} from "@/components/ui/dialog";

import { fetchContratos, createContrato, updateContrato } from "@/services/ENDPOINTS_ServiceContratos";
import { fetchParteAdversa } from "@/services/ENDPOINTS_ServiceParteAdversa"; // GET /parte-adversa?termo=...


import { fetchAtribuicoesAcordo } from "@/services/ENDPOINTS_ServiceAtribuicoes";

import "@/styles/unified_styles.css";
import "@/styles/unified_refactored_styles.css";







const getCurrentEvento = (c) => {
  const evts = Array.isArray(c?.atribuicoes_evento) ? c.atribuicoes_evento : [];
  if (!evts.length) return null;

  // prioriza a data mais recente; se empatar, maior id
  return [...evts].sort((a, b) => {
    const da = a?.data_inicial ?? "";
    const db = b?.data_inicial ?? "";
    if (da && db && da !== db) return da > db ? 1 : -1;
    return (a?.id ?? 0) - (b?.id ?? 0);
  }).at(-1);
};

// normaliza texto: remove acentos e deixa minúsculo
const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();


    export default function Contratos() {
      const [lista, setLista] = useState([]);
      const [loading, setLoading] = useState(false);
    
      // filtros
      const [fStatus, setFStatus] = useState("");
      const [fLote, setFLote] = useState("");
    
      // modal
      const [modalAberto, setModalAberto] = useState(false);
      const [editando, setEditando] = useState(false);
      const salvarRef = useRef(null);
    
      // form contrato (lado esquerdo do modal)
      const [form, setForm] = useState({
        numero: "",
        valor: "",
        lote: "",
        observacao: "",
        atribId: "",
      });
    
      // lado direito do modal (partes vinculadas)
      const [partesVinculadas, setPartesVinculadas] = useState([]);
    
      // >>> estados do + Parte (PRECISAM estar aqui dentro) <<<
      const [showFormParte, setShowFormParte] = useState(false);
      const [fetchParte, setSearchParte] = useState("");
      const [foundParte, setFoundParte] = useState(null);
      const [fetchingParte, setSearchingParte] = useState(false);
      const [parteAviso, setParteAviso] = useState("");
      const [parteParaRemover, setParteParaRemover] = useState(null);
      const [visualizando, setVisualizando] = useState(false);
      // identifica o contrato aberto no modal
      const [contratoSelecionado, setContratoSelecionado] = useState(null);

      // histórico de atribuições (modo Detalhar)
      const [mostrarHistorico, setMostrarHistorico] = useState(false);
      const [historicoAtribs, setHistoricoAtribs] = useState([]);
      const [loadingHistorico, setLoadingHistorico] = useState(false);
      const [rightMode, setRightMode] = useState("partes");




  // ✅ Atribuições / status vindos da API
const [atribs, setAtribs] = useState([]);

// Mapa dinâmico: descrição longa -> rótulo curto
const statusOrder = useMemo(() => {
  return (atribs || []).map(a => a.descricao);
}, [atribs]);

// Helpers que dependem do status curto
const getStatus = (c) =>
  getCurrentEvento(c)?.atribuicao_descricao || "";

const getResponsavel = (c) =>
  getCurrentEvento(c)?.responsavel?.nome || "-";

useEffect(() => {
  if (modalAberto && !visualizando) {
    requestAnimationFrame(() => {
      salvarRef.current?.focus();
    });
  }
}, [modalAberto, visualizando]);


  // 1) Carrega as atribuições (status) uma única vez
useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const s = await fetchAtribuicoesAcordo();
      setAtribs(Array.isArray(s) ? s : []);
    } finally {
      setLoading(false);
    }
  })();
}, []);

// 2) Depois que as atribuições estiverem carregadas, carrega contratos e ordena
useEffect(() => {
  if (!atribs?.length) return;

  (async () => {
    setLoading(true);
    try {
      const data = await fetchContratos();

      const sorted = [...data].sort((a, b) => {
        const sa = getStatus(a);
        const sb = getStatus(b);
        const ia = statusOrder.indexOf(sa);
        const ib = statusOrder.indexOf(sb);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });

      setLista(sorted);
    } finally {
      setLoading(false);
    }
  })();
}, [statusOrder]);

  

const filtrados = useMemo(() => {
  const termo = norm(fLote);

  return lista.filter((c) => {
    // status exato
    const okStatus = fStatus ? getStatus(c) === fStatus : true;

    // busca livre (lote, nº contrato, responsável, status)
    const alvoLote    = norm(String(c.lote ?? ""));
    const alvoNumero  = norm(String(c.numero ?? ""));
    const alvoResp    = norm(getResponsavel(c));
    const alvoStatus  = norm(getStatus(c));

    const okTexto = termo
      ? (alvoLote.includes(termo) || alvoNumero.includes(termo) || alvoResp.includes(termo) || alvoStatus.includes(termo))
      : true;

    return okStatus && okTexto;
  });
}, [lista, fStatus, fLote]);


  const abrirNovo = () => {
    setShowFormParte(false);
    setSearchParte("");
    setFoundParte(null);
    setRightMode("partes");
    setParteAviso("");

    setEditando(false);
    setForm({ numero: "", valor: "", lote: "", observacao: "", atribId: "" });
    setPartesVinculadas([]);
    setModalAberto(true);
    setTimeout(() => salvarRef.current?.focus(), 0);
  };

  const abrirDetalhar = (c) => {
    setVisualizando(true);
    setShowFormParte(false);
    setSearchParte("");
    setFoundParte(null);
    setParteAviso("");
    setRightMode("partes");      
    setMostrarHistorico(false);
    setHistoricoAtribs([]);
    setEditando(false);
    setForm({
      numero: c.numero || "",
      valor: c.valor ?? "",
      lote: c.lote ?? "",
      observacao: c.observacao ?? "",
      atribId: getCurrentEvento(c)?.atribuicao_id ?? "",
    });
  
    setPartesVinculadas(c.partes || []);
    setContratoSelecionado(c);           // <<< guarda o contrato aberto
    setMostrarHistorico(false);          // reseta a seção de histórico
    setHistoricoAtribs([]);
  
    setModalAberto(true);
    requestAnimationFrame(() => document.activeElement.blur());
  };
  
  
  

  
  const abrirEditar = (c) => {
    setShowFormParte(false);
    setSearchParte("");
    setFoundParte(null);
    setParteParaRemover(null);
    setRightMode("partes");
    setParteAviso("");

    setEditando(true);
    setForm({
      numero: c.numero || "",
      valor: c.valor ?? "",
      lote: c.lote ?? "",
      observacao: c.observacao ?? "",
      atribId: getCurrentEvento(c)?.atribuicao_id ?? "",
    });
    setPartesVinculadas(c.partes || []);
    setModalAberto(true);
    setTimeout(() => salvarRef.current?.focus(), 0);
  };


  const carregarHistoricoAtribuicoes = async () => {
    if (!contratoSelecionado) return;
    setLoadingHistorico(true);
    try {
      // Usamos os eventos já presentes no contrato (atribuicoes_evento),
      // que você já utiliza para calcular o status atual.
      const eventos = Array.isArray(contratoSelecionado.atribuicoes_evento)
        ? contratoSelecionado.atribuicoes_evento
        : [];
  
      // ordena de forma crescente pela data e, em empate, pelo id
      const ordenados = [...eventos].sort((a, b) => {
        const da = a?.data_inicial ?? "";
        const db = b?.data_inicial ?? "";
        if (da && db && da !== db) return da < db ? -1 : 1; // crescente
        return (a?.id ?? 0) - (b?.id ?? 0);
      });
  
      setHistoricoAtribs(ordenados);
      setMostrarHistorico(true);
    } finally {
      setLoadingHistorico(false);
    }
  };
  


  const handleBuscarParte = async () => {
    const termo = fetchParte; // o que o usuário digitou (sem validação no front)
    const cpfDigits = (termo || "").replace(/\D/g, ""); // normaliza só pra comparar
  
    setParteAviso("");      // opcional, limpa aviso anterior
    setSearchingParte(true);
    try {
      const results = await fetchParteAdversa(termo); // backend decide como processar o termo
  
      // >>> MATCH SOMENTE POR CPF no JSON de resposta <<<
      const match =
        (results || []).find(
          (p) => ((p?.cpf || "").replace(/\D/g, "") === cpfDigits)
        ) || null;
  
      setFoundParte(match);
  
      if (!match) {
        setParteAviso("CPF não encontrado.");
      }
    } finally {
      setSearchingParte(false);
    }
  };
  
  const handleRemoverParte = (parte) => {
    // remove por id ou, se não tiver id, por CPF normalizado
    const onlyDigits = (s) => (s || "").replace(/\D/g, "");
    setPartesVinculadas((prev) =>
      prev.filter((p) => {
        const sameId = p.id && parte.id && p.id === parte.id;
        const sameCpf =
          onlyDigits(p.cpf) &&
          onlyDigits(parte.cpf) &&
          onlyDigits(p.cpf) === onlyDigits(parte.cpf);
        return !(sameId || sameCpf);
      })
    );
    // opcional: mostrar um aviso no próprio modal
    setParteAviso("Parte removida.");
  };
  
  
  const handleAdicionarParte = () => {
    if (!foundParte) return;
  
    const onlyDigits = (s) => (s || "").replace(/\D/g, "");
    const alvoCPF = onlyDigits(foundParte.cpf);
  
    const jaExiste = partesVinculadas.some((p) => {
      const cpfExistente = onlyDigits(p.cpf);
      if (alvoCPF && cpfExistente) return cpfExistente === alvoCPF;
      if (!alvoCPF && !cpfExistente && p.id && foundParte.id) return p.id === foundParte.id;
      return false;
    });
  
    if (jaExiste) {
      setParteAviso("Essa parte já está vinculada a este contrato.");
      return;
    }
  
    setPartesVinculadas((prev) => [
      ...prev,
      {
        id: foundParte.id,
        nome: foundParte.nome,
        cpf: foundParte.cpf,
        tipo_parte: foundParte.tipo_parte || "Réu",
      },
    ]);
  
    // reset e volta para lista
    setShowFormParte(false);
    setSearchParte("");
    setFoundParte(null);
    setParteParaRemover(null);
    setParteAviso(""); // limpar aviso após sucesso
  };
  
  


  const salvar = async () => {
    // TODO: montar payload final
    const payload = {
      numero: String(form.numero).trim(),
      valor: form.valor ? Number(form.valor) : null,
      lote: form.lote ? String(form.lote).trim() : null,
      observacao: form.observacao?.trim() || "",
      atrib_id: form.atribId || null,
      // partes_contrato viriam aqui quando formarmos o payload final
    };
    if (editando) {
      // você decide de onde vem o id (pode guardar o contrato selecionado num state)
      // await updateContrato(contratoSelecionado.id, payload);
    } else {
      // await createContrato(payload);
    }
    setModalAberto(false);
  };

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Contratos</h3>

      {/* Filtros */}
      <div className="usuarios-header">
        <div className="usuarios-filtros">
          <div className="dashboard-filtro-group">
            <select
              className="dashboard-select"
              value={fStatus}
              onChange={(e) => setFStatus(e.target.value)}
              title="Filtrar por status"
            >
              <option value="">Todos os Status</option>
              {(atribs || []).map((a) => (
                <option key={a.id} value={a.descricao}>
                  {a.descricao}
                </option>
              ))}

            </select>
          </div>

          <div className="dashboard-filtro-group">
            <Input
              className="dashboard-select dashboard-filtro-usuario-input"
              placeholder="Lote, Contrato ou Resp"
              value={fLote}
              onChange={(e) => setFLote(e.target.value)}
            />
          </div>
        </div>

        <Dialog open={modalAberto} onOpenChange={(open) => {
            setModalAberto(open);
            if (!open) {
              setVisualizando(false);
              setRightMode("partes");
            }
          }}>
          <DialogOverlay className="dialog-overlay" />
          <DialogTrigger asChild>
            <Button
              className="usuarios-btn-material"
              onClick={(e) => {
                e.currentTarget.blur();
                abrirNovo();
              }}
            >
              <Plus size={16} /> Novo Contrato
            </Button>
          </DialogTrigger>

          <DialogContent
              className="contratos-modal contratos-modal-no-close contratos-split-modal"
              onOpenAutoFocus={(e) => {
                if (visualizando) {
                  e.preventDefault();               // impede o foco automático do Radix
                  requestAnimationFrame(() => {
                    document.activeElement?.blur(); // garante que nada fique focado
                  });
                }
              }}
          >
            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

            <div className="contratos-split-modal-left">
              <DialogTitle>
                {visualizando ? "Detalhar Contrato" : editando ? "Editar Contrato" : "Novo Contrato"}
              </DialogTitle>
              <DialogDescription className="contratos-modal-descricao">
                Preencha os dados do contrato.
              </DialogDescription>

              <div className="contratos-input-wrapper">
                <label className="contratos-input-label">Número</label>
                <Input
                  className="contratos-modal-input"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  readOnly={visualizando}
                />
              </div>

              <div className="contratos-input-wrapper">
                <label className="contratos-input-label">Valor</label>
                <Input
                  className="contratos-modal-input"
                  type="number"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  readOnly={visualizando}
                />
              </div>

              <div className="contratos-input-wrapper">
                <label className="contratos-input-label">Lote</label>
                <Input
                  className="contratos-modal-input"
                  value={form.lote}
                  onChange={(e) => setForm({ ...form, lote: e.target.value })}
                  readOnly={visualizando}
                />
              </div>

              <div className="contratos-input-wrapper">
                <label className="contratos-input-label">Observação</label>
                <Input
                  className="contratos-modal-input"
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  readOnly={visualizando}
                />
              </div>

              <div className="contratos-input-wrapper">
                <label className="contratos-input-label">Atribuição (status)</label>
                <select
                  className="usuarios-modal-select"
                  value={form.atribId}
                  onChange={(e) => setForm({ ...form, atribId: e.target.value ? Number(e.target.value) : "" })}
                  disabled={visualizando}
                >
                  <option value="">Selecione…</option>
                  {(atribs || []).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.descricao}
                    </option>
                  ))}
                </select>
              </div>

              {!visualizando && (
              <div className="botao-salvar-bottom">
                <Button ref={salvarRef} onClick={salvar}>Salvar</Button>
              </div>
              )}
            </div>

            <div className="contratos-split-modal-right">
              {/* Cabeçalho com título dinâmico + botão de alternância (somente no Detalhar) */}
              <div className="flex items-center justify-between">
                <h5>{rightMode === "historico" ? "Histórico de Atribuições" : "Partes vinculadas"}</h5>

                {visualizando && (
                  <Button
                    variant="secondary"
                    className="botao-adicionar-contrato"
                    onClick={async () => {
                      if (rightMode === "partes") {
                        // entrando no histórico: carrega se ainda não carregou
                        if (!mostrarHistorico) {
                          await carregarHistoricoAtribuicoes();
                        }
                        setRightMode("historico");
                      } else {
                        // voltando para Partes
                        setRightMode("partes");
                      }
                    }}
                  >
                    {rightMode === "partes" ? "Atribuições" : "Partes"}
                  </Button>
                )}
              </div>

              {/* Conteúdo do painel direito */}
              {rightMode === "historico" ? (
                // ======= MODO HISTÓRICO =======
                <ul className="contratos-modal-right-lista" style={{ marginTop: "0.75rem" }}>
                  {loadingHistorico && <li>Carregando histórico…</li>}
                  {!loadingHistorico && historicoAtribs.length === 0 && (
                    <li>Nenhuma atribuição encontrada.</li>
                  )}
                  {!loadingHistorico &&
                    historicoAtribs.map((evt) => {
                      const dt = evt?.data_inicial ? new Date(evt.data_inicial) : null;
                      const dataStr = dt ? dt.toLocaleDateString("pt-BR") : "—";
                      const desc = evt?.atribuicao_descricao || "—";
                      const resp = evt?.responsavel?.nome || "—";
                      return (
                        <li key={evt.id ?? `${evt.data_inicial}-${desc}`}>
                          {dataStr} — {desc} — Responsável: {resp}
                        </li>
                      );
                    })}
                </ul>
              ) : (
                // ======= MODO PARTES =======
                <>
                  {showFormParte && !visualizando ? (
                    // ===== Form de busca de Parte já existente =====
                    <div className="parte-contrato-modal">
                      <div className="editable-input-wrapper">
                        <label className="usuarios-label">CPF</label>
                        <Input
                          className="usuarios-modal-input"
                          value={fetchParte}
                          onChange={(e) => setSearchParte(e.target.value)}
                          placeholder="Digite o CPF"
                        />
                      </div>

                      <div className="non-editable-input-wrapper">
                        <label className="usuarios-label">Nome</label>
                        <Input
                          className="usuarios-modal-input"
                          value={foundParte?.nome || ""}
                          readOnly
                          placeholder="—"
                        />
                      </div>

                      <div className="non-editable-input-wrapper">
                        <label className="usuarios-label">CPF</label>
                        <Input
                          className="usuarios-modal-input"
                          value={foundParte?.cpf || ""}
                          readOnly
                          placeholder="—"
                        />
                      </div>

                      {parteAviso && (
                        <div
                          className="dashboard-modal-error"
                          style={{ margin: "0.5rem 0 0.25rem 0" }}
                        >
                          {parteAviso}
                        </div>
                      )}

                      {/* Ações do formulário de Parte */}
                      <div className="botao-adicionar-contrato">
                        {!parteParaRemover ? (
                          <>
                            <Button onClick={handleBuscarParte} disabled={fetchingParte}>
                              {fetchingParte ? "Buscando..." : "Buscar"}
                            </Button>
                            {foundParte && (
                              <Button className="ml-2" onClick={handleAdicionarParte}>
                                Adicionar
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            variant="destructive"
                            onClick={() => {
                              handleRemoverParte(parteParaRemover);
                              setShowFormParte(false);
                              setFoundParte(null);
                              setParteParaRemover(null);
                            }}
                          >
                            Remover
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="ml-2"
                          onClick={() => {
                            setShowFormParte(false);
                            setSearchParte("");
                            setFoundParte(null);
                            setParteParaRemover(null);
                            setParteAviso("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // ===== Lista de Partes =====
                    <>
                      {partesVinculadas?.length ? (
                        <ul className="contratos-modal-right-lista">
                          {partesVinculadas.map((p) => (
                            <li
                              key={p.id ?? p.cpf}
                              className="contratos-modal-right-item"
                              onClick={
                                visualizando
                                  ? undefined
                                  : () => {
                                      setFoundParte(p);
                                      setSearchParte("");
                                      setParteParaRemover(p);
                                      setShowFormParte(true);
                                      setParteAviso("");
                                    }
                              }
                              style={{ cursor: visualizando ? "default" : "pointer" }}
                              title={visualizando ? undefined : "Clique para remover"}
                            >
                              <div className="contratos-modal-right-texto">
                                <div>{p.nome}</div>
                                <div className="text-xs text-gray-500">
                                  {p.cpf ? `CPF: ${p.cpf}` : p.tipo_parte}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Nenhuma parte vinculada ainda.</p>
                      )}

                      {/* + Parte só aparece em Novo/Editar */}
                      {!visualizando && (
                        <Button
                          className="botao-adicionar-contrato"
                          onClick={() => setShowFormParte(true)}
                        >
                          + Parte
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </DialogContent>

        </Dialog>
      </div>

      {/* Tabela */}
      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela contratos-tabela">
          <thead>
            <tr>
              <th className="col-numero">Número</th>
              <th className="col-valor">Valor</th>
              <th className="col-status">Status</th>
              <th className="col-responsavel">Responsável</th>
              <th className="col-lote">Lote</th>
              <th className="col-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Carregando…</td></tr>
            ) : filtrados.length ? (
              filtrados.map((c) => (
                <tr key={c.id}>
                  <td className="col-numero">{c.numero}</td>
                  <td className="col-valor">{Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="col-status">{getStatus(c)}</td>
                  <td className="col-responsavel">{getResponsavel(c)}</td>
                  <td className="col-lote">{c.lote ?? "-"}</td>
                  <td className="col-acoes">
                    <Button
                      variant="secondary"
                      className="ml-2"
                      onClick={(e) => { e.currentTarget.blur(); abrirEditar(c); }}
                    >
                      <Pencil size={16} className="mr-1" />Editar
                    </Button>
                    <Button
                      variant="outline"
                      className="ml-2"
                      onClick={(e) => { e.currentTarget.blur(); abrirDetalhar(c); }}
                      >
                      <Eye size={16} className="mr-1" />Detalhar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6}>Nenhum contrato encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
