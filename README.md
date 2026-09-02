# DevPulse

Sistema de monitoramento de APIs e serviços.

O DevPulse realiza verificações periódicas em serviços cadastrados, registrando o status, código HTTP e tempo de resposta. Os resultados das verificações são armazenados em um banco PostgreSQL para consulta do histórico.

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- React
- Vite
- Recharts

## Requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js
- npm
- PostgreSQL

## Instalação

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
cd devpulse
```

Instale as dependências:

```bash
npm install
```

## Configuração do banco de dados

O projeto utiliza PostgreSQL.

Crie um banco de dados chamado:

```text
devpulse
```

Configure o arquivo `.env` na raiz do projeto.

Utilize o `.env.example` como modelo:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/devpulse
DB_PASSWORD=SUA_SENHA
```

Substitua `SUA_SENHA` pela senha do usuário PostgreSQL utilizado no ambiente local.

> O arquivo `.env` contém informações sensíveis e não deve ser enviado para o repositório.

## Inicialização do banco

Após configurar o `.env`, execute:

```bash
npm run db:init
```

Esse comando executa o arquivo `schema.sql` e cria a estrutura necessária no banco de dados.

## Executando o projeto

Para iniciar o projeto em modo de desenvolvimento:

```bash
npm run dev
```

O servidor será iniciado e os monitores cadastrados começarão a ser verificados.

## Scripts disponíveis

### Desenvolvimento

```bash
npm run dev
```

Inicia o servidor em modo de desenvolvimento utilizando TypeScript.

### Banco de dados

```bash
npm run db:init
```

Inicializa a estrutura do banco de dados utilizando o arquivo `schema.sql`.

## Banco de dados

O sistema utiliza PostgreSQL.

### Tabela `monitors`

Armazena os monitores cadastrados.

Principais campos:

- `id` — identificador do monitor
- `name` — nome do monitor
- `url` — endereço que será monitorado
- `status` — situação atual do monitor
- `status_code` — código HTTP retornado
- `response_time` — tempo de resposta

### Tabela `monitor_history`

Armazena o histórico das verificações realizadas.

Principais campos:

- `id` — identificador do registro
- `monitor_id` — monitor relacionado
- `status` — resultado da verificação
- `status_code` — código HTTP retornado
- `response_time` — tempo de resposta
- `checked_at` — data e hora da verificação

A tabela `monitor_history` possui uma relação com a tabela `monitors` por meio da chave estrangeira `monitor_id`.

## Estrutura do projeto

```text
devpulse/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── scripts/
│   └── db-init.ts
│
├── src/
│   ├── database/
│   │   └── db.ts
│   ├── jobs/
│   │   └── monitor.job.ts
│   ├── routes/
│   │   └── monitor.routes.ts
│   ├── services/
│   │   └── monitor.service.ts
│   ├── types/
│   │   ├── monitor-history.ts
│   │   └── monitor.ts
│   └── server.ts
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── schema.sql
└── README.md
```

## Segurança

As variáveis de ambiente utilizadas pelo projeto devem permanecer no arquivo `.env`.

O `.env` não deve ser versionado no Git.

O arquivo `.env.example` existe apenas como modelo de configuração para outros ambientes.

Nunca coloque senhas reais, tokens ou outras credenciais no `.env.example`.

## Funcionamento

O fluxo básico do sistema é:

1. O servidor é iniciado.
2. O PostgreSQL é conectado.
3. Os monitores cadastrados são carregados.
4. O sistema realiza as verificações das URLs.
5. O status e o tempo de resposta são registrados.
6. Cada verificação é armazenada na tabela `monitor_history`.
7. O histórico pode ser utilizado para acompanhar o comportamento dos serviços monitorados.

## Status

Projeto em desenvolvimento.

Novas funcionalidades serão adicionadas conforme a evolução do projeto.