import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter } from "date-fns";
import { X, Printer } from "lucide-react";

import "@/styles/pages/relatorios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/buttons.css";
import "@/styles/mobile.css";

export default function RelatorioHistoricoUtilizacaoUsuarios() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");

  useEffect(() => {
    carregarEmprestimos();
  }, []);

  const carregarEmprestimos = async () => {
    const dados = await fetchEmprestimos();
    setEmprestimos(dados);
  };

  const emprestimosFiltrados = emprestimos.filter((emp) => {
    const retirada = emp.horario_retirada ? parseISO(emp.horario_retirada) : null;
    let inicio = dataInicio ? parseISO(dataInicio) : null;
    let fim = dataFim ? parseISO(dataFim) : null;

    if (inicio && fim && isAfter(inicio, fim)) [inicio, fim] = [fim, inicio];

    const dentroDataInicio = inicio ? isAfter(retirada, inicio) : true;
    const dentroDataFim = fim ? isAfter(fim, retirada) : true;
    const nomeUsuario = `${emp.usuario?.firstName || ""} ${emp.usuario?.lastName || ""}`.toLowerCase();

    const usuarioFiltrado = usuarioSelecionado
      ? nomeUsuario.includes(usuarioSelecionado.toLowerCase())
      : true;

    return dentroDataInicio && dentroDataFim && usuarioFiltrado;
  });

  const agruparPorUsuario = () => {
    const agrupado = {};
    emprestimosFiltrados.forEach((emp) => {
      const nome = `${emp.usuario?.firstName || ""} ${emp.usuario?.lastName || ""}`;
      if (!nome.trim()) return;
      agrupado[nome] = agrupado[nome] || [];
      agrupado[nome].push(emp);
    });
    return agrupado;
  };

  const dadosAgrupados = agruparPorUsuario();

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="filtro-container noprint">
        <div className="filtros-esquerda">
          <div className="relatorios-filtro-group relatorios-filtro-text">
            <label className="relatorio-label">De:</label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="dashboard-select dashboard-filtro-usuario-input"
            />
            {dataInicio && (
              <button type="button" onClick={() => setDataInicio("")} className="dashboard-filtro-clear" title="Limpar">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relatorios-filtro-group relatorios-filtro-text">
            <label className="relatorio-label">Até:</label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="dashboard-select dashboard-filtro-usuario-input"
            />
            {dataFim && (
              <button type="button" onClick={() => setDataFim("")} className="dashboard-filtro-clear" title="Limpar">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="dashboard-filtro-usuario">
            <Input
              type="text"
              placeholder="Todos os Usuários"
              value={usuarioSelecionado}
              onChange={(e) => setUsuarioSelecionado(e.target.value)}
              className="dashboard-select dashboard-filtro-usuario-input"
            />
            {usuarioSelecionado && (
              <button onClick={() => setUsuarioSelecionado("")} className="dashboard-filtro-clear" title="Limpar">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button onClick={handleImprimir} className="btn-imprimir">
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </div>

      {/* Resultado */}
      {Object.keys(dadosAgrupados).length === 0 ? (
        <div className="relatorios-sem-dados">
          Nenhuma utilização encontrada nesse período.
        </div>
      ) : (
        Object.keys(dadosAgrupados)
          .sort()
          .map((usuario) => {
            const utilizacoes = dadosAgrupados[usuario];
            return (
              <div key={usuario} className="space-y-2">
                <h3 className="relatorios-cartao-nome text-left">{usuario}</h3>
                <div className="emprestimos-tabela-wrapper">
                  <table className="emprestimos-tabela">
                    <thead>
                      <tr>
                        <th>Sala</th>
                        <th>Tipo de Sala</th>
                        <th>Horário de Retirada</th>
                        <th>Horário de Devolução</th>
                        <th>Tempo de Atraso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {utilizacoes.map((emp) => {
                        const retirada = emp.horario_retirada ? parseISO(emp.horario_retirada) : null;
                        const devolucao = emp.horario_devolucao ? parseISO(emp.horario_devolucao) : null;
                        const tipoSala = emp.chave?.sala?.tipo?.tipo_sala || "Não informado";

                        let atraso = "-";
                        if (retirada && devolucao) {
                          const diffMs = devolucao - retirada;
                          const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
                          const diffMin = Math.floor((diffMs / (1000 * 60)) % 60);
                          const diffDias = Math.floor(diffHoras / 24);

                          if (diffDias > 0) atraso = `${diffDias}d ${diffHoras % 24}h ${diffMin}min`;
                          else if (diffHoras > 0) atraso = `${diffHoras}h ${diffMin}min`;
                          else atraso = `${diffMin}min`;
                        }

                        return (
                          <tr key={emp.id}>
                            <td>{emp.chave?.sala?.numero || "-"}</td>
                            <td>{tipoSala}</td>
                            <td>{retirada ? format(retirada, "dd/MM/yyyy HH:mm") : "Não informado"}</td>
                            <td>{devolucao ? format(devolucao, "dd/MM/yyyy HH:mm") : "-"}</td>
                            <td>{atraso}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="text-right text-sm font-medium mt-1">
                    Total de utilizações: {utilizacoes.length}
                  </div>
                </div>
              </div>
            );
          })
      )}
    </div>
  );
}
