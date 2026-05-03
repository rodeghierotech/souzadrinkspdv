# 🍺 Santa Adega — Sistema PDV

Sistema de Ponto de Venda completo para a Santa Adega. Comandas, produtos, leitor de código de barras e autenticação admin.

## Stack

- **Next.js 15** (App Router)
- **Drizzle ORM** + **SQLite** (better-sqlite3)
- **Better Auth** (autenticação local)
- **shadcn/ui** + **TailwindCSS**
- **TanStack React Query**

---

## 🚀 Instalação e Setup

### 1. Instalar dependências

```bash
npm install
# ou
pnpm install
# ou
yarn install
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
BETTER_AUTH_SECRET=sua-chave-secreta-super-segura-minimo-32-caracteres
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=./santa-adega.db
```

> ⚠️ A chave `BETTER_AUTH_SECRET` deve ter pelo menos 32 caracteres. Use um gerador de string aleatória.

### 3. Rodar as migrations do banco de dados

```bash
npm run db:push
```

Isso cria o arquivo `santa-adega.db` com todas as tabelas necessárias.

**Alternativa — usando migrate:**

```bash
npm run db:migrate
```

### 4. Popular o banco com produtos de exemplo (opcional)

```bash
npm run db:seed
```

Isso insere 15 produtos nas categorias: cerveja, copão, combo e bebida.

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Primeiro Acesso

1. Acesse `/login`
2. Clique em **"Criar conta admin"**
3. Informe nome, email e senha (mínimo 8 caracteres)
4. Faça login

O sistema redireciona automaticamente para o PDV.

---

## 📦 Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar produção |
| `npm run db:push` | Aplicar schema ao banco (desenvolvimento) |
| `npm run db:migrate` | Rodar migrations formais |
| `npm run db:generate` | Gerar nova migration a partir do schema |
| `npm run db:studio` | Abrir Drizzle Studio (GUI do banco) |
| `npm run db:seed` | Popular banco com dados de exemplo |

---

## 🖥️ Funcionalidades

### PDV (Balcão)
- Criar comandas com nome, número ou geração automática
- Grid de produtos com filtro por categoria
- Busca rápida por nome
- Adicionar produto com 1 clique
- Suporte a leitor de código de barras (USB/Bluetooth)
- Feedback visual ao adicionar produto
- Painel lateral com itens da comanda e total em tempo real
- Fechar ou cancelar comanda

### Leitor de Código de Barras
- Plug-and-play — leitores USB funcionam como teclado
- Ao escanear: busca o produto e adiciona na comanda automaticamente
- Se não encontrado: abre modal de cadastro rápido com o código preenchido

### Produtos
- Cadastro com nome, preço, categoria e código de barras
- Edição e remoção (soft delete)
- Filtro por categoria e busca por nome/código
- Tabela com ações contextuais (hover)

### Comandas - Histórico
- Filtro por status: Abertas, Fechadas, Canceladas, Todas
- Resumo de faturamento
- Detalhe da comanda ao clicar

---

## 🎨 Design

Tema escuro inspirado na logo da Santa Adega:
- Fundo: `#080808` / `#111111`
- Dourado: `#C9A84C` / `#E8C96A`
- Tipografia: Playfair Display (display) + Inter (corpo)

---

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/login/          # Página de login
│   ├── (dashboard)/
│   │   ├── layout.tsx         # Layout com sidebar
│   │   ├── pdv/               # Tela do caixa
│   │   ├── comandas/          # Histórico de comandas
│   │   └── produtos/          # Gestão de produtos
│   ├── api/
│   │   ├── auth/[...all]/     # Better Auth handler
│   │   ├── produtos/          # CRUD de produtos
│   │   └── comandas/          # CRUD de comandas + itens
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/sidebar.tsx     # Navegação lateral
│   ├── pdv/                   # Componentes do PDV
│   │   ├── comanda-card.tsx
│   │   ├── comanda-detail.tsx
│   │   ├── nova-comanda-modal.tsx
│   │   └── produto-grid.tsx
│   ├── produtos/              # Componentes de produtos
│   │   ├── produto-form.tsx
│   │   └── produto-table.tsx
│   ├── ui/                    # shadcn/ui components
│   └── providers.tsx
├── db/
│   ├── index.ts               # Conexão SQLite
│   ├── schema.ts              # Schema Drizzle
│   ├── seed.ts                # Seed de dados
│   └── migrations/
├── hooks/
│   ├── use-comandas.ts        # React Query - comandas
│   ├── use-produtos.ts        # React Query - produtos
│   └── use-barcode.ts         # Hook leitor de código de barras
├── lib/
│   ├── auth.ts                # Better Auth server
│   ├── auth-client.ts         # Better Auth client
│   └── utils.ts               # Utilitários
├── middleware.ts              # Proteção de rotas
└── types/index.ts             # TypeScript types
```

---

## 🔧 Deploy em Produção

### Variáveis de ambiente para produção:

```env
BETTER_AUTH_SECRET=chave-producao-ultra-segura-32-chars
BETTER_AUTH_URL=https://seu-dominio.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://seu-dominio.com
```

### Build:

```bash
npm run build
npm run start
```

> Para deploy com SQLite em produção, certifique-se de usar um volume persistente para o arquivo `santa-adega.db`.

---

## 💡 Sugestões de Melhorias Futuras

1. **Relatório de vendas** — Faturamento por dia/semana/mês com gráficos
2. **Múltiplos usuários** — Roles (admin, operador) com permissões diferentes
3. **Impressão de comanda** — Integração com impressoras térmicas via ESC/POS
4. **Controle de estoque** — Quantidade em estoque por produto com alertas
5. **Formas de pagamento** — PIX, dinheiro, cartão com controle de troco
6. **Modo offline** — Service Worker + IndexedDB para funcionar sem internet
7. **Backup automático** — Export do banco SQLite agendado
8. **Dashboard analytics** — Produtos mais vendidos, horário de pico, ticket médio
9. **Multi-adega** — Suporte a múltiplas filiais com banco compartilhado (PostgreSQL)
10. **PWA** — Instalação como app no celular/tablet para uso no balcão

---

© 2025 Santa Adega · PDV v1.0
