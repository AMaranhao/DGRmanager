// Estrutura inicial sugerida para o módulo de relatórios:

// src/pages/relatorios/GuiasRelatorios.jsx
import { useState } from 'react';
//import { Select } from '@/components/ui/select'; // Se estiver usando um Select customizado
import RelatorioEmprestimosPeriodo from "./RelatorioEmprestimosPeriodo";
import RelatorioHistoricoUtilizacaoAndar from "./RelatorioHistoricoUtilizacaoAndar";
import RelatorioHistoricoUtilizacaoSala from "./RelatorioHistoricoUtilizacaoSala";
import RelatorioHistoricoUtilizacaoUsuarios from "./RelatorioHistoricoUtilizacaoUsuarios";
import RelatorioSalasMaisUtilizadas from "./RelatorioSalasMaisUtilizadas";
import RelatorioEmprestimosAtrasados from "./RelatorioEmprestimosAtrasados";
import RelatorioRelatorioCompleto from "./RelatorioRelatorioCompleto";

import "@/styles/pages/relatorios.css";


export default function GuiasRelatorios() {
  const [relatorioSelecionado, setRelatorioSelecionado] = useState("emprestimos");

  const renderRelatorio = () => {
    switch (relatorioSelecionado) {
      case "emprestimos":
        return <RelatorioEmprestimosPeriodo />;
      case "historico-andar":
        return <RelatorioHistoricoUtilizacaoAndar />;
      case "historico-sala":
        return <RelatorioHistoricoUtilizacaoSala />;
      case "historico-usuarios":
        return <RelatorioHistoricoUtilizacaoUsuarios />;
      case "salas":
        return <RelatorioSalasMaisUtilizadas />;
      case "emprestimos-atrasados":
        return <RelatorioEmprestimosAtrasados />;
      case "completo":
        return <RelatorioRelatorioCompleto />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <h3 className="dashboard-heading">Relatórios</h3>
        <div className='justonprint logoprint'>
            <img src="/logo.png" alt="Logo" className="sidebar-logo" />
        </div>

      <div className="mb-6">
        <select
          className="dashboard-select-relatorio"
          value={relatorioSelecionado}
          onChange={(e) => setRelatorioSelecionado(e.target.value)}
        >
          <option value="emprestimos">Empréstimos por Período</option>
          <option value="historico-andar">Histórico de Uso por Andar</option>
          <option value="historico-sala">Histórico de Uso por Sala</option>
          <option value="historico-usuarios">Histórico de Uso por Usuários</option>
          <option value="salas">Salas Mais Utilizadas</option>
          <option value="emprestimos-atrasados">Devoluções Atrasados</option>
          <option value="completo">Relatório Completo</option>
        </select>
      </div>
      <div className='justonprint'>
      </div>

      <div>{renderRelatorio()}</div>
    </div>
  );
}

