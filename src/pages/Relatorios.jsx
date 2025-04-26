// src/pages/Relatorios.jsx

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Relatorios() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Relatórios</h1>

      <Tabs defaultValue="relatorio_emprestimos" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="relatorio_emprestimos">Empréstimos</TabsTrigger>
          <TabsTrigger value="relatorio_utilizacao">Utilização de Salas</TabsTrigger>
          <TabsTrigger value="relatorio_infraestrutura">Infraestrutura</TabsTrigger>
          <TabsTrigger value="relatorio_auditoria">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="relatorio_emprestimos">
          <p>Relatório de Empréstimos será exibido aqui.</p>
        </TabsContent>

        <TabsContent value="relatorio_utilizacao">
          <p>Relatório de Utilização de Salas será exibido aqui.</p>
        </TabsContent>

        <TabsContent value="relatorio_infraestrutura">
          <p>Relatório de Infraestrutura será exibido aqui.</p>
        </TabsContent>

        <TabsContent value="relatorio_auditoria">
          <p>Relatório de Auditoria será exibido aqui.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
