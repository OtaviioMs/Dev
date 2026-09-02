# DevPulse — Manual completo de estudo e desenvolvimento

> Documento de referência do projeto **DevPulse**, reunindo os principais comandos, códigos, estrutura, decisões e explicações utilizados durante o desenvolvimento.
>
> **Fonte principal:** estado atual do projeto enviado em `devpulse.zip`.  
> Comandos de diagnóstico e fluxo Git também incluem procedimentos que foram utilizados/estudados durante o desenvolvimento.

---

## 1. O que é o DevPulse?

O **DevPulse** é um sistema de monitoramento de APIs e serviços.

A ideia é cadastrar uma URL e verificar periodicamente:

- se o serviço está online ou offline;
- código HTTP retornado;
- tempo de resposta;
- histórico das verificações;
- visualização do histórico no frontend.

### Fluxo geral

```text
React + Vite
     |
     | fetch HTTP
     v
Express / Node.js
     |
     +--> Rotas da API
     |
     +--> Serviço de monitoramento
     |
     +--> Job periódico
     |
     v
PostgreSQL
     |
     +--> monitors
     |
     +--> monitor_history
```

---

# 2. Tecnologias utilizadas

## Backend

- Node.js
- TypeScript
- Express
- PostgreSQL
- `pg`
- `dotenv`
- `cors`
- `tsx`

## Frontend

- React
- TypeScript
- Vite
- Recharts

## Ferramentas

- Visual Studio Code
- PostgreSQL / pgAdmin
- Insomnia
- Git
- GitHub

---

# 3. Pré-requisitos

Antes de executar o projeto em outro computador:

1. Node.js instalado
2. PostgreSQL instalado
3. Git instalado
4. VS Code (recomendado)
5. Um banco chamado `devpulse`

---

# 4. Criando/baixando o projeto

Se o projeto estiver no GitHub:

```bash
git clone <URL_DO_REPOSITORIO>
```

Entrar na pasta:

```bash
cd devpulse
```

### O que esses comandos fazem?

`git clone` baixa o repositório para o computador.

`cd devpulse` entra na pasta do projeto.

---

# 5. Instalação das dependências do backend

Na raiz do projeto:

```bash
npm install
```

Esse comando lê o `package.json` e instala as dependências.

Para desenvolvimento, o projeto utiliza principalmente:

```bash
npm install cors dotenv express pg
```

E ferramentas/types:

```bash
npm install -D @types/cors @types/express @types/node @types/pg tsx
```

> O `package.json` atual já registra essas dependências. Em um clone novo, normalmente basta `npm install`.

---

# 6. package.json do backend

Código atual:

```json
{
  "name": "devpulse",
  "version": "1.0.0",
  "description": "Sistema de monitoramento de APIs e serviços",
  "main": "src/server.ts",
  "scripts": {
  "dev": "tsx watch src/server.ts",
  "db:init": "tsx scripts/db-init.ts"
},

  "keywords": [
    "monitoring",
    "api",
    "uptime"
  ],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "pg": "^8.23.0",
    "recharts": "^3.10.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^24.6.0",
    "@types/pg": "^8.23.1",
    "ts-node-dev": "^2.0.0",
    "tsx": "^4.23.13",
    "typescript": "^7.0.2"
  }
}

```

## Scripts importantes

### Rodar backend em desenvolvimento

```bash
npm run dev
```

Executa:

```text
tsx watch src/server.ts
```

O `tsx watch` executa TypeScript e reinicia o processo quando arquivos são alterados.

### Inicializar banco

```bash
npm run db:init
```

Executa:

```text
tsx scripts/db-init.ts
```

---

# 7. TypeScript — tsconfig.json

Código atual:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

## Principais opções

### target

```json
"target": "ES2022"
```

Define o JavaScript de destino.

### module

```json
"module": "Node16"
```

Configura o sistema de módulos compatível com o ambiente Node.

### strict

```json
"strict": true
```

Ativa verificações mais rigorosas do TypeScript.

### skipLibCheck

```json
"skipLibCheck": true
```

Evita que o TypeScript valide detalhadamente os arquivos de declaração das bibliotecas.

---

# 8. .gitignore

Código atual:

```text
node_modules/
dist/
.env
```

## Por que isso é importante?

`node_modules/` não deve ser enviado para o GitHub.

`dist/` contém arquivos gerados.

`.env` normalmente contém credenciais e configurações locais.

---

# 9. Variáveis de ambiente

Arquivo:

```text
.env
```

O projeto usa variáveis de ambiente para informações do banco.

Modelo:

```text
.env.example
```

Código atual do exemplo:

```env
DATABASE_URL=postgresql://postgres:141414@localhost:5432/devpulse
DB_PASSWORD=141414
```

> O arquivo `.env` real é local e não deve ser colocado no GitHub.

---

# 10. PostgreSQL

O projeto utiliza um banco chamado:

```text
devpulse
```

A conexão é feita pelo backend.

No pgAdmin, a estrutura principal é:

```text
devpulse
└── public
    ├── monitors
    └── monitor_history
```

---

# 11. Schema do banco

Arquivo:

```text
schema.sql
```

Código atual:

```sql
-- ============================================
-- DevPulse - Database Schema
-- ============================================

-- Tabela de monitores
CREATE TABLE IF NOT EXISTS monitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    status_code INTEGER,
    response_time INTEGER
);

-- Tabela de histórico
CREATE TABLE IF NOT EXISTS monitor_history (
    id SERIAL PRIMARY KEY,
    monitor_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    status_code INTEGER,
    response_time INTEGER,
    checked_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES monitors(id)
        ON DELETE CASCADE
);

-- Índice para acelerar consultas do histórico
CREATE INDEX IF NOT EXISTS idx_monitor_history_monitor_id
    ON monitor_history(monitor_id);

CREATE INDEX IF NOT EXISTS idx_monitor_history_checked_at
    ON monitor_history(checked_at);
```

---

# 12. Entendendo a tabela monitors

A tabela `monitors` representa os serviços monitorados.

Campos principais:

| Campo | Função |
|---|---|
| id | identificador do monitor |
| name | nome do serviço |
| url | endereço monitorado |
| status | `up`, `down` ou `pending` |
| status_code | código HTTP |
| response_time | tempo de resposta em ms |

### PRIMARY KEY

```sql
id SERIAL PRIMARY KEY
```

O `id` identifica cada registro.

### NOT NULL

Exemplo:

```sql
name VARCHAR(255) NOT NULL
```

