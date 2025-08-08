// src/pages/Contratos.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogOverlay,
} from "@/components/ui/dialog";
import { Eye, Pencil, Plus } from "lucide-react";
import {
  fetchContratos, createContrato, updateContrato, deleteContrato,
} from "@/services/ENDPOINTS_ServiceContratos";
import "@/styles/unified_styles.css";

const STATUS_ORDER = [
  "Criação",
  "Partes",
  "Aguard. Processo",
  "Acordo Realizado",
  "Sem Acordo",
  "Finalizado",
];

// se vier “texto longo”, mapeia pra curto (você já definiu curtos, mas deixo aqui pra blindar)
const toShortStatus = (s) => {
  const map = {
    "Criação": "Criação",
    "Partes": "Partes",
    "Aguard. Processo": "Aguard. Proc.",
    "Acordo Realizado": "Acordo OK",
    "Sem Acordo": "Sem Acordo",
    "Finalizado": "Finalizado",
  };
  return map[s] || s;
};

const getCurrentEvento = (c) => c?.atribuicoes_evento?.[0] || null;
const getStatus = (c) => toShortStatus(getCurrentEvento(c)?.atribuicao_descricao || "");
const getResponsavel = (c) => getCurrentEvento(c)?.responsavel?.nome || "-";

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
  });

  // lado direito do modal (partes vinculadas) – placeholder
  const [partesVinculadas, setPartesVinculadas] = useState([]); // [{id, nome}]

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchContratos();
        // garante ordem por status conforme STATUS_ORDER, se quiser
        const sorted = [...data].sort((a, b) => {
          const ia = STATUS_ORDER.indexOf(getStatus(a)) ?? 99;
          const ib = STATUS_ORDER.indexOf(getStatus(b)) ?? 99;
          return ia - ib;
        });
        setLista(sorted);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtrados = useMemo(() => {
    return lista.filter((c) => {
      const okStatus = fStatus ? getStatus(c) === fStatus : true;
      const okLote = fLote ? String(c.lote || "").includes(String(fLote)) : true;
      return okStatus && okLote;
    });
  }, [lista, fStatus, fLote]);

  const abrirNovo = () => {
    setEditando(false);
    setForm({ numero: "", valor: "", lote: "", observacao: "" });
    setPartesVinculadas([]);
    setModalAberto(true);
    setTimeout(() => salvarRef.current?.focus(), 0);
  };

  const abrirEditar = (c) => {
    setEditando(true);
    setForm({
      numero: c.numero || "",
      valor: c.valor ?? "",
      lote: c.lote ?? "",
      observacao: c.observacao ?? "",
    });
    setPartesVinculadas(c.partes || []);
    setModalAberto(true);
    setTimeout(() => salvarRef.current?.focus(), 0);
  };

  const salvar = async () => {
    // TODO: montar payload final
    const payload = {
      numero: String(form.numero).trim(),
      valor: form.valor ? Number(form.valor) : null,
      lote: form.lote ? String(form.lote).trim() : null,
      observacao: form.observacao?.trim() || "",
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
              {STATUS_ORDER.map((s) => (
                <option key={s} value={toShortStatus(s)}>{toShortStatus(s)}</option>
              ))}
            </select>
          </div>

          <div className="dashboard-filtro-group">
            <Input
              className="dashboard-select dashboard-filtro-usuario-input"
              placeholder="Filtrar por Lote"
              value={fLote}
              onChange={(e) => setFLote(e.target.value)}
            />
          </div>
        </div>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogOverlay className="dialog-overlay" />
          <DialogTrigger asChild>
            <Button className="usuarios-btn-material" onClick={abrirNovo}>
              <Plus size={16} /> Novo Contrato
            </Button>
          </DialogTrigger>

          <DialogContent
            className="dashboard-modal dashboard-no-close split-modal"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

            <div className="split-left">
              <DialogTitle>{editando ? "Editar Contrato" : "Novo Contrato"}</DialogTitle>
              <DialogDescription className="usuarios-modal-descricao">
                Preencha os dados do contrato.
              </DialogDescription>

              <div className="usuarios-input-wrapper">
                <label className="usuarios-label">Número</label>
                <Input
                  className="usuarios-modal-input"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                />
              </div>

              <div className="usuarios-input-wrapper">
                <label className="usuarios-label">Valor</label>
                <Input
                  className="usuarios-modal-input"
                  type="number"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                />
              </div>

              <div className="usuarios-input-wrapper">
                <label className="usuarios-label">Lote</label>
                <Input
                  className="usuarios-modal-input"
                  value={form.lote}
                  onChange={(e) => setForm({ ...form, lote: e.target.value })}
                />
              </div>

              <div className="usuarios-input-wrapper">
                <label className="usuarios-label">Observação</label>
                <Input
                  className="usuarios-modal-input"
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                />
              </div>

              <div className="botao-salvar-bottom">
                <Button ref={salvarRef} onClick={salvar}>Salvar</Button>
              </div>
            </div>

            <div className="split-right">
              <h5>Partes vinculadas</h5>
              {partesVinculadas?.length ? (
                <ul className="enderecos-lista">
                  {partesVinculadas.map((p) => (
                    <li key={p.id} className="endereco-item">
                      <div className="endereco-texto">
                        <div>{p.nome}</div>
                        <div className="text-xs text-gray-500">{p.tipo_parte}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma parte vinculada ainda.</p>
              )}

              {/* Aqui depois você coloca o botão flutuante para “+ Parte”,
                  igual fizemos no outro modal */}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <div className="usuarios-tabela-wrapper">
        <table className="usuarios-tabela">
          <thead>
            <tr>
              <th>Número</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Responsável</th>
              <th>Lote</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Carregando…</td></tr>
            ) : filtrados.length ? (
              filtrados.map((c) => (
                <tr key={c.id}>
                  <td>{c.numero}</td>
                  <td>{Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td>{getStatus(c)}</td>
                  <td>{getResponsavel(c)}</td>
                  <td>{c.lote ?? "-"}</td>
                  <td className="usuarios-acoes">
                    <Button variant="secondary" className="ml-2" onClick={() => abrirEditar(c)}>
                      <Pencil size={16} className="mr-1" />Editar
                    </Button>
                    <Button variant="outline" className="ml-2" onClick={() => {/* abrir modal detalhar */}}>
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
