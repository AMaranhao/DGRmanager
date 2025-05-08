import RelatorioEmprestimosPeriodo from "./relatorios/RelatorioEmprestimosPeriodo";
import RelatorioHistoricoUtilizacaoAndar from "./relatorios/RelatorioHistoricoUtilizacaoAndar";
import RelatorioHistoricoUtilizacaoSala from "./relatorios/RelatorioHistoricoUtilizacaoSala";
import RelatorioHistoricoUtilizacaoUsuarios from "./relatorios/RelatorioHistoricoUtilizacaoUsuarios";
import RelatorioSalasMaisUtilizadas from "./relatorios/RelatorioSalasMaisUtilizadas";
import RelatorioEmprestimosAtrasados from "./relatorios/RelatorioEmprestimosAtrasados";
import RelatorioRelatorioCompleto from "./relatorios/RelatorioRelatorioCompleto";

import "@/styles/pages/relatorios.css";
import '@/styles/mobile.css';

export default function Relatorios() {
  return (
    <div className="p-8">
      <h3 className="dashboard-heading">Relatórios</h3>
      
      <div className="dashboard-select-wrapper">
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
