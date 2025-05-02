// Estrutura inicial sugerida para o módulo de relatórios:

// src/pages/relatorios/Relatorios.jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import RelatorioEmprestimosPeriodo from "./RelatorioEmprestimosPeriodo";
import RelatorioHistoricoUtilizacaoAndar from "./RelatorioHistoricoUtilizacaoAndar";
import RelatorioHistoricoUtilizacaoSala from "./RelatorioHistoricoUtilizacaoSala";
import RelatorioHistoricoUtilizacaoUsuarios from "./RelatorioHistoricoUtilizacaoUsuarios";
import RelatorioSalasMaisUtilizadas from "./RelatorioSalasMaisUtilizadas";
import RelatorioEmprestimosAtrasados from "./RelatorioEmprestimosAtrasados";
import RelatorioRelatorioCompleto from "./RelatorioRelatorioCompleto";

export default function GuiasRelatorios() {
  return (
    <div className="p-8">
      <h3 className="dashboard-heading">Relatórios</h3>

        <Tabs defaultValue="emprestimos" className="w-full">
            <TabsList className="mb-6">
                <TabsTrigger value="emprestimos">Empréstimos</TabsTrigger>
                <TabsTrigger value="historico-andar">Historico de Uso  por Andar</TabsTrigger>
                <TabsTrigger value="historico-sala">Historico de Uso por Sala</TabsTrigger>
                <TabsTrigger value="historico-usuarios">Historico de Uso por Usuários</TabsTrigger>
                <TabsTrigger value="salas">Salas Mais Utilizadas</TabsTrigger>
                <TabsTrigger value="emprestimos-atrasados">Emprestimos Atrasados</TabsTrigger>
                <TabsTrigger value="completo">Relatorio Completo</TabsTrigger>
            </TabsList>

            <TabsContent value="emprestimos">
                <RelatorioEmprestimosPeriodo/>
            </TabsContent>

            <TabsContent value="historico-andar">
              <RelatorioHistoricoUtilizacaoAndar/>
            </TabsContent>


            <TabsContent value="historico-sala">
                <RelatorioHistoricoUtilizacaoSala/>
            </TabsContent>

            <TabsContent value="historico-usuarios">
                <RelatorioHistoricoUtilizacaoUsuarios/>
            </TabsContent>

            <TabsContent value="salas">
                <RelatorioSalasMaisUtilizadas/>
            </TabsContent>

            <TabsContent value="emprestimos-atrasados">
                <RelatorioEmprestimosAtrasados/>
            </TabsContent>

            <TabsContent value="completo">
                <RelatorioRelatorioCompleto />
            </TabsContent>

        </Tabs>
    </div>
  );
}
