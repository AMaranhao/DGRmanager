// src/pages/Relatorios.jsx

import RelatorioEmprestimosPeriodo from "./relatorios/RelatorioEmprestimosPeriodo";
import RelatorioHistoricoUtilizacaoAndar from "./relatorios/RelatorioHistoricoUtilizacaoAndar";
import RelatorioHistoricoUtilizacaoSala from "./relatorios/RelatorioHistoricoUtilizacaoSala";
import RelatorioHistoricoUtilizacaoUsuarios from "./relatorios/RelatorioHistoricoUtilizacaoUsuarios";
import RelatorioSalasMaisUtilizadas from "./relatorios/RelatorioSalasMaisUtilizadas";
import RelatorioEmprestimosAtrasados from "./relatorios/RelatorioEmprestimosAtrasados";
import RelatorioRelatorioCompleto from "./relatorios/RelatorioRelatorioCompleto";


export default function Relatorios() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>

      <div className="space-y-8">
        <RelatorioEmprestimosPeriodo/>
        <RelatorioHistoricoUtilizacaoAndar/>
        <RelatorioHistoricoUtilizacaoSala/>
        <RelatorioHistoricoUtilizacaoUsuarios/>
        <RelatorioSalasMaisUtilizadas/>
        <RelatorioEmprestimosAtrasados/>
        <RelatorioRelatorioCompleto/>
      </div>
    </div>
  );
}
