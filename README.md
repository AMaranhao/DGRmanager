# 📚 Sistema Jurídico – DGR Advogados

Sistema administrativo jurídico desenvolvido para gestão de contratos, partes adversas, colaboradores, processos e outros módulos, com foco em escritórios de advocacia.  
Inclui automações, controle de prazos, propostas e acordos, com integrações e fluxo de trabalho otimizado para uso interno.

---

## 🚀 Funcionalidades Atuais

### 🔹 Módulo de Colaboradores
- Listagem de colaboradores com filtro por **status** (Ativo / Inativo).
- Pesquisa por nome, email, cargo ou equipe.
- Cadastro e edição de colaboradores com campos:
  - Nome, CPF, Email, OAB, Telefone, Data de Admissão, Cargo e Equipe.
- Ativação/desativação com **confirmação modal**.
- Modal de **detalhamento** somente leitura.
- Foco automático no primeiro campo ao abrir modal de edição/criação.

### 🔹 Módulo de Parte Adversa
- Listagem com filtros “Com Contrato” / “Sem Contrato”.
- Visualização de endereços vinculados diretamente no modal.
- Adição/edição de endereços em **modo split**.
- Edição rápida ao clicar na lista de endereços.
- Modal de detalhamento somente leitura.
- Visualização de contratos vinculados à parte.
- Painel com atribuições vinculadas aos contratos.

### 🔹 Módulo de Contratos
- Listagem de contratos ordenada automaticamente por **status** definido via atribuições.
- Filtros por **status**, **lote** ou busca livre.
- Cadastro e edição com campos:
  - Número, Valor, Lote, Observação, Status (Atribuição).
- Gerenciamento de **partes vinculadas**:
  - Busca de parte pelo CPF (match direto).
  - Evita duplicidade de partes no contrato.
  - Remoção de partes com confirmação e botão dedicado.
- Painel direito com alternância entre:
  - Lista de Partes vinculadas
  - Histórico de Atribuições do contrato.
- Atribuições com status, prazo e responsável.
- Criação de nova atribuição com validação de campos obrigatórios.

### 🔹 Módulo de Processos
- Listagem de processos com filtros por:
  - CNJ, Parte ou Comarca
  - Responsável atual
  - Status (via atribuição)
  - Intervalo de prazo interno
- Modal dividido (split modal):
  - **Esquerda**: dados do processo (CNJ, contrato, datas, prazos, comarca e observação).
  - **Direita**: histórico de atribuições (status, responsável e prazos).
- Controle visual:
  - Abertura com foco direto no botão "Salvar"
  - Preenchimento fluido dos campos sem perda de foco
- Criação e edição com persistência via backend mockado.
- Exclusão do campo `funcionario_id`; `cliente` fixo como `"Finsol"`.
- Contrato é informado via `contrato_numero` e resolvido no backend.

- Listagem de contratos ordenada automaticamente por **status** definido via atribuições.
- Filtros por **status**, **lote** ou busca livre.
- Cadastro e edição com campos:
  - Número, Valor, Lote, Observação, Status (Atribuição).
- Gerenciamento de **partes vinculadas**:
  - Busca de parte pelo CPF (match direto).
  - Evita duplicidade de partes no contrato.
  - Remoção de partes com confirmação e botão dedicado.
- **Histórico de Atribuições**:
  - Exibição ordenada por data.
  - Alternância entre lista de partes e histórico no modal de detalhamento.

- Cadastro e edição com:
  - Contrato via campo `contrato_numero` ou `contrato_id`
  - Cliente fixo como `"Finsol"`
  - Observações e datas normalizadas (ISO/BR)
- Atribuições:
  - Atualização da atual (solucionador, observação, novo prazo)
  - Criação de nova atribuição com status, responsável e prazo
  - Exibição de tempo decorrido no status atual
- Vinculação de partes ao processo (nome, CPF, tipo)
- Modal de propostas:
  - Exibição em grid com colunas
  - Destaque visual em **vermelho** para propostas já aceitas
  - Adição de nova proposta com número de parcelas e valor
  - Edição inline de proposta selecionada
  - Criação de acordo diretamente da proposta, com:
    - Campo de vencimento do pagamento (`date`)
    - Campo de mês do primeiro pagamento (`month`)

