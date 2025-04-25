# 📚 Sistema de Empréstimo de Chaves - HC

Sistema web desenvolvido para a gestão digital de empréstimos de chaves de salas de aula no prédio universitário do HC.

---

## 📋 Funcionalidades

- Integração com Microsoft Bookings para agendamentos de salas
- Controle de empréstimo e devolução de chaves com senha de 4 dígitos
- Tela de Dashboard:
  - Agendamentos do horário atual por andar
  - Status visual (verde = aguardando retirada, vermelho = já retirada)
- Histórico completo de empréstimos
- Filtros por:
  - Data inicial e final
  - Usuário
  - Sala
  - Status
- Painel de Infraestrutura:
  - Cadastro, edição e exclusão de Prédios
  - Cadastro, edição e exclusão de Salas
  - Cadastro, edição e exclusão de Chaves
  - (Em breve: Gestão de Kits)
- Alertas de atraso no empréstimo via SMS (planejado)
- Relatórios detalhados de uso (em desenvolvimento)

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **Tailwind CSS**: estilização rápida e responsiva
- **shadcn/ui**: componentes modernos e personalizáveis
- **Mockoon**: servidor mockado para desenvolvimento local
- **PostgreSQL**: banco de dados real (backend futuro)
- **Spring Boot** (futuro): para desenvolvimento do backend

---

## 🛠️ Estrutura de Pastas

```
src/
├── assets/         # Imagens e ícones
├── components/     # Header, Sidebar, Layout
├── pages/          # Dashboard, Emprestimos, Infraestrutura, Relatorios, Login
├── services/       # apiService.js para comunicação com API Mock
├── routes/         # AppRoutes.jsx (configuração de rotas)
├── App.jsx         # Componente principal
└── main.jsx        # Arquivo de entrada
```

---

## 📥 Como baixar e rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
```

### 2. Acesse a pasta do projeto

```bash
cd emprestimo-chaves-hc
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Rode o Mockoon (servidor de dados fake)

- Abra o Mockoon
- Importe o ambiente `Chaves HC API`
- Deixe rodando na porta `3001`

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

- Acesse o projeto em: `http://localhost:5173/`

---

## 📈 Status do Projeto

- ✅ Dashboard de agendamentos implementado
- ✅ Módulo de Empréstimos com filtros completo
- ✅ Módulo de Infraestrutura com CRUD de Prédios e Chaves funcionando
- 🚧 CRUD de Salas (em desenvolvimento)
- 🚧 Gestão de Kits (planejado)
- 🚧 Integração com API real via Spring Boot (em breve)
- 🚧 Aplicação mobile (etapa futura)

---

## 🔥 Próximos Passos

- Finalizar módulo de Salas
- Desenvolver módulo de Kits
- Implementar autenticação JWT
- Implantar backend real com Spring Boot + PostgreSQL
- Adicionar relatórios analíticos e gráficos
- Criar aplicação Mobile para controle via celular

---

## 👩‍💻 Desenvolvido por:

**Carla Ferreira**