Significa que o campo não pode ficar vazio (`NULL`).

---

# 13. Entendendo monitor_history

Essa tabela guarda cada verificação realizada.

Campos:

| Campo | Função |
|---|---|
| id | identificador do histórico |
| monitor_id | monitor relacionado |
| status | resultado da verificação |
| status_code | código HTTP |
| response_time | tempo de resposta |
| checked_at | data/hora |

---

# 14. Chave estrangeira

Código:

```sql
FOREIGN KEY (monitor_id)
REFERENCES monitors(id)
ON DELETE CASCADE
```

Isso cria o relacionamento:

```text
monitors.id
     |
     +---- monitor_history.monitor_id
```

`ON DELETE CASCADE` significa que, se um monitor for apagado, seus registros de histórico também serão apagados.

---

# 15. Índices

O schema cria índices:

```sql
CREATE INDEX IF NOT EXISTS idx_monitor_history_monitor_id
    ON monitor_history(monitor_id);

CREATE INDEX IF NOT EXISTS idx_monitor_history_checked_at
    ON monitor_history(checked_at);
```

Eles ajudam consultas que filtram ou ordenam o histórico.

---

# 16. Inicialização automática do banco

Arquivo:

```text
scripts/db-init.ts
```

Código atual:

```ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import { pool } from "../src/database/db";

async function initDatabase() {
  try {
    const schemaPath = path.join(process.cwd(), "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    console.log("📦 Executando schema.sql...");

    await pool.query(schema);

    console.log("✅ Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
```

## O que acontece?

1. Carrega `.env`.
2. Lê `schema.sql`.
3. Envia o SQL para PostgreSQL.
4. Cria as tabelas que ainda não existem.
5. Fecha o pool.

Executar:

```bash
npm run db:init
```

---

# 17. Conexão com PostgreSQL

Arquivo:

```text
src/database/db.ts
```

Código atual:

```ts
import { Pool } from "pg";
import "dotenv/config";

export const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "devpulse",
});

pool.query("SELECT NOW()")
    .then(() => console.log("✅ PostgreSQL conectado!"))
    .catch((err) => console.error("❌ Erro no PostgreSQL:", err));
```

## Pool

```ts
new Pool(...)
```

O `Pool` administra conexões com PostgreSQL.

## Variável de ambiente

```ts
password: process.env.DB_PASSWORD
```

A senha é obtida do `.env`, em vez de ficar escrita diretamente no código.

## Teste de conexão

```ts
pool.query("SELECT NOW()")
```

Executa uma consulta simples para verificar se o banco responde.

---

# 18. Serviço de monitoramento

Arquivo:

```text
src/services/monitor.service.ts
```

Código atual:

```ts
export async function checkUrl(url: string): Promise<{
  status: "up" | "down";
  statusCode: number | null;
  responseTime: number;
}> {
  const start = Date.now();

  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    const response = await fetch(url, {
      signal: controller.signal
    });

    clearTimeout(timeout);

    const responseTime = Date.now() - start;

    return {
      status: response.ok ? "up" : "down",
      statusCode: response.status,
      responseTime
    };

  } catch (error) {
    const responseTime = Date.now() - start;

    return {
      status: "down",
      statusCode: null,
      responseTime
    };
  }
}
```

## checkUrl()

A função recebe:

```ts
url: string
```

E retorna:

```ts
{
  status,
  statusCode,
  responseTime
}
```

---

# 19. Medindo tempo de resposta

O código começa a contagem:

```ts
const start = Date.now();
```

Depois faz a requisição.

Ao receber a resposta:

```ts
const responseTime = Date.now() - start;
```

Exemplo:

```text
início: 1000 ms
fim:    1175 ms

1175 - 1000 = 175 ms
```

---

# 20. fetch()

O monitor usa:

```ts
fetch(url)
```

Ele realiza uma requisição HTTP para a URL.

O resultado é um objeto `Response`.

---

# 21. AbortController e timeout

O projeto utiliza:

```ts
const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 10000);
```

Isso estabelece um limite de aproximadamente 10 segundos.

Se a requisição não terminar:

```ts
controller.abort();
```

cancela a operação.

---

# 22. response.ok

O código:

```ts
response.ok ? "up" : "down"
```

considera a resposta bem-sucedida quando o status HTTP é tratado pelo `fetch` como OK.

O código HTTP é guardado em:

```ts
response.status
```

Exemplos:

```text
200
201
404
500
503
```

---

# 23. Tratamento de erro

Se a requisição falhar:

```ts
catch (error)
```

o monitor retorna:

```ts
{
  status: "down",
  statusCode: null,
  responseTime
}
```

Isso permite registrar uma falha mesmo quando não existe código HTTP disponível.

---

# 24. Tipos TypeScript

## Monitor

Arquivo:

```text
src/types/monitor.ts
```

Código:

```ts
export interface Monitor {
    id: number;
    name: string;
    url: string;
    status: "up" | "down" | "pending";
  statusCode?: number | null;
    responseTime?: number;
}
```

Esse `interface` descreve o formato esperado de um monitor.

---

## MonitorHistory

Arquivo:

```text
src/types/monitor-history.ts
```

Código:

```ts
export interface MonitorHistory {
    monitorId: number;
    status: "up" | "down";
    statusCode: number | null;
    responseTime: number;
    checkedAt: string;
}
```

Ele descreve o formato de uma entrada do histórico.

---

# 25. Job de monitoramento

Arquivo:

```text
src/jobs/monitor.job.ts
```

Código atual:

```ts
import { checkUrl } from "../services/monitor.service";
import { MonitorHistory } from "../types/monitor-history";
import { pool } from "../database/db";

export const history: MonitorHistory[] = [];

const MAX_HISTORY = 1000;

export async function runMonitorCheck() {
  console.log("[JOB] Executando verificação...");

  const dbResult = await pool.query(
  "SELECT * FROM monitors ORDER BY id ASC"
);

const monitors = dbResult.rows;

  console.log(`[JOB] Monitores cadastrados: ${monitors.length}`);

  for (const monitor of monitors) {
    const result = await checkUrl(monitor.url);

    monitor.status = result.status;

    monitor.statusCode = result.statusCode;
monitor.responseTime = result.responseTime;
history.push({
  monitorId: monitor.id,
  status: result.status,
  statusCode: result.statusCode,
  responseTime: result.responseTime,
  checkedAt: new Date().toISOString()
});

await pool.query(
  `
  UPDATE monitors
  SET
    status = $1,
    status_code = $2,
    response_time = $3
  WHERE id = $4
  `,
  [
    result.status,
    result.statusCode,
    result.responseTime,
    monitor.id
  ]
);

await pool.query(
  `
  INSERT INTO monitor_history
    (monitor_id, status, status_code, response_time, checked_at)
  VALUES
    ($1, $2, $3, $4, $5)
  `,
  [
    monitor.id,
    result.status,
    result.statusCode,
    result.responseTime,
    new Date()
  ]
);

if (history.length > MAX_HISTORY) {
    history.shift();
}

    console.log(
      `[MONITOR] ${monitor.name} → ${monitor.status} (${result.responseTime}ms)`
    );
  }
}
```

