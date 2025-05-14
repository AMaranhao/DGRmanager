import { useState, useEffect } from "react";
import { fetchEmprestimos } from "@/services/apiService";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter } from "date-fns";
import { X, Printer } from "lucide-react";

import "@/styles/pages/relatorios.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/buttons.css";
import '@/styles/mobile.css';

export default function RelatorioSalasMaisUtilizadas() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ordem, setOrdem] = useState("desc");

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

    return dentroDataInicio && dentroDataFim;
  });

  const agruparPorSala = () => {
    const agrupado = {};
    emprestimosFiltrados.forEach((emp) => {
      const salaNumero = emp.chave?.sala?.numero;
      const tipoSala = emp.chave?.sala?.tipo?.tipo_sala || "Não informado";

      if (!salaNumero) return;

      if (!agrupado[salaNumero]) {
        agrupado[salaNumero] = { quantidade: 0, tipo: tipoSala };
      }

      agrupado[salaNumero].quantidade += 1;
    });

    return agrupado;
  };

  const dadosAgrupados = agruparPorSala();

  const salasOrdenadas = Object.entries(dadosAgrupados).sort(
    ([, a], [, b]) => (ordem === "desc" ? b.quantidade - a.quantidade : a.quantidade - b.quantidade)
  );

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

          <div className="relatorios-filtro-group relatorios-filtro-text">
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              className="dashboard-select filtro-salas-utilizadas"
            >
              <option value="desc">Salas Mais Utilizadas Primeiro</option>
              <option value="asc">Salas Menos Utilizadas Primeiro</option>
            </select>
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
      {salasOrdenadas.length === 0 ? (
        <div className="relatorios-sem-dados">
          Nenhum dado encontrado nesse período.
        </div>
      ) : (
        <div className="emprestimos-tabela-wrapper">
          <table className="emprestimos-tabela">
            <thead>
              <tr>
                <th>Sala</th>
                <th>Tipo de Sala</th>
                <th>Quantidade de Utilizações</th>
              </tr>
            </thead>
            <tbody>
              {salasOrdenadas.map(([sala, dados]) => (
                <tr key={sala}>
                  <td>{sala}</td>
                  <td>{dados.tipo}</td>
                  <td>{dados.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right text-sm font-medium mt-2">
            Total Geral de Utilizações: {salasOrdenadas.reduce((acc, [, dados]) => acc + dados.quantidade, 0)}
          </div>
        </div>
      )}
    </div>
  );
}
