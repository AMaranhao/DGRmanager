# 📚 Sistema de Empréstimo de Chaves - HC

Sistema web desenvolvido para a gestão digital de empréstimos de chaves de salas de aula no prédio universitário do HC.

---

## 📋 Funcionalidades

- Integração com Microsoft Bookings para agendamentos de salas
- Controle de empréstimo e devolução de chaves com senha de 4 dígitos
- Dashboard:
  - Agendamentos do horário vigente por andar
  - Status visual (verde = aguardando retirada, vermelho = já retirada)
  - Filtro dinâmico de andares
- Módulo de Empréstimos:
  - Histórico completo de empréstimos
  - Filtros por:
    - Data inicial e final
    - Usuário
    - Sala
    - Status (Em andamento, Finalizado, Em atraso)
- Módulo de Infraestrutura:
  - Cadastro, edição e exclusão de Prédios
  - Cadastro, edição e exclusão de Salas
  - Cadastro, edição e exclusão de Chaves
- Relatórios:
  - Relatório de Empréstimos por Período
  - Relatório de Empréstimos em Atraso
  - Relatório de Utilização por Andar
  - Relatório de Utilização por Sala
  - Relatório de Utilização por Usuário
  - Relatório de Salas Mais Utilizadas
  - Relatório Completo com Filtros Avançados
  - Impressão rápida dos relatórios
- Integração planejada com envio de alertas por SMS (alerta de atraso)

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **Tailwind CSS**: estilização moderna e responsiva
- **shadcn/ui**: biblioteca de componentes UI
- **Mockoon**: servidor mockado para simulação de API
- **PostgreSQL** (planejado): banco de dados real
- **Spring Boot** (planejado): desenvolvimento do backend
- **Lucide React**: Ícones SVG modernos
- **date-fns**: manipulação de datas

---

## 🛠️ Estrutura de Pastas

```
src/
├── assets/         # Imagens e ícones
├── components/     # Componentes visuais (Header, Sidebar, Layout)
├── pages/          # Páginas principais (Dashboard, Emprestimos, Infraestrutura, Relatorios, Login)
│   └── relatorios/ # Relatórios separados por arquivo
├── services/       # Serviços de API (apiService.js)
├── routes/         # Configuração de rotas (AppRoutes.jsx)
├── App.jsx         # Componente principal
└── main.jsx        # Arquivo de entrada
```

---

## 📥 Como baixar e rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/AMaranhao/emprestimo-chaves-hc-FrontEnd.git
```

### 2. Acesse a pasta do projeto

```bash
cd emprestimo-chaves-hc-FrontEnd
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
- ✅ Módulo de Empréstimos com filtros e visualização completa
- ✅ Administração de Prédios, Salas e Chaves
- ✅ Relatórios analíticos finalizados com filtros avançados e opção de impressão
- 🚧 Módulo de Kits (planejado)
- 🚧 Integração com API real Spring Boot (em breve)
- 🚧 Alertas de atraso por SMS (planejado)
- 🚧 Aplicação mobile (etapa futura)

---

## 🔥 Próximos Passos

- Desenvolvimento do módulo de Kits
- Administração de Usuários
- Implementar autenticação JWT
- Backend real com Spring Boot + PostgreSQL
- Dashboards analíticos com gráficos
- Aplicativo Mobile para controle de chaves

---

## 👩‍💻 Desenvolvido por:

**José Alexandre Maranhão**