## O que o job faz?

Para cada monitor:

```text
1. Busca monitores no PostgreSQL
2. Testa a URL
3. Atualiza o status atual
4. Atualiza código HTTP
5. Atualiza tempo de resposta
6. Salva histórico
```

---

# 26. Histórico em memória x histórico no banco

Existe no código:

```ts
export const history: MonitorHistory[] = [];
```

Esse array é mantido em memória.

Porém, o histórico persistente é gravado em:

```text
monitor_history
```

no PostgreSQL.

Isso é importante porque dados em memória desaparecem quando o servidor reinicia.

O PostgreSQL mantém o histórico.

---

# 27. MAX_HISTORY

Existe:

```ts
const MAX_HISTORY = 1000;
```

e:

```ts
if (history.length > MAX_HISTORY) {
  history.shift();
}
```

Isso limita o array de histórico em memória.

**Importante:** isso não limita o número de registros existentes em `monitor_history` no PostgreSQL.

---

# 28. Rotas da API

Arquivo:

```text
src/routes/monitor.routes.ts
```

Código atual:

```ts
import { Router } from "express";
import { Monitor } from "../types/monitor";
import { checkUrl } from "../services/monitor.service";
import { pool } from "../database/db";

const router = Router();

export const monitors: Monitor[] = [];
console.log("[ROUTES] Array de monitores criado");

router.get("/monitors", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM monitors ORDER BY id ASC"
        );

        res.json({
            monitors: result.rows
        });
    } catch (error) {
        console.error("[DB] Erro ao buscar monitores:", error);

        res.status(500).json({
            message: "Erro ao buscar monitores"
        });
    }
});

router.get("/monitors/:id", (req, res) => {
  const id = Number(req.params.id);

  const monitor = monitors.find((monitor) => monitor.id === id);

  if (!monitor) {
    return res.status(404).json({
      message: "Monitor não encontrado"
    });
  }

  res.json(monitor);
});

router.delete("/monitors/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = monitors.findIndex((monitor) => monitor.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Monitor não encontrado"
        });
    }

    monitors.splice(index, 1);

    res.json({
        message: "Monitor removido com sucesso"
    });
});
router.put("/monitors/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { name, url } = req.body;

    const monitor = monitors.find((monitor) => monitor.id === id);

    if (!monitor) {
        return res.status(404).json({
            message: "Monitor não encontrado"
        });
    }
});
 router.post("/monitors", async (req, res) => {
    const { name, url } = req.body;

    if (!name || !url) {
        return res.status(400).json({
            message: "Nome e URL são obrigatórios"
        });
    }

    try {
        new URL(url);
    } catch {
        return res.status(400).json({
            message: "URL inválida"
        });
    }

    try {
        const existingMonitor = await pool.query(
            "SELECT * FROM monitors WHERE url = $1",
            [url]
        );

        if (existingMonitor.rows.length > 0) {
            return res.status(409).json({
                message: "Este monitor já está cadastrado",
                monitor: existingMonitor.rows[0]
            });
        }

        const result = await checkUrl(url);

        const dbResult = await pool.query(
            `INSERT INTO monitors (name, url, status)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, url, result.status]
        );

        console.log("[DB] Monitor adicionado:", dbResult.rows[0]);

        res.status(201).json({
            monitor: dbResult.rows[0],
            statusCode: result.statusCode,
            responseTime: result.responseTime
        });

    } catch (error) {
        console.error("[DB] Erro ao adicionar monitor:", error);

        res.status(500).json({
            message: "Erro ao adicionar monitor"
        });
    }
});

router.get("/monitors/:id/history", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query(
      `
      SELECT
        monitor_id AS "monitorId",
        status,
        status_code AS "statusCode",
        response_time AS "responseTime",
        checked_at AS "checkedAt"
      FROM monitor_history
      WHERE monitor_id = $1
      ORDER BY checked_at ASC
      LIMIT 1000
      `,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("[DB] Erro ao buscar histórico:", error);

    res.status(500).json({
      message: "Erro ao buscar histórico"
    });
  }
});


export default router;
```

---

# 29. GET /

Endpoint:

```http
GET /
```

Retorna:

```json
{
  "message": "DevPulse API online 🚀"
}
```

Serve como uma verificação simples de que a API está funcionando.

---

# 30. GET /monitors

Endpoint:

```http
GET /monitors
```

Consulta:

```sql
SELECT * FROM monitors ORDER BY id ASC
```

Retorna os monitores cadastrados.

Exemplo:

```json
{
  "monitors": [
    {
      "id": 1,
      "name": "Google",
      "url": "https://www.google.com",
      "status": "up"
    }
  ]
}
```

---

# 31. POST /monitors

Endpoint:

```http
POST /monitors
```

Body:

```json
{
  "name": "Google",
  "url": "https://www.google.com"
}
```

## Validações

Primeiro verifica:

```ts
if (!name || !url)
```

Depois valida a URL:

```ts
new URL(url)
```

Se a URL for inválida, retorna:

```http
400 Bad Request
```

---

# 32. Evitando monitores duplicados

Antes de cadastrar:

```sql
SELECT * FROM monitors WHERE url = $1
```

O `$1` recebe a URL.

Se já existir:

```http
409 Conflict
```

Isso evita cadastrar a mesma URL novamente.

---

# 33. SQL parametrizado

Exemplo:

```ts
await pool.query(
  "SELECT * FROM monitors WHERE url = $1",
  [url]
);
```

O valor é enviado separadamente.

Isso é preferível a montar SQL concatenando strings.

Exemplo que deve ser evitado:

```ts
"SELECT * FROM monitors WHERE url = '" + url + "'"
```

---

# 34. POST e primeira verificação

Ao criar o monitor, o sistema chama:

```ts
const result = await checkUrl(url);
```

Assim o monitor já pode ser cadastrado com seu status inicial.

---

# 35. GET /monitors/:id/history

Endpoint:

```http
GET /monitors/1/history
```

Consulta o histórico:

```sql
SELECT
    monitor_id AS "monitorId",
    status,
    status_code AS "statusCode",
    response_time AS "responseTime",
    checked_at AS "checkedAt"
