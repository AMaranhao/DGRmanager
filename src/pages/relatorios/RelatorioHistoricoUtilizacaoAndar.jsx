import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter } from "date-fns";
import { X, Printer } from "lucide-react";

import "@/styles/pages/relatorios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/buttons.css";
import "@/styles/pages/tables.css";
import '@/styles/mobile.css';

export default function RelatorioHistoricoUtilizacaoAndar() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [andarSelecionado, setAndarSelecionado] = useState("");
  const [andaresUnicos, setAndaresUnicos] = useState([]);

  useEffect(() => {
    carregarEmprestimos();
  }, []);

  const carregarEmprestimos = async () => {
    const dados = await fetchEmprestimos();
    setEmprestimos(dados);

    const andaresExtraidos = dados
      .map((e) => e.chave?.sala?.andar)
      .filter((a) => a?.id && a?.nome);

    const andaresMapeados = andaresExtraidos.reduce((acc, curr) => {
      if (!acc.some((a) => a.id === curr.id)) acc.push(curr);
      return acc;
    }, []);

    setAndaresUnicos(andaresMapeados);
  };

  const emprestimosFiltrados = emprestimos.filter((emp) => {
    const retirada = emp.horario_retirada ? parseISO(emp.horario_retirada) : null;
    const andar = emp.chave?.sala?.andar;

    let inicio = dataInicio ? parseISO(dataInicio) : null;
    let fim = dataFim ? parseISO(dataFim) : null;
    if (inicio && fim && isAfter(inicio, fim)) [inicio, fim] = [fim, inicio];

    const dentroDataInicio = inicio ? isAfter(retirada, inicio) : true;
    const dentroDataFim = fim ? isAfter(fim, retirada) : true;
    const andarCorresponde = andarSelecionado ? andar?.id === parseInt(andarSelecionado) : true;

    return dentroDataInicio && dentroDataFim && andarCorresponde;
  });

  const agruparPorAndar = () => {
    const agrupado = {};
    emprestimosFiltrados.forEach((emp) => {
      const andarNome = emp.chave?.sala?.andar?.nome;
      if (!andarNome) return;
      agrupado[andarNome] = agrupado[andarNome] || [];
      agrupado[andarNome].push(emp);
    });
    return agrupado;
  };

  const dadosAgrupados = agruparPorAndar();

  const handleImprimir = () => window.print();

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
              <button onClick={() => setDataInicio("")} className="dashboard-filtro-clear" title="Limpar">
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
              <button onClick={() => setDataFim("")} className="dashboard-filtro-clear" title="Limpar">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relatorios-filtro-group relatorios-filtro-text">
            <select
              value={andarSelecionado}
              onChange={(e) => setAndarSelecionado(e.target.value)}
              className="dashboard-select filtro-salas-utilizadas"
            >
              <option value="">Todos os andares</option>
              {andaresUnicos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filtro-imprimir">
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
          .map((andar) => {
            const utilizacoes = dadosAgrupados[andar];
            return (
              <div key={andar} className="space-y-2">
                <h3 className="relatorios-cartao-nome text-left">{andar}</h3>
                <div className="emprestimos-tabela-wrapper">
                  <table className="emprestimos-tabela">
                    <thead>
                      <tr>
                        <th>Sala</th>
                        <th>Usuário</th>
                        <th>Horário de Retirada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {utilizacoes.map((emp) => (
                        <tr key={emp.id}>
                          <td>{emp.chave?.sala?.numero || "-"}</td>
                          <td>{`${emp.usuario?.firstName || ""} ${emp.usuario?.lastName || ""}`}</td>
                          <td>
                            {emp.horario_retirada
                              ? format(parseISO(emp.horario_retirada), "dd/MM/yyyy HH:mm")
                              : "Não informado"}
                          </td>
                        </tr>
                      ))}
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
