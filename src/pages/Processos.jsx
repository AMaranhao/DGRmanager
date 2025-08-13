// src/pages/Processos.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogOverlay,
} from "@/components/ui/dialog";

import {
  fetchProcessos,
  fetchProcessoById,
  createProcesso,
  updateProcesso,
  deleteProcesso,
  createParteAoProcesso,
  removeParteDoProcesso,
  fetchAndamentos,
} from "@/services/ENDPOINTS_ServiceProcessos";
import { fetchAtribuicoesProcesso } from "@/services/ENDPOINTS_ServiceAtribuicoes";

import "@/styles/unified_styles.css";
import "@/styles/unified_refactored_styles.css";

// normaliza para busca local
const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

function toYMD(raw) {
  if (!raw) return "";
  if (typeof raw === "string") {
    const s = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      return `${yyyy}-${mm}-${dd}`;
    }
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString().split("T")[0];
    return "";
  }
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw.toISOString().split("T")[0];
  }
  return "";
}

function haystackTexto(proc) {
  const numero = (proc?.numero ?? proc?.numero_cnj ?? "").toString();
  const comarca = (proc?.comarca ?? "").toString();
  const partesTxt = (proc?.contrato?.partes || [])
    .map(p => `${p?.nome || ""} ${(p?.cpf || "").replace(/\D/g, "")}`)
    .join(" ");
  return norm(`${numero} ${comarca} ${partesTxt}`);
}

function getPartePrincipal(proc) {
  const partes = proc?.contrato?.partes || [];
  const autor = partes.find(p => /^(autor(a)?)$/i.test(p?.tipo_parte || ""));
  return autor || partes[0] || null;
}

function fmtDM(raw) {
  const ymd = toYMD(raw);
  if (!ymd) return "-";
  const [yyyy, mm, dd] = ymd.split("-");
  return `${dd}/${mm}`;
}