FROM monitor_history
WHERE monitor_id = $1
ORDER BY checked_at ASC
LIMIT 1000
```

O frontend utiliza esse resultado para montar a lista e o gráfico.

---

# 36. GET /monitors/:id, PUT e DELETE — situação atual

No estado atual do projeto, essas rotas ainda possuem código legado que utiliza o array:

```ts
export const monitors: Monitor[] = [];
```

Enquanto:

- `GET /monitors`
- `POST /monitors`
- `GET /monitors/:id/history`
- o job

já utilizam PostgreSQL.

## Próxima melhoria importante

Migrar completamente:

```text
GET /monitors/:id
PUT /monitors/:id
DELETE /monitors/:id
```

para PostgreSQL.

Isso evita ter duas fontes de verdade:

```text
Array em memória
       +
PostgreSQL
```

O ideal é:

```text
PostgreSQL = fonte oficial dos dados
```

---

# 37. Servidor Express

Arquivo:

```text
src/server.ts
```

Código atual:

```ts
import express from "express";
import cors from "cors";
import monitorRoutes from "./routes/monitor.routes";
import { runMonitorCheck } from "./jobs/monitor.job";

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.use(monitorRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "DevPulse API online 🚀"
  });
});

app.listen(3000, () => {
  console.log("DevPulse está rodando em http://localhost:3000");

  runMonitorCheck();

  setInterval(() => {
    runMonitorCheck().catch((error) => {
      console.error("[JOB ERROR]", error);
    });
  }, 30000);
});
```

---

# 38. Express

Criação:

```ts
const app = express();
```

Isso cria a aplicação HTTP.

---

# 39. CORS

Código:

```ts
app.use(cors({
  origin: "http://localhost:5173"
}));
```

Permite que o frontend local faça requisições para o backend.

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

Como são origens diferentes, CORS precisa ser configurado.

---

# 40. JSON

Código:

```ts
app.use(express.json());
```

Permite que o Express interprete bodies JSON enviados nas requisições.

Exemplo:

```json
{
  "name": "Google",
  "url": "https://www.google.com"
}
```

---

# 41. Job periódico

Ao iniciar o servidor:

```ts
runMonitorCheck();
```

Depois:

```ts
setInterval(() => {
  runMonitorCheck()
}, 30000);
```

30 segundos:

```text
30000 ms = 30 segundos
```

Portanto:

```text
Servidor inicia
      ↓
Verificação imediata
      ↓
30 segundos
      ↓
Nova verificação
      ↓
30 segundos
      ↓
Nova verificação
```

---

# 42. Rodando o backend

Na raiz:

```bash
npm run dev
```

Esperado:

```text
DevPulse está rodando em http://localhost:3000
```

E a verificação do PostgreSQL deve aparecer no terminal.

---

# 43. Frontend

Entrar na pasta:

```bash
cd frontend
```

Instalar dependências:

```bash
npm install
```

Executar:

```bash
npm run dev
```

O Vite normalmente disponibiliza:

```text
http://localhost:5173
```

---

# 44. package.json do frontend

Código atual:

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "recharts": "^3.10.1"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "oxlint": "^1.79.0",
    "typescript": "~6.0.2",
    "vite": "^8.2.2"
  }
}

```

Principais dependências:

- React
- React DOM
- Recharts

Principais ferramentas:

- Vite
- TypeScript
- plugin React
- oxlint

---

# 45. main.tsx

Código atual:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

Esse arquivo é o ponto de entrada do React.

Ele encontra:

```html
<div id="root"></div>
```

e renderiza:

```tsx
<App />
```

---

# 46. App.tsx

Arquivo principal da interface:

```text
frontend/src/App.tsx
```

Código atual completo:

