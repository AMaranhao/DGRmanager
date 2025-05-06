# 🔑 Sistema de Empréstimo de Chaves - Hospital das Clínicas

Sistema web para gerenciamento de empréstimo de chaves e controle de salas em um ambiente hospitalar universitário. Desenvolvido com foco em praticidade, rastreabilidade e integração futura com o Microsoft Bookings.

---

## 📋 Funcionalidades

- Integração com Microsoft Bookings para agendamentos de salas
- Login com verificação de email e senha (Mockoon)
- Visualização de agendamentos em tempo real com status visual
- Empréstimos e devoluções por senha de 4 dígitos
- Filtros por andar, sala e usuário
- Dashboard:
  - Agendamentos do horário vigente por andar
  - Status visual (verde = aguardando retirada, vermelho = já retirada, aguardando devolução)
  - Filtro dinâmico de andares
  - Novo Emprestimo Avulso(sem agendamento prévio)
- Módulo de Empréstimos:
  - Histórico completo de empréstimos
  - Filtros por:
    - Data inicial e final
    - Usuário
    - Sala
    - Status (Em andamento, Finalizado, Em atraso)
- Módulo de infraestrutura:
  - Prédios, Salas, Andares, Chaves e Kits
  - Cadastro, edição e exclusão com modais personalizados
- Módulo de Usuários:
  - Criação e desativação de contas
  - Filtros por ativo/inativo
- Relatórios:
  - Relatório de Empréstimos por Período
  - Relatório de Devoluções em Atraso
  - Relatório de Utilização por Andar
  - Relatório de Utilização por Sala
  - Relatório de Utilização por Usuário
  - Relatório de Salas Mais Utilizadas
  - Relatório Completo com Filtros Avançados
  - Impressão rápida dos relatórios
- Tela de Perfil do Usuário:
  - Dados carregados do endpoint `/me` (Mockoon)
  - Alteração de senha e senha de assinatura (layout e campos)
- Interface responsiva com layout moderno
- Integração planejada com envio de alertas por SMS (alerta de atraso)


---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React + Vite
- **Estilização:** Tailwind CSS, shadcn/ui
- **Roteamento:** React Router DOM
- **Formulários:** React Hook Form + Zod (em módulos específicos)
- **Mock Backend:** [Mockoon](https://mockoon.com/) (Simulação de API REST)
 **PostgreSQL** (planejado): banco de dados real
- **Backend:** (planejado): implementação em Python com Django Rest Framework
- **Ícones:** Lucide-react
- **Gerenciamento de autenticação:** React Context
- **date-fns**: manipulação de datas

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

2. **Acesse a pasta do projeto

```bash
cd emprestimo-chaves-hc-FrontEnd
```

3. **Instale as dependências**
```bash
npm install
```

3. **Rode o servidor mockado (Mockoon)**
- Instale o [Mockoon](https://mockoon.com/)
- Importe o arquivo `Server-Mockoon.json` (incluso no repositório)
- Inicie o servidor na porta `3001`


4. **Execute o frontend**
```bash
npm run dev
```

5. **Acesse no navegador**
```
http://localhost:5173
```

---

## 📈 Status do Projeto

✅ Módulos concluídos:
- Dashboard (com filtro por andar e modal de senha)
- Emprestimos
- Infraestrutura (Prédios, Salas, Chaves, Kits)
- Usuários
- Perfil do Usuário
- Integração com servidor Mockoon
- Modal de criação de empréstimo avulso

🧪 Em testes:
- Edição de perfil

🔒 Acesso com autenticação via Mockoon (com futura migração para JWT no Django Rest Framework)

---

## 🔥 Próximos Passos

- [ ] Implementar backend real com Django Rest Framework
- [ ] Autenticação com JWT
- [ ] Tela de configurações (horários, bloqueios)
- [ ] Relatório de acessos de usuários
- [ ] Notificações visuais (devoluções pendentes)
- [ ] Modo escuro/claro
- [ ] Integração com Microsoft Bookings
- [ ] Página de login e recuperação de senha finalizadas
- [ ] Backend real com Django Rest Framework + PostgreSQL
- [ ] Aplicativo Mobile para controle de chaves e acesso a horários

---

## 👩‍💻 Desenvolvido por:

**José Alexandre Maranhão**

---

