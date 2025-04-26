// Estrutura inicial sugerida para o módulo de relatórios:

// src/pages/relatorios/Relatorios.jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RelatorioEmprestimosPeriodo from './RelatorioEmprestimosPeriodo';
import RelatorioUtilizacaoAndar from './RelatorioUtilizacaoAndar';
import RelatorioSalasMaisUtilizadas from './RelatorioSalasMaisUtilizadas';
import RelatorioUsuariosFrequentes from './RelatorioUsuariosFrequentes';

export default function Relatorios() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Relatórios</h1>

      <Tabs defaultValue="emprestimos" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="emprestimos">Empréstimos por Período</TabsTrigger>
          <TabsTrigger value="utilizacao">Utilização por Andar</TabsTrigger>
          <TabsTrigger value="salas">Salas Mais Utilizadas</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários Frequentes</TabsTrigger>
        </TabsList>

        <TabsContent value="emprestimos">
          <RelatorioEmprestimosPeriodo />
        </TabsContent>

        <TabsContent value="utilizacao">
          <RelatorioUtilizacaoAndar />
        </TabsContent>

        <TabsContent value="salas">
          <RelatorioSalasMaisUtilizadas />
        </TabsContent>

        <TabsContent value="usuarios">
          <RelatorioUsuariosFrequentes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