```tsx
import { useEffect, useState } from "react";
import "./App.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Monitor {
  id: number;
  name: string;
  url: string;
  status: string;
  status_code: number | null;
  response_time: number | null;
}

interface MonitorHistory {
  monitorId: number;
  status: string;
  statusCode: number | null;
  responseTime: number | null;
  checkedAt: string;
}

function App() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonitor, setSelectedMonitor] =
    useState<Monitor | null>(null);

  const [history, setHistory] = useState<MonitorHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // =========================
  // CARREGAR MONITORES
  // =========================

  const loadMonitors = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/monitors"
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar monitores");
      }

      const data = await response.json();

      setMonitors(data.monitors || []);
    } catch (error) {
      console.error(
        "Erro ao carregar monitores:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CARREGAR HISTÓRICO
  // =========================

  const loadHistory = async (monitorId: number) => {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        `http://localhost:3000/monitors/${monitorId}/history`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar histórico");
      }

      const data = await response.json();

      setHistory(data);
    } catch (error) {
      console.error(
        "Erro ao carregar histórico:",
        error
      );

      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // =========================
  // INICIALIZAÇÃO
  // =========================

  useEffect(() => {
    loadMonitors();

    const interval = setInterval(
      loadMonitors,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  // =========================
  // RESUMO
  // =========================

  const online = monitors.filter(
    (monitor) => monitor.status === "up"
  ).length;

  const offline = monitors.length - online;

  // =========================
  // TELA DE DETALHES
  // =========================

  if (selectedMonitor) {
    return (
      <div className="app">
        <main>
          <section className="details">

            <button
              className="back-button"
              onClick={() => {
                setSelectedMonitor(null);
                setHistory([]);
              }}
            >
              ← Voltar para monitores
            </button>

            {/* CABEÇALHO */}

            <div className="details-header">

              <div>
                <div className="details-title">

                  <span
                    className={`status-dot ${
                      selectedMonitor.status === "up"
                        ? "status-online"
                        : "status-offline"
                    }`}
                  />

                  <h2>
                    {selectedMonitor.name}
                  </h2>

                </div>

                <a
                  href={selectedMonitor.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedMonitor.url}
                </a>
              </div>

              <span
                className={`status-badge ${
                  selectedMonitor.status === "up"
                    ? "badge-online"
                    : "badge-offline"
                }`}
              >
                <span className="badge-dot" />

                {selectedMonitor.status === "up"
                  ? "Online"
                  : "Offline"}
              </span>

            </div>

            {/* RESUMO */}

            <div className="details-summary">

              <div className="details-card">
                <span>Status HTTP</span>

                <strong>
                  {selectedMonitor.status_code ?? "-"}
                </strong>
              </div>

              <div className="details-card">
                <span>Tempo de resposta</span>

                <strong>
                  {selectedMonitor.response_time != null
                    ? `${selectedMonitor.response_time} ms`
                    : "-"}
                </strong>
              </div>
            </div>

              <div className="details-card">
                <span>Verificações</span>

{/* GRÁFICO DE TEMPO DE RESPOSTA */}

<div className="history-section">
  <div className="section-header">
    <div>
      <h2>Tempo de resposta</h2>
      <p>Desempenho das últimas verificações</p>
    </div>
  </div>

  <div style={{ width: "100%", height: 300 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={history}
        margin={{
          top: 10,
          right: 20,
          left: 0,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="checkedAt"
          tickFormatter={(value) =>
            new Date(value).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          }
        />

        <YAxis />

       <Tooltip
  labelFormatter={(value) =>
    new Date(String(value)).toLocaleString("pt-BR")
  }
/>

        <Line
          type="monotone"
          dataKey="responseTime"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
  
</div>

 

            </div>

            {/* HISTÓRICO */}

            <div className="history-section">

              <div className="section-header">

                <div>
                  <h2>Histórico</h2>

                  <p>
                    Últimas verificações realizadas
                  </p>
                </div>

              </div>

              {historyLoading ? (
                <div className="empty">
                  <h3>
                    Carregando histórico...
                  </h3>
                </div>
              ) : history.length === 0 ? (
                <div className="empty">
                  <h3>
                    Nenhum histórico encontrado
                  </h3>
                </div>
              ) : (
                <div className="history-list">

                  {history
                    .slice()
                    .reverse()
                    .map((item, index) => {

                      const isOnline =
                        item.status === "up";

                      return (
                        <div
                          className="history-row"
                          key={`${item.checkedAt}-${index}`}
                        >

                          <div className="history-status">

                            <span
                              className={`status-dot ${
                                isOnline
                                  ? "status-online"
                                  : "status-offline"
                              }`}
                            />

                            <strong>
                              {isOnline
                                ? "Online"
                                : "Offline"}
                            </strong>

                          </div>

                          <div>
                            <span>HTTP</span>

                            <strong>
                              {item.statusCode ?? "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Resposta</span>

                            <strong>
                              {item.responseTime != null
                                ? `${item.responseTime} ms`
                                : "-"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Verificado em
                            </span>

                            <strong>
                              {new Date(
                                item.checkedAt
                              ).toLocaleString(
                                "pt-BR"
                              )}
                            </strong>
                          </div>

                        </div>
                      );
                    })}

                </div>
              )}

            </div>

          </section>
        </main>
      </div>
    );
  }

  // =========================
  // DASHBOARD PRINCIPAL
  // =========================

  return (
    <div className="app">

      <header className="header">

        <div>

          <div className="logo">
            <span className="logo-icon">
              ●
            </span>

            <h1>DevPulse</h1>
          </div>

          <p>
            Monitoramento de APIs e serviços em tempo real
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={loadMonitors}
          disabled={loading}
        >
          <span>↻</span>

          {loading
            ? "Atualizando..."
            : "Atualizar"}
        </button>

      </header>

      <main>

        {/* RESUMO */}

        <section className="summary">

          <div className="summary-card">

            <div className="summary-top">
              <span>
                Total de monitores
              </span>

              <div className="summary-icon">
                ◉
              </div>
            </div>

            <strong>
              {monitors.length}
            </strong>

            <small>
              Monitores cadastrados
            </small>

          </div>

          <div className="summary-card online-card">

            <div className="summary-top">
              <span>Online</span>

              <div className="summary-icon">
                ✓
              </div>
            </div>

            <strong>
              {online}
            </strong>

            <small>
              Serviços funcionando
            </small>

          </div>

          <div className="summary-card offline-card">

            <div className="summary-top">
              <span>Offline</span>

              <div className="summary-icon">
                !
              </div>
            </div>

            <strong>
              {offline}
            </strong>

            <small>
              Serviços indisponíveis
            </small>

          </div>

        </section>

        {/* MONITORES */}

        <section className="monitors">

          <div className="section-header">

            <div>
              <h2>Monitores</h2>

              <p>
                Acompanhe o status dos seus serviços
              </p>
            </div>

            <span className="monitor-count">

              {loading
                ? "Carregando..."
                : `${monitors.length} monitor${
                    monitors.length === 1
                      ? ""
                      : "es"
                  }`}

            </span>

          </div>

          {monitors.length === 0 &&
          !loading ? (

            <div className="empty">

              <div className="empty-icon">
                ◌
              </div>

              <h3>
                Nenhum monitor cadastrado
              </h3>

              <p>
                Adicione um monitor pela API
                para começar o monitoramento.
              </p>

            </div>

          ) : (

            <div className="monitor-list">

              {monitors.map((monitor) => {

                const isOnline =
                  monitor.status === "up";

                return (
                  <div
                    className="monitor-card"
                    key={monitor.id}
                    onClick={() => {
                      setSelectedMonitor(
                        monitor
                      );

                      loadHistory(
                        monitor.id
                      );
                    }}
                  >

                    <div className="monitor-main">

                      <div
                        className={`status-dot ${
                          isOnline
                            ? "status-online"
                            : "status-offline"
                        }`}
                      />

                      <div className="monitor-info">

                        <h3>
                          {monitor.name}
                        </h3>

                        <a
                          href={monitor.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          {monitor.url}
                        </a>

                      </div>

                    </div>

                    <div className="monitor-status">

                      <span
                        className={`status-badge ${
                          isOnline
                            ? "badge-online"
                            : "badge-offline"
                        }`}
                      >

                        <span className="badge-dot" />

                        {isOnline
                          ? "Online"
                          : "Offline"}

                      </span>

                    </div>

                    <div className="monitor-data">

                      <div>
                        <span>HTTP</span>

                        <strong>
                          {monitor.status_code ??
                            "-"}
                        </strong>
                      </div>

                      <div>
                        <span>Resposta</span>

                        <strong>
                          {monitor.response_time !=
                          null
                            ? `${monitor.response_time} ms`
                            : "-"}
                        </strong>
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

      <footer>

        <span>
          ● Sistema ativo
        </span>

        <span>
          Atualização automática a cada
          5 segundos
        </span>

      </footer>

    </div>
  );
}

export default App;
```

---

# 47. useState

O frontend utiliza estados como:

```tsx
const [monitors, setMonitors] = useState<Monitor[]>([]);
```

O primeiro valor é o estado atual.

O segundo é a função para alterá-lo.

Exemplo:

```text
monitors
   ↓
lista atual

setMonitors(...)
   ↓
atualiza a lista
```

---

# 48. loadMonitors()

A função:

```tsx
fetch("http://localhost:3000/monitors")
```

consulta o backend.

Depois:

```tsx
const data = await response.json();
```

converte a resposta para objeto JavaScript.

E:

```tsx
setMonitors(data.monitors || []);
```

atualiza a interface.

---

# 49. useEffect

O frontend executa:

```tsx
useEffect(() => {
  loadMonitors();

  const interval = setInterval(
    loadMonitors,
    5000
  );

  return () => clearInterval(interval);
}, []);
```

Isso significa:

1. carrega os monitores quando a tela abre;
2. atualiza a cada 5 segundos;
3. limpa o intervalo quando o componente é desmontado.

---

# 50. Por que frontend 5s e backend 30s?

Atualmente:

```text
Backend verifica URL: 30s
Frontend atualiza dados: 5s
```

O frontend consulta o estado atual do banco/API com mais frequência.

Isso não significa que a URL seja testada a cada 5 segundos.

Quem realmente testa a URL é o job do backend.

---

# 51. Online e Offline

O frontend calcula:

```tsx
const online = monitors.filter(
  (monitor) => monitor.status === "up"
).length;
```

E:

```tsx
const offline = monitors.length - online;
```

Assim cria os números do dashboard.

---

# 52. Seleção de monitor

Quando o usuário clica em um card:

```tsx
setSelectedMonitor(monitor);
loadHistory(monitor.id);
```

Isso:

1. seleciona o monitor;
2. carrega seu histórico;
3. muda a interface para a página de detalhes.

---

# 53. Histórico

O frontend consulta:

```text
GET /monitors/:id/history
```

através de:

```tsx
fetch(
  `http://localhost:3000/monitors/${monitorId}/history`
)
```

---

# 54. Recharts

O gráfico utiliza:

```tsx
LineChart
Line
XAxis
YAxis
CartesianGrid
Tooltip
ResponsiveContainer
```

A propriedade:

```tsx
data={history}
```

alimenta o gráfico.

A linha utiliza:

```tsx
dataKey="responseTime"
```

Portanto o gráfico representa:

```text
tempo de resposta
```

em milissegundos.

---

# 55. Histórico visual

A lista usa:

```tsx
history
  .slice()
  .reverse()
  .map(...)
```

### slice()

Cria uma cópia do array.

### reverse()

Inverte a ordem.

### map()

Percorre cada registro e cria um elemento React.

---

# 56. CSS

Arquivo:

```text
frontend/src/App.css
```

Código atual:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
  background: #0b0f14;
  color: #f5f7fa;
}

button,
input {
  font-family: inherit;
}

.app {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at top right,
      rgba(37, 99, 235, 0.12),
      transparent 35%
    ),
    #0b0f14;
}

/* HEADER */

.header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 30px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #1d2630;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  color: #3b82f6;
  font-size: 20px;
}

.logo h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1px;
}

.header p {
  margin: 8px 0 0;
  color: #8b98a8;
  font-size: 14px;
}

.refresh-button {
  border: 1px solid #263241;
  background: #131a22;
  color: #e5e7eb;

  padding: 11px 17px;
  border-radius: 9px;

  cursor: pointer;
  font-size: 14px;

  transition: 0.2s;
}

.refresh-button:hover {
  background: #1a2430;
  border-color: #3b82f6;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.refresh-button span {
  margin-right: 7px;
  font-size: 17px;
}

/* MAIN */

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 24px 50px;
}

/* SUMMARY */

.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.summary-card {
  background: #111820;
  border: 1px solid #202b37;
  border-radius: 14px;

  padding: 22px;

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  color: #8d9aaa;
  font-size: 14px;
}

.summary-icon {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: #182230;
  color: #6ea8ff;
}

.summary-card strong {
  display: block;

  margin-top: 18px;

  font-size: 34px;
  line-height: 1;
}

.summary-card small {
  display: block;

  margin-top: 9px;

  color: #667384;
}

.online-card .summary-icon {
  color: #35d07f;
}

.offline-card .summary-icon {
  color: #ff5c67;
}

/* MONITORS */

.monitors {
  margin-top: 35px;
}

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;

  margin-bottom: 18px;
}

.section-header h2 {
  margin: 0;
  font-size: 21px;
}

.section-header p {
  margin: 6px 0 0;

  color: #718096;
  font-size: 14px;
}

.monitor-count {
  color: #7f8c9c;
  font-size: 14px;
}

/* MONITOR CARD */

.monitor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.monitor-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 30px;

  background: #111820;
  border: 1px solid #202b37;

  border-radius: 13px;

  padding: 20px 22px;

  transition: 0.2s;
}

.monitor-card:hover {
  border-color: #334354;
  transform: translateY(-1px);
}

.monitor-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.status-dot {
  width: 11px;
  height: 11px;

  border-radius: 50%;

  flex-shrink: 0;
}

.status-online {
  background: #35d07f;
  box-shadow: 0 0 12px rgba(53, 208, 127, 0.5);
}

.status-offline {
  background: #ff5c67;
  box-shadow: 0 0 12px rgba(255, 92, 103, 0.5);
}

.monitor-info h3 {
  margin: 0 0 6px;

  font-size: 16px;
}

.monitor-info a {
  color: #728195;
  text-decoration: none;

  font-size: 13px;
}

.monitor-info a:hover {
  color: #6ea8ff;
}

/* STATUS */

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  padding: 7px 11px;

  border-radius: 20px;

  font-size: 12px;
  font-weight: 600;
}

.badge-online {
  background: rgba(53, 208, 127, 0.1);
  color: #35d07f;
}

.badge-offline {
  background: rgba(255, 92, 103, 0.1);
  color: #ff5c67;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* DATA */

.monitor-data {
  display: flex;
  align-items: center;
  gap: 35px;
}

.monitor-data div {
  min-width: 70px;
}

.monitor-data span {
  display: block;

  margin-bottom: 5px;

  color: #687789;
  font-size: 11px;
  text-transform: uppercase;
}

.monitor-data strong {
  font-size: 14px;
}

/* EMPTY */

.empty {
  padding: 70px 20px;

  text-align: center;

  background: #111820;
  border: 1px dashed #263241;
  border-radius: 13px;
}

.empty-icon {
  font-size: 35px;
  color: #4d5d70;
}

.empty h3 {
  margin: 15px 0 7px;
}

.empty p {
  margin: 0;

  color: #687789;
}

/* FOOTER */

footer {
  max-width: 1200px;
  margin: 0 auto;

  padding: 20px 24px 30px;

  display: flex;
  justify-content: space-between;

  border-top: 1px solid #1d2630;

  color: #657386;
  font-size: 12px;
}

footer span:first-child {
  color: #35d07f;
}

/* RESPONSIVO */

@media (max-width: 800px) {
  .header {
    align-items: flex-start;
    gap: 20px;
  }

  .summary {
    grid-template-columns: 1fr;
  }

  .monitor-card {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .monitor-data {
    justify-content: space-between;
  }

  footer {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;
  }

  .refresh-button {
    width: 100%;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
}
```

Esse arquivo contém o visual do dashboard, incluindo:

- cards;
- status online/offline;
- cabeçalho;
- monitor cards;
- indicadores;
- responsividade.

---

# 57. index.css

Código atual:

```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;

  font: 18px/145% var(--sans);
  letter-spacing: 0.18px;
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --code-bg: #1f2028;
    --accent: #c084fc;
    --accent-bg: rgba(192, 132, 252, 0.15);
    --accent-border: rgba(192, 132, 252, 0.5);
    --social-bg: rgba(47, 48, 58, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }

  #social .button-icon {
    filter: invert(1) brightness(2);
  }
}

#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

body {
  margin: 0;
}

h1,
h2 {
  font-family: var(--heading);
  font-weight: 500;
  color: var(--text-h);
}

h1 {
  font-size: 56px;
  letter-spacing: -1.68px;
  margin: 32px 0;
  @media (max-width: 1024px) {
    font-size: 36px;
    margin: 20px 0;
  }
}
h2 {
  font-size: 24px;
  line-height: 118%;
  letter-spacing: -0.24px;
  margin: 0 0 8px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
}
p {
  margin: 0;
}

code,
.counter {
  font-family: var(--mono);
  display: inline-flex;
  border-radius: 4px;
  color: var(--text-h);
}

code {
  font-size: 15px;
  line-height: 135%;
  padding: 4px 8px;
  background: var(--code-bg);
}

```

Esse arquivo veio da estrutura inicial do Vite e ainda possui regras gerais que podem ser refinadas para combinar totalmente com o layout do DevPulse.

---

# 58. Testando com Insomnia

A API pode ser testada com Insomnia.

## Health check

```http
GET http://localhost:3000/
```

## Listar monitores

```http
GET http://localhost:3000/monitors
```

## Criar monitor

```http
POST http://localhost:3000/monitors
Content-Type: application/json
```

Body:

```json
{
  "name": "Google",
  "url": "https://www.google.com"
}
```

## Buscar histórico

```http
GET http://localhost:3000/monitors/1/history
```

---

# 59. Status HTTP comuns

| Código | Significado |
|---:|---|
| 200 | OK |
| 201 | Criado |
| 400 | Requisição inválida |
| 404 | Não encontrado |
| 409 | Conflito |
| 500 | Erro interno |

No DevPulse:

```text
201 → monitor criado
400 → dados/URL inválidos
409 → URL já cadastrada
500 → erro interno
```

---

# 60. Comandos de diagnóstico

## Ver versão do Node

```bash
node -v
```

## Ver versão do npm

```bash
npm -v
```

## Ver dependências

```bash
npm ls
```

## Ver React, React DOM e Recharts

```bash
npm ls react react-dom recharts
```

Esse tipo de comando foi utilizado para investigar problemas de dependências do frontend.

---

# 61. Verificação TypeScript

Para verificar erros de TypeScript:

```bash
npx tsc --noEmit
```

O comando verifica os tipos sem gerar os arquivos compilados.

---

# 62. Git — comandos básicos utilizados no fluxo

Ver estado:

```bash
git status
```

Versão resumida:

```bash
git status --short
```

Adicionar arquivos:

```bash
git add .
```

Ou adicionar arquivos específicos:

```bash
git add package.json README.md scripts/
```

Criar commit:

```bash
git commit -m "docs: add project documentation and database init"
```

Enviar para GitHub:

```bash
git push
```

Ver últimos commits:

```bash
git log --oneline -5
```

Ver alterações de um arquivo:

```bash
git diff -- scripts/db-init.ts
```

---

# 63. Restaurar arquivo do Git

Durante o desenvolvimento, o `frontend/README.md` precisou ser restaurado.

Comando:

```bash
git restore frontend/README.md
```

Isso descarta a alteração local naquele arquivo e recupera a versão registrada no Git.

---

# 64. Fluxo Git recomendado

Depois de uma alteração:

```bash
git status
```

Ver o que mudou.

Depois:

```bash
git add .
```

Preparar os arquivos.

Depois:

```bash
git commit -m "descricao da alteracao"
```

Registrar a alteração.

Depois:

```bash
git push
```

Enviar para o GitHub.

---

# 65. Mudando de computador

O código pode ser recuperado do GitHub.

Fluxo:

```bash
git clone <URL_DO_REPOSITORIO>
cd devpulse
npm install
```

Depois configurar PostgreSQL.

Criar:

```text
devpulse
```

Depois configurar o `.env` localmente.

Então:

```bash
npm run db:init
```

E iniciar o backend:

```bash
npm run dev
```

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

---

# 66. O que o GitHub guarda e o que não guarda?

## Vai para o GitHub

```text
Código
package.json
tsconfig.json
schema.sql
README
frontend
scripts
```

## Não deve ir para o GitHub

```text
node_modules
.env
dist
```

## E os dados do PostgreSQL?

Os registros do banco não são automaticamente sincronizados pelo GitHub.

Por isso o projeto utiliza:

```text
schema.sql
```

para tornar a estrutura do banco reproduzível.

---

# 67. Arquitetura completa

O fluxo de uma verificação é:

```text
                    ┌──────────────────┐
                    │    PostgreSQL    │
                    │                  │
                    │    monitors      │
                    │ monitor_history  │
                    └────────▲─────────┘
                             │
                             │ SQL
                             │
                    ┌────────┴─────────┐
                    │     Backend      │
                    │                  │
                    │ Express          │
                    │ Routes           │
                    │ Monitor Service  │
                    │ Job              │
                    └────────▲─────────┘
                             │
                             │ HTTP
                             │
                    ┌────────┴─────────┐
                    │     Frontend     │
                    │                  │
                    │ React + Vite     │
                    │ Recharts         │
                    └──────────────────┘
```

---

# 68. Ciclo de monitoramento

```text
Job inicia
   ↓
SELECT * FROM monitors
   ↓
Para cada monitor
   ↓
checkUrl(url)
   ↓
fetch()
   ↓
mede responseTime
   ↓
descobre status/statusCode
   ↓
UPDATE monitors
   ↓
INSERT monitor_history
   ↓
próximo monitor
```

---

# 69. Ciclo do dashboard

```text
React inicia
   ↓
GET /monitors
   ↓
Backend consulta PostgreSQL
   ↓
React recebe JSON
   ↓
setMonitors()
   ↓
Dashboard renderiza
   ↓
5 segundos
   ↓
GET /monitors novamente
```

---

# 70. Pontos importantes para estudar

Se o objetivo é usar o DevPulse como projeto de estudo/portfólio, os conceitos mais importantes são:

## JavaScript/TypeScript

- `async/await`
- `try/catch`
- `Promise`
- interfaces
- tipos
- arrays
- `.map()`
- `.filter()`
- `Date`
- `fetch`

## Node.js

- módulos
- `process.env`
- `fetch`
- `AbortController`
- execução de scripts

## Express

- rotas
- middleware
- JSON
- CORS
- status HTTP
- `req`
- `res`

## PostgreSQL

- tabelas
- PK
- FK
- índices
- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`
- parâmetros `$1`, `$2`
- relacionamentos

## React

- componentes
- `useState`
- `useEffect`
- renderização condicional
- eventos
- props/estado
- `fetch`
- listas

## Git

- clone
- status
- add
- commit
- push
- diff
- restore
- log

---

# 71. Melhorias futuras recomendadas

A próxima etapa importante da API é terminar a migração das rotas para PostgreSQL.

## Prioridade 1

Corrigir:

```text
GET /monitors/:id
PUT /monitors/:id
DELETE /monitors/:id
```

para consultar/modificar diretamente o banco.

## Prioridade 2

Adicionar cadastro/edição pelo próprio frontend.

## Prioridade 3

Adicionar:

- autenticação;
- usuários;
- intervalos configuráveis;
- timeout configurável;
- uptime percentual;
- filtros de histórico;
- paginação;
- alertas;
- logs;
- tratamento melhor de falhas;
- Docker;
- deploy;
- testes automatizados.

---

# 72. Checklist para subir o projeto

Backend:

```bash
npm install
npm run db:init
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Testar:

```http
GET http://localhost:3000/
GET http://localhost:3000/monitors
```

E no navegador:

```text
http://localhost:5173
```

---

# 73. Resumo dos comandos principais

```bash
# Clonar
git clone <URL_DO_REPOSITORIO>

# Entrar
cd devpulse

# Instalar backend
npm install

# Inicializar banco
npm run db:init

# Rodar backend
npm run dev

# Entrar no frontend
cd frontend

# Instalar frontend
npm install

# Rodar frontend
npm run dev
```

Diagnóstico:

```bash
node -v
npm -v
npm ls
npm ls react react-dom recharts
npx tsc --noEmit
```

Git:

```bash
git status
git status --short
git add .
git commit -m "descricao"
git push
git log --oneline -5
git diff -- arquivo
git restore arquivo
```

---

# 74. Consultas PostgreSQL usadas durante o projeto

## Ver estrutura da tabela monitors

No `psql`:

```text
\d monitors
```

## Ver estrutura da tabela monitor_history

```text
\d monitor_history
```

## Ver colunas das tabelas

```sql
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('monitors', 'monitor_history')
ORDER BY table_name, ordinal_position;
```

## Ver últimas verificações

```sql
SELECT *
FROM monitor_history
ORDER BY checked_at DESC
LIMIT 10;
```

---

# 75. Regra de ouro do projeto

A arquitetura deve caminhar para uma única fonte oficial de dados:

```text
PostgreSQL
```

O frontend não deve guardar os dados permanentemente.

O backend é responsável pela lógica.

O PostgreSQL é responsável pela persistência.

O frontend é responsável pela apresentação e interação.

```text
Frontend
   ↓
Backend
   ↓
Database
```

Essa separação deixa o projeto mais organizado, escalável e próximo de uma arquitetura profissional.

---

# 76. Estado atual do projeto

O DevPulse já possui:

- backend Node + TypeScript;
- Express;
- PostgreSQL;
- criação automática do schema;
- cadastro de monitores;
- validação de URL;
- prevenção de URL duplicada;
- verificação HTTP;
- medição de tempo de resposta;
- job automático;
- histórico persistente;
- API de histórico;
- frontend React;
- dashboard;
- atualização automática;
- gráfico com Recharts;
- integração frontend/backend;
- documentação;
- Git/GitHub.

### Ponto técnico pendente

A API ainda possui algumas rotas de CRUD utilizando o array antigo em memória. A próxima refatoração deve eliminar essa inconsistência e deixar o PostgreSQL como fonte única dos monitores.

---

# 77. Como estudar usando este manual

Uma boa sequência é:

```text
1. Git
   ↓
2. Node.js
   ↓
3. TypeScript
   ↓
4. Express
   ↓
5. HTTP / APIs
   ↓
6. PostgreSQL / SQL
   ↓
7. React
   ↓
8. Integração frontend + backend
   ↓
9. Jobs
   ↓
10. Arquitetura
```

Não tente decorar os códigos.

Entenda:

```text
O que entra?
     ↓
O que o código faz?
     ↓
O que sai?
     ↓
Onde os dados ficam?
     ↓
Quem chama quem?
```

Esse raciocínio é mais importante do que decorar sintaxe.

---

# 78. Comandos em uma única folha de consulta

```bash
# Node
node -v
npm -v

# Projeto
git clone <URL>
cd devpulse
npm install

# Banco
npm run db:init

# Backend
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# TypeScript
npx tsc --noEmit

# Dependências
npm ls
npm ls react react-dom recharts

# Git
git status
git status --short
git add .
git commit -m "mensagem"
git push
git log --oneline -5
git diff -- arquivo
git restore arquivo
```

---

## Fim

Este arquivo deve ser mantido na raiz do repositório como material de estudo do DevPulse.

Sugestão de nome:

```text
DEV_PULSE_MANUAL.md
```
