adaptação do meu projeto em linguagem python

# Sheets Sync API

API em **Node.js + Express** que sincroniza dados do **SQL Server** com o **Google Sheets** — endpoints REST + job agendado com `node-cron`.

Este projeto é uma reimplementação, em Node.js, de um pipeline de automação (SQL Server → Google Sheets) que eu já mantenho em produção usando Python (pyodbc/SQLAlchemy + gspread + Selenium). A ideia foi manter a mesma arquitetura e as mesmas decisões de projeto, só trocando a stack, para aprender Node.js aplicando um problema real que eu já entendo bem.

## Como funciona

```
SQL Server  --->  syncService.js  --->  Google Sheets
                        ^
                        |
              rota HTTP (sob demanda)
                        |
              job node-cron (agendado)
```

- **`GET /colaboradores`** — consulta o banco e retorna os dados em JSON.
- **`POST /colaboradores/sync`** — roda o pipeline completo e escreve os dados na planilha.
- **Job agendado** (`node-cron`) — roda a sincronização automaticamente nos horários definidos no `.env` (padrão: 08:00 e 17:00, horário de Brasília), do mesmo jeito que o Ofelia agenda meus containers Python.

## Modo demo

O projeto roda sem precisar de banco ou credenciais reais: com `DEMO_MODE=true` (padrão do `.env.example`), a API usa dados mockados e apenas *simula* a escrita no Google Sheets, retornando o resultado da operação normalmente. Isso deixa o projeto testável do zero por qualquer avaliador, sem setup de infraestrutura.

Para conectar em um banco e planilha reais, defina `DEMO_MODE=false` e preencha as demais variáveis no `.env`.

## Rodando localmente

```bash
npm install
cp .env.example .env
npm start
```

```bash
curl http://localhost:3000/health
curl http://localhost:3000/colaboradores
curl -X POST http://localhost:3000/colaboradores/sync
```

## Rodando com Docker

```bash
docker compose up -d --build
```

## Stack e decisões de projeto

| Camada | Escolha | Por quê |
|---|---|---|
| SQL Server | `mssql` (connection pool) | Equivalente ao `pyodbc`/`SQLAlchemy` que já uso em Python |
| Google Sheets | `google-spreadsheet` + service account | Equivalente ao `gspread` |
| Agendamento | `node-cron` | Equivalente ao Ofelia, só que embutido no processo Node |
| Logs | `winston` (console + arquivo) | Log estruturado, igual ao padrão que uso com `Rich`/logging em Python |
| Configuração | `dotenv` | Mesma lógica de `.env` por serviço que já uso na migração para Docker |

## Possíveis próximos passos

- Adicionar mais rotas (ex: `/log-acesso`, espelhando as tabelas `LOGEXPORTACAO`/`LOGOPERACAO` que já trabalho em produção)
- Autenticação na API (API key ou JWT)
- Testes automatizados (Jest + supertest)
- Retry/backoff para erros de quota da API do Google Sheets (equivalente ao problema de 429 que já resolvi no pipeline Python)