export default function Processos() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

  // filtros (client-side)
  const [fTexto, setFTexto] = useState("");
  const [fResp, setFResp] = useState("");
  const [fDataIni, setFDataIni] = useState("");
  const [fDataFim, setFDataFim] = useState("");

  const [fStatus, setFStatus] = useState("");
  const [atribs, setAtribs] = useState([]);

  // modal
  const [modalAberto, setModalAberto] = useState(false);
  const [visualizando, setVisualizando] = useState(false);
  const [editando, setEditando] = useState(false);
  const salvarRef = useRef(null);

  // formulário do processo
  const [form, setForm] = useState({
    numero: "",
    cliente: "",
    contrato_id: "",
    contrato_numero: "", 
    funcionario_id: "",
    data_distribuicao: "",
    data_publicacao: "",
    comarca: "",
    prazo_juridico: "",
    prazo_interno: "",
    prazo_fatal: "",
    observacao: ""
  });

  const [processoSel, setProcessoSel] = useState(null);

  // lado direito
  const [rightMode, setRightMode] = useState("partes"); // "partes" | "andamentos"
  const [partes, setPartes] = useState([]);
  const [andamentos, setAndamentos] = useState([]);
  const [erroModal, setErroModal] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const dados = await fetchProcessos();
        setLista(Array.isArray(dados) ? dados : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAtribuicoesProcesso();
        setAtribs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Falha ao carregar atribuições:", e);
        setAtribs([]);
      }
    })();
  }, []);

  const filtrados = useMemo(() => {
    const txt = norm(fTexto);
    const resp = norm(fResp);
    const status = norm(fStatus);

    return (lista || []).filter((p) => {
      const alvoTexto = haystackTexto(p);
      const okTexto = txt ? alvoTexto.includes(txt) : true;

      const alvoResp = norm(p?.responsavel_atual?.nome ?? p?.responsavel?.nome ?? "");
      const okResp = resp ? alvoResp.includes(resp) : true;

      const alvoStatus = norm(p?.status_atual ?? "");
      const okStatus = status ? alvoStatus === status : true;

      const prazoYMD = toYMD(p?.prazo_interno);
      const iniYMD   = toYMD(fDataIni);
      const fimYMD   = toYMD(fDataFim);

      const okData =
        (iniYMD ? prazoYMD >= iniYMD : true) &&
        (fimYMD ? prazoYMD <= fimYMD : true);

      return okTexto && okResp && okStatus && okData;
    });
  }, [lista, fTexto, fResp, fStatus, fDataIni, fDataFim]);

  // ===== Aberturas de modal =====
  const abrirNovo = () => {
    setVisualizando(false);
    setEditando(false);
    setRightMode("partes");
    setErroModal("");
    setProcessoSel(null);
    setForm({
      numero: "",
      cliente: "",
      contrato_id: "",
      contrato_numero: "",
      funcionario_id: "",
      data_distribuicao: "",
      data_publicacao: "",
      comarca: "",
      prazo_juridico: "",
      prazo_interno: "",
      prazo_fatal: "",
      observacao: "",
    });
    setPartes([]);
    setAndamentos([]);
    setModalAberto(true);
    setTimeout(() => salvarRef.current?.focus(), 0);
  };

  const popularFormDoBackend = (data) => {
    setForm({
      numero: data.numero ?? data.numero_cnj ?? "",
      cliente: data.cliente ?? "",
      contrato_id: data.contrato_id ?? data?.contrato?.id ?? "",
      contrato_numero: data?.contrato?.numero ?? "",
      funcionario_id: data.funcionario_id ?? "",
      data_distribuicao: data.data_distribuicao ?? "",
      data_publicacao: data.data_publicacao ?? "",
      comarca: data.comarca ?? "",
      prazo_juridico: data.prazo_juridico ?? "",
      prazo_interno: toYMD(data.prazo_interno) ?? "",
      prazo_fatal: data.prazo_fatal ?? "",
      observacao: data.observacao ?? "",
    });
    setPartes((data?.contrato?.partes) || []);
    setAndamentos(Array.isArray(data?.atribuicoes_evento) ? data.atribuicoes_evento : []);
  };

  const abrirDetalhar = async (id) => {
    try {
      setErroModal("");
      const data = await fetchProcessoById(id);
      setProcessoSel(data);
      popularFormDoBackend(data);
      const movs = await fetchAndamentos(id).catch(() => []);
      setAndamentos(Array.isArray(movs) ? movs : []);
      setVisualizando(true);
      setEditando(false);
      setRightMode("partes");
      setModalAberto(true);
      requestAnimationFrame(() => document.activeElement?.blur());
    } catch (e) {
      console.error(e);
      setErroModal("Erro ao carregar o processo.");
      setModalAberto(true);
    }
  };

  const abrirEditar = async (id) => {
    try {
      setErroModal("");
      const data = await fetchProcessoById(id);
      setProcessoSel(data);
      popularFormDoBackend(data);
      const movs = await fetchAndamentos(id).catch(() => []);
      setAndamentos(Array.isArray(movs) ? movs : []);
      setVisualizando(false);
      setEditando(true);
      setRightMode("partes");
      setModalAberto(true);
      setTimeout(() => salvarRef.current?.focus(), 0);
    } catch (e) {
      console.error(e);
      setErroModal("Erro ao carregar o processo.");
      setModalAberto(true);
    }
  };

  // ===== Persistência =====
  // ===== Persistência =====
const salvar = async () => {
  setErroModal("");
  try {
    // Monta o payload sem contrato_numero (somente contrato_id + demais campos)
    const { contrato_numero, contrato_id, ...rest } = form;

    // Se quiser garantir número (caso usuário digite texto no campo do contrato):
    const payload = {
      ...rest,
      contrato_id: contrato_id ? Number(contrato_id) : undefined,
    };

    if (editando && processoSel?.id) {
      await updateProcesso(processoSel.id, payload);
    } else {
      const created = await createProcesso(payload);
      const newId = created?.id;

      // Vincula partes somente se houver
      if (newId && partes?.length) {
        for (const p of partes) {
          try {
            await createParteAoProcesso(newId, {
              cpf: p.cpf,
              nome: p.nome,
              tipo_parte: p.tipo_parte || "Autor",
            });
          } catch (e) {
            console.error("Erro ao vincular parte:", e);
          }
        }
      }
    }

    setModalAberto(false);

    // Recarrega lista
    setLoading(true);
    const dados = await fetchProcessos();
    setLista(Array.isArray(dados) ? dados : []);
    setLoading(false);
  } catch (e) {
    console.error(e);
    setErroModal("Falha ao salvar. Verifique os campos obrigatórios.");
  }
};


  // ===== UI helpers =====
  const LinhaInput = ({ label, children }) => (
    <div className="processo-input-wrapper">
      <label className="processo-label">{label}</label>
      {children}
    </div>
  );

  // buffer p/ adicionar parte no modo "novo"
  const [parteCPF, setParteCPF] = useState("");
  const [parteNome, setParteNome] = useState("");
  const [parteTipo, setParteTipo] = useState("Autor");

  const adicionarParte = async () => {
    if (!parteCPF || !parteNome) {
      setErroModal("Informe CPF e Nome.");
      return;
    }
    if (editando && processoSel?.id) {
      try {
        const res = await createParteAoProcesso(processoSel.id, {
          cpf: parteCPF, nome: parteNome, tipo_parte: parteTipo,
        });
        const pid = res?.id ?? crypto.randomUUID();
        setPartes((prev) => [...prev, { id: pid, cpf: parteCPF, nome: parteNome, tipo_parte: parteTipo }]);
        setParteCPF(""); setParteNome(""); setParteTipo("Autor");
        setErroModal("");
      } catch {
        setErroModal("Não foi possível adicionar a parte agora.");
      }
      return;
    }
    setPartes((prev) => [...prev, { id: crypto.randomUUID(), cpf: parteCPF, nome: parteNome, tipo_parte: parteTipo }]);
    setParteCPF(""); setParteNome(""); setParteTipo("Autor");
    setErroModal("");
  };

  const removerParte = async (p) => {
    if (editando && processoSel?.id && p?.id) {
      try {
        await removeParteDoProcesso(processoSel.id, p.id);
        setPartes((prev) => prev.filter((x) => x.id !== p.id));
      } catch {
        setErroModal("Falha ao remover a parte.");
      }
      return;
    }
    setPartes((prev) => prev.filter((x) => x.id !== p.id));
  };

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Processos</h3>

      {/* Filtros (estilo Contratos.jsx) */}
      <div className="usuarios-header">
        <div className="usuarios-filtros">
          {/* Input combinado: CNJ, Parte, Comarca */}
          <div className="dashboard-filtro-group" style={{ position: "relative" }}>
            <Input
              className="dashboard-select dashboard-filtro-usuario-input"
              placeholder="CNJ, Parte ou Comarca"
              value={fTexto}
              onChange={(e) => setFTexto(e.target.value)}
              title="Busca por CNJ, Parte ou Comarca"
            />
            {fTexto && (
              <button
                onClick={() => setFTexto("")}
                className="dashboard-filtro-clear"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Responsável */}
          <div className="dashboard-filtro-group" style={{ position: "relative" }}>
            <Input
              className="dashboard-select dashboard-filtro-usuario-input"
              placeholder="Responsável"
              value={fResp}
              onChange={(e) => setFResp(e.target.value)}
              title="Buscar por responsável"
            />
            {fResp && (
              <button
                onClick={() => setFResp("")}
                className="dashboard-filtro-clear"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status (select vindo de atribuições) */}
          <div className="dashboard-filtro-group" style={{ position: "relative" }}>
            <select
              className="dashboard-select"
              value={fStatus}
              onChange={(e) => setFStatus(e.target.value)}
              title="Filtrar por status"
            >
              <option value="">Todos os Status</option>
              {(atribs || []).map((a) => (
                <option key={a.id} value={a.descricao}>{a.descricao}</option>
              ))}
            </select>
            {fStatus && (
              <button
                onClick={() => setFStatus("")}
                className="dashboard-filtro-clear"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Prazo Interno – intervalo (início e fim) */}
          <div className="dashboard-filtro-group" style={{ position: "relative", gap: "0.5rem" }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>de</span>
            <div style={{ position: "relative" }}>
              <Input
                type="date"
                className="dashboard-select dashboard-filtro-usuario-input"
                value={fDataIni}
                onChange={(e) => setFDataIni(e.target.value)}
                title="Prazo Interno - Início"
              />
              {fDataIni && (
                <button onClick={() => setFDataIni("")} className="dashboard-filtro-clear">
                  <X size={14} />
                </button>
              )}
            </div>

            <span style={{ fontSize: 12, color: "#6b7280" }}>até</span>

            <div style={{ position: "relative" }}>
              <Input
                type="date"
                className="dashboard-select dashboard-filtro-usuario-input"
                value={fDataFim}
                onChange={(e) => setFDataFim(e.target.value)}
                title="Prazo Interno - Fim"
              />
              {fDataFim && (
                <button onClick={() => setFDataFim("")} className="dashboard-filtro-clear">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <Dialog
          open={modalAberto}
          onOpenChange={(open) => {
            setModalAberto(open);
            if (!open) { setRightMode("partes"); setVisualizando(false); }
          }}
        >
          <DialogOverlay className="processo-dialog-overlay" />
          <DialogTrigger asChild>
            <Button
              className="usuarios-btn-material"
              onClick={(e) => { e.currentTarget.blur(); abrirNovo(); }}
            >
              <Plus size={16} /> Novo Processo
            </Button>
          </DialogTrigger>

          <DialogContent
            className="processo-modal processo-split-modal processo-no-close processo-dialog-content"
            onOpenAutoFocus={(e) => {
              if (visualizando) {
                e.preventDefault();
                requestAnimationFrame(() => document.activeElement?.blur());
              }
            }}
          >
            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

            {/* Lado esquerdo - só campos do schema */}
            <div className="processo-modal-split-left">
              <DialogTitle className="processo-modal-title">
                {visualizando ? "Detalhar Processo" : editando ? "Editar Processo" : "Novo Processo"}
              </DialogTitle>
              <DialogDescription className="processo-modal-description">
                Preencha os dados do processo.
              </DialogDescription>

              {/* Linha 1 - CNJ e Número do Contrato */}
              {/* Linha 1 - CNJ e Contrato */}
              <div className="processo-input-row">
                <LinhaInput label="Número (CNJ)">
                  <Input
                    className="processo-modal-input"
                    value={form.numero}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>

                <LinhaInput label="Contrato (nº ou ID)">
                  <Input
                    className="processo-modal-input"
                    value={form.contrato_numero || form.contrato_id}   // mostra nº se existir
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contrato_id: e.target.value,   // se digitar, usamos como ID
                        contrato_numero: ""            // digitou manualmente → limpa nº
                      })
                    }
                    placeholder="Ex.: C-2025-021 (ou ID)"
                    readOnly={visualizando}
                  />
                </LinhaInput>
              </div>


              {/* Linha 2 - Datas */}
              <div className="processo-input-row">
                <LinhaInput label="Data de Distribuição">
                  <Input
                    type="date"
                    className="processo-modal-input"
                    value={form.data_distribuicao}
                    onChange={(e) => setForm({ ...form, data_distribuicao: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>

                <LinhaInput label="Data de Publicação">
                  <Input
                    type="date"
                    className="processo-modal-input"
                    value={form.data_publicacao}
                    onChange={(e) => setForm({ ...form, data_publicacao: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>
              </div>

              {/* Linha 3 - Comarca */}
              <LinhaInput label="Comarca">
                <Input
                  className="processo-modal-input"
                  value={form.comarca}
                  onChange={(e) => setForm({ ...form, comarca: e.target.value })}
                  readOnly={visualizando}
                />
              </LinhaInput>

              {/* Linha 4 - Prazos */}
              <div className="processo-input-row triple">
                <LinhaInput label="Prazo Jurídico (dias)">
                  <Input
                    type="number"
                    className="processo-modal-input"
                    value={form.prazo_juridico}
                    onChange={(e) => setForm({ ...form, prazo_juridico: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>

                <LinhaInput label="Prazo Interno">
                  <Input
                    type="date"
                    className="processo-modal-input"
                    value={form.prazo_interno}
                    onChange={(e) => setForm({ ...form, prazo_interno: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>

                <LinhaInput label="Prazo Fatal">
                  <Input
                    type="date"
                    className="processo-modal-input"
                    value={form.prazo_fatal}
                    onChange={(e) => setForm({ ...form, prazo_fatal: e.target.value })}
                    readOnly={visualizando}
                  />
                </LinhaInput>
              </div>

              {/* Observação */}
              <LinhaInput label="Observação">
                <Input
                  className="processo-modal-input"
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  readOnly={visualizando}
                />
              </LinhaInput>

              {!visualizando && (
                <div className="processo-botao-salvar-bottom">
                  <Button ref={salvarRef} onClick={salvar}>Salvar</Button>
                </div>
              )}
            </div>

            {/* Lado direito */}
            <div className="processo-modal-split-right">
              <div className="flex items-center justify-between">
                <h5>Atribuições do processo</h5>
              </div>

              <ul className="processo-modal-right-lista" style={{ marginTop: "0.75rem" }}>
                {(andamentos?.length
                  ? andamentos
                  : (processoSel?.atribuicoes_evento || [])
                ).length ? (
                  (andamentos?.length ? andamentos : processoSel.atribuicoes_evento).map((a) => (
                    <li key={a.id} className="processo-modal-right-item">
                      <div className="processo-modal-right-texto">
                        <div>{a.atribuicao_descricao}</div>
                        <div className="text-xs text-gray-500">
                          {a.data_inicial ?? "-"} • {a.responsavel?.nome ?? "Sem responsável"}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>Sem atribuições.</li>
                )}
              </ul>
            </div>

                      

            {erroModal && <div className="processo-modal-error">{erroModal}</div>}
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela">
          <thead>
            <tr>
              <th className="col-numero">Nº</th>
              <th>Parte Principal</th>
              <th>Status</th>
              <th>Comarca</th>
              <th>Prazo Interno</th>
              <th className="col-responsavel">Resp.</th>
              <th className="col-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}>Carregando…</td></tr>
            ) : filtrados.length ? (
              filtrados.map((p) => (
                <tr key={p.id}>
                  <td className="col-numero">{p.numero ?? p.numero_cnj}</td>
                  <td>{(getPartePrincipal(p)?.nome) ?? "-"}</td>
                  <td>{p.status_atual ?? "-"}</td>
                  <td>{p.comarca ?? "-"}</td>
                  <td>{fmtDM(p.prazo_interno)}</td>
                  <td className="col-responsavel">
                    {p.responsavel_atual?.nome ?? p.responsavel?.nome ?? "-"}
                  </td>
                  <td className="col-acoes">
                    <Button
                      variant="secondary"
                      className="ml-2"
                      onClick={(e) => { e.currentTarget.blur(); abrirEditar(p.id); }}
                    >
                      <Pencil size={16} className="mr-1" />Editar
                    </Button>
                    <Button
                      variant="outline"
                      className="ml-2"
                      onClick={(e) => { e.currentTarget.blur(); abrirDetalhar(p.id); }}
                    >
                      <Eye size={16} className="mr-1" />Detalhar
                    </Button>
                    <Button
                      variant="outline"
                      className="ml-2"
                      onClick={() => excluir(p.id)}
                    >
                      <X size={16} className="mr-1" />Excluir
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7}>Nenhum processo encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