### 🔹 Acordos 
- Listagem de acordos com dados unificados:
  - Contrato, Parte, Telefone, Último Pagamento, Parcela em Aberto e Valor Residual.
- Modal dividido (split modal):
  - **Esquerda**: dados do acordo e proposta vinculada.
  - **Direita**: histórico de atribuições com possibilidade de edição.
- Modal de Parcelas e Pagamentos:
  - Visualização em colunas.
  - Destaques visuais para parcelas pagas, pendentes e em atraso.
  - Formulário inline para realizar pagamento, renderizado abaixo das informações principais da parcela.
  - Rodapé com botões de ação adaptativos.
- Recarregamento automático da lista de parcelas após cada novo pagamento.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**:  
  - [React.js](https://react.dev/)  
  - [Vite](https://vitejs.dev/) (build e dev server)
  - [TailwindCSS](https://tailwindcss.com/) (estilização)
  - [Shadcn/UI](https://ui.shadcn.com/) (componentes)
  - [Lucide Icons](https://lucide.dev/) (ícones SVG)
  
- **Backend**:
  - API REST (endpoints mockados via [Mockoon](https://mockoon.com/) para desenvolvimento)
  - Padrão de serviços com Axios centralizado (`apiService.js`) e interceptação de JWT.

- **Outros**:
  - Hooks personalizados e estados controlados com React.
  - CSS modularizado (`unified_styles.css` e `unified_refactored_styles.css`).
  - Organização de código por **módulos** (`src/pages`, `src/services`, `src/components`).

---

## 📦 Estrutura de Pastas

```
src/
 ├─ components/     # Botões, inputs, diálogos, etc.
 ├─ pages/          # Páginas/módulos principais (Colaboradores, Contratos, ParteAdversa...)
 ├─ services/       # Serviços de integração com a API (ENDPOINTS_Service*.js)
 ├─ styles/         # CSS e estilos unificados
 └─ App.jsx         # Roteamento principal
```

---

## ⚙️ Instalação e Execução

### 1️⃣ Pré-requisitos
- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### 2️⃣ Clonar o Repositório
```bash
git clone https://github.com/SEU-USUARIO/sistema-juridico.git
cd sistema-juridico
```

### 3️⃣ Instalar Dependências
```bash
npm install
# ou
yarn install
```

### 4️⃣ Configurar o Backend/Mock
- Verifique se o [Mockoon](https://mockoon.com/) está rodando com os endpoints definidos:
  * `/colaboradores`
  * `/parte-adversa`
  * `/contratos`
  * `/processos`
  * `/atribuicoes`
  * `/atribuicoes-evento`
  * `/propostas-processo`
  * `/acordos`
* Configure a URL base em `src/services/apiService.js`.

### 5️⃣ Rodar o Projeto
```bash
npm run dev
# ou
yarn dev
```
> O projeto abrirá em: **http://localhost:5173/** (padrão do Vite)

---

## 🧩 Padrões de Código

* **Services**: `fetchX`, `createX`, `updateX`, `deleteX`
* **Modal Split**: esquerda = dados principais | direita = entidades vinculadas
* **Estilos Unificados**: reaproveitamento com `.processo-*`, `.usuarios-*`, etc.
* **Filtros**: sempre com `useMemo` para performance
* **Campos de data**: normalizados em formato ISO para envio (`YYYY-MM-DD`) e exibidos em BR (`DD/MM`)

---

## 📌 Roadmap Futuro

* [ ] Autenticação JWT com permissões por tipo de usuário
* [ ] Upload e gestão de documentos
* [ ] Dashboards com indicadores por cliente
* [ ] Integração com banco de dados real
* [ ] Módulo de Acordos (em desenvolvimento)

---

## 👨‍💻 Autores
- **Carla Ferreira** – Advogada especialista e product owner do sistema.
- **Kaio Malcher** – Co-autor do projeto e parceiro na concepção das funcionalidades.
- **Assistente Técnico** – Apoio no desenvolvimento e arquitetura de código.

---
