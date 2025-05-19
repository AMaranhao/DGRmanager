# 🔑 Sistema de Empréstimo de Chaves - Hospital das Clínicas

Sistema web para gerenciamento de empréstimo de chaves e controle de salas em um ambiente hospitalar universitário. Desenvolvido com foco em praticidade, rastreabilidade e integração futura com o Microsoft Bookings.

---

## 📋 Funcionalidades

- Login com verificação de email e senha (Mockoon, com autenticação planejada via JWT)
- Visualização de agendamentos em tempo real com status visual
- Empréstimos e devoluções por senha de 4 dígitos (PIN)
- Filtros por andar, sala, data e usuário
- Dashboard:
  - Agendamentos do horário vigente por andar
  - Status visual (verde = aguardando retirada, vermelho = já retirada, aguardando devolução, azul = agendamento próprio)
  - Filtro dinâmico de andares
  - Novo Empréstimo Avulso (sem agendamento prévio)
  - Tooltip com legenda de status
- Módulo de Empréstimos:
  - Histórico completo de empréstimos
  - Filtros por:
    - Data inicial e final
    - Usuário
    - Sala
    - Status (Em andamento, Finalizado, Em atraso)
  - Visualização com status colorido por situação
- Módulo de Infraestrutura:
  - CRUD de Prédios, Salas, Andares, Chaves e Kits
  - Edição inline de campos como "andar", "ativa", "tipo de kit"
  - Filtros por sala em abas Chaves e Kits
  - Modais personalizados para criação e edição
- Módulo de Usuários:
  - Criação, edição e desativação de contas
  - Campos obrigatórios com validação
  - Filtros por ativo/inativo
  - Permissões por tipo de usuário
- Módulo de Agendamentos:
  - Aba "Por Sala" com horários diários
  - Aba "Por Data" com grade de 15 dias úteis
  - Seleção múltipla de horários contínuos
  - Validação e modal de confirmação de agendamento
  - Visualização de agendamentos do próprio usuário
- Relatórios:
  - Relatório de Empréstimos por Período
  - Relatório de Devoluções em Atraso
  - Relatório de Utilização por Andar
  - Relatório de Utilização por Sala
  - Relatório de Utilização por Usuário
  - Relatório de Salas Mais Utilizadas
  - Relatório Geral com Filtros Avançados
  - Impressão rápida dos relatórios
- Tela de Perfil do Usuário:
  - Dados carregados do endpoint `/me` (Mockoon)
  - Alteração de senha e senha de assinatura (layout e campos)
- Interface responsiva com layout moderno
- Modo escuro implementado
- Integração futura com envio de alertas por SMS (alerta de atraso)
- Estrutura preparada para controle de permissões por perfil (`admin`, `portaria`, `GEP`, `comum`)

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React + Vite
- **Estilização:** Tailwind CSS, shadcn/ui
- **Roteamento:** React Router DOM
- **Formulários:** React Hook Form + Zod (em módulos específicos)
- **Mock Backend:** [Mockoon](https://mockoon.com/) (Simulação de API REST)
- **PostgreSQL (planejado):** banco de dados real
- **Backend (planejado):** Python com Django Rest Framework
- **Ícones:** Lucide-react
- **Gerenciamento de autenticação:** React Context
- **Manipulação de datas:** date-fns

---

## 🛠️ Estrutura de Pastas

```
src/
│
├── components/          # Header, Sidebar, Layout, Botões
├── contexts/            # AuthContext (login e logout)
├── pages/               # Páginas principais (Dashboard, Emprestimos, PerfilUsuario etc)
├── routes/              # AppRoutes.jsx
├── services/            # apiService.js com todos os endpoints
├── styles/
│   ├── pages/           # CSS modularizado por página
│   └── components.css   # Estilos reutilizáveis (header/sidebar/layout)
├── helpers.js           # Normalização e limpeza de dados antes do envio
├── App.jsx
└── main.jsx
```

---

## 📥 Como baixar e rodar o projeto localmente

1. **Clone este repositório**
```bash
git clone https://github.com/seu-usuario/emprestimo-chaves-hc.git
cd emprestimo-chaves-hc
```

2. **Acesse a pasta do projeto**
```bash
cd emprestimo-chaves-hc-FrontEnd
```

3. **Instale as dependências**
```bash
npm install
```

4. **Rode o servidor mockado (Mockoon)**
- Instale o [Mockoon](https://mockoon.com/)
- Importe o arquivo `Server-Mockoon.json` (incluso no repositório)
- Inicie o servidor na porta `3001`

5. **Execute o frontend**
```bash
npm run dev
```

6. **Acesse no navegador**
```
http://localhost:5173
```

---

## 📈 Status do Projeto

✅ Módulos concluídos:
- Dashboard (com filtro por andar e modal de senha)
- Empréstimos
- Infraestrutura (Prédios, Salas, Chaves, Kits)
- Usuários (CRUD completo com filtros e validações)
- Agendamentos (visualização por sala e por data, modal de confirmação)
- Relatórios (7 modelos com filtros)
- Perfil do Usuário
- Modo escuro (dark mode)
- Integração com servidor Mockoon
- Modal de criação de empréstimo avulso

🧪 Em testes:
- Permissões por tipo de usuário
- Edição de perfil

🔒 Acesso com autenticação via Mockoon (com futura migração para JWT no Django Rest Framework)

---

## 🔥 Próximos Passos

- [ ] Implementar backend real com Django Rest Framework + PostgreSQL
- [ ] Autenticação com JWT persistente
- [ ] Tela de configurações (horários, bloqueios)
- [ ] Relatório de acessos de usuários
- [ ] Notificações visuais (devoluções pendentes, erros)
- [ ] Página de login e recuperação de senha finalizadas
- [ ] Aplicativo Mobile (PWA ou nativo) para controle de chaves
- [ ] Exportação real de relatórios (CSV/PDF)
- [ ] Controle visual de permissões no frontend por cargo/perfil
- [ ] Proteção de rotas (redirect se não autenticado)

---

## 👩‍💻 Desenvolvido por:

**José Alexandre Maranhão**
