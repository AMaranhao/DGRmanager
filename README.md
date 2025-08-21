# 📚 Sistema Jurídico – DGR Advogados

Sistema administrativo jurídico desenvolvido para gestão de contratos, partes adversas, colaboradores e outros módulos, com foco em escritórios de advocacia.  
Inclui automações, controle de prazos, integrações e fluxo de trabalho otimizado para uso interno.

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
- Adição/edição de endereços em **modo split** no modal.
- Edição rápida de endereços ao clicar na lista.
- Modal de detalhamento somente leitura.

### 🔹 Módulo de Contratos
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
  - `/colaboradores`
  - `/parte-adversa`
  - `/contratos`
  - `/atribuicoes`
- Configure a URL base no arquivo `src/services/apiService.js`.

### 5️⃣ Rodar o Projeto
```bash
npm run dev
# ou
yarn dev
```
> O projeto abrirá em: **http://localhost:5173/** (padrão do Vite)

---

## 🧩 Padrões de Código

- **Services**: todos seguem o padrão `fetchX`, `createX`, `updateX`, `deleteX`.
- **Modal Split**: modais com lado esquerdo (dados principais) e lado direito (entidades vinculadas).
- **Estilização**: classes CSS unificadas, evitando duplicação entre módulos.
- **Filtros e Pesquisa**: sempre controlados por estados locais e `useMemo` para performance.

---

## 📌 Roadmap Futuro

- [ ] Autenticação JWT com controle de permissões.
- [ ] Integração com banco de dados real.
- [ ] Upload e gestão de documentos.
- [ ] Dashboards analíticos por cliente/contrato.

---

## 👨‍💻 Autores
- **Carla Ferreira** – Advogada especialista e product owner do sistema.
- **Kaio Malcher** – Co-autor do projeto e parceiro na concepção das funcionalidades.
- **Assistente Técnico** – Apoio no desenvolvimento e arquitetura de código.

---
