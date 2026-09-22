# Fase 1 — Fundação técnica (Trilha/Estuda)

Baseado na seção 1.5.1 do PROMPT_MESTRE_MEGABRAIN, ajustado às decisões já tomadas:

- Banco de dados: migrar de MySQL (mysql2/Drizzle) para **PostgreSQL**.
- Login: manter **openId** por enquanto (troca para usuário+senha+senha de segurança fica para uma fase posterior).

## Tarefas

- [ ] **Migrar o driver/schema Drizzle de mysql2 para PostgreSQL**
  Trocar `drizzle-orm/mysql2` por `drizzle-orm/node-postgres` (ou equivalente), ajustar `drizzle.config.ts`, `server/db.ts` e os tipos de coluna do schema (`onDuplicateKeyUpdate` → `onConflictDoUpdate`, `$returningId` → `returning`, etc.).

- [ ] **Separar em dois bancos/schemas isolados**
  Criar `education_auth_db` (users, sessions, tokens) e `education_learning_db` (perfil, progresso, tentativas, conquistas, planos). Nunca misturar credenciais com dados educacionais. Definir se serão dois bancos físicos ou dois schemas no mesmo Postgres.

- [ ] **Revisar variáveis de ambiente e segredos**
  `.env.example` atualizado para Postgres (duas connection strings), confirmar ausência de segredos versionados no código.

- [ ] **Migrations e seeds idempotentes**
  Gerar migrations Drizzle para o novo schema Postgres; seeds idempotentes para dados de referência (currículo, matérias).

- [ ] **AGENTS.md**
  Documentar o contrato de execução do PROMPT_MESTRE (não inventar requisitos, não declarar etapa concluída sem evidência, toda Tarefa vira Issue trabalhada via PR que menciona a Issue) para qualquer agente futuro.

- [ ] **CI mínimo**
  GitHub Actions rodando lint, `tsc --noEmit` e `vitest run` a cada PR.

- [ ] **Observabilidade mínima**
  Base OpenTelemetry conforme já registrado como preferência do projeto.

## Critério de aceite da fase

Inicialização, conexão, migrations, isolamento dos dois bancos, build, lint e testes passando, sem segredos no código — validado com evidência reproduzível, não apenas "a tela parece funcionar".