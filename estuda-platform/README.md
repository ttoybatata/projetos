# Estuda — plataforma educacional adaptativa

Fundação inicial em desenvolvimento; ainda não é a plataforma completa de produção.

## Esta etapa inclui
- Interface responsiva inicial de cadastro/login, painel, diagnóstico inicial e estado vazio.
- API Express com validação Zod, hash de senha, sessão em cookie HttpOnly, limite de tentativas na autenticação e endpoints de perfil/diagnóstico/painel.
- Modelos Prisma para usuários, diagnóstico e tentativas de atividade.
- Testes unitários iniciais, testes E2E Playwright e workflow de CI.
- Documentação de exploração com Playwright CLI da Microsoft em docs/PLAYWRIGHT_CLI.md.

## Limitações conhecidas
- O código de recuperação é emitido no cadastro e seu hash é guardado, mas a recuperação ainda não foi implementada.
- O diagnóstico tem uma pergunta inicial; o diagnóstico adaptativo completo por série/habilidade virá em etapa posterior.
- Currículo completo, aulas/atividades/simulados, redação, tutor IA, edição de perfil e trilhas ainda não estão implementados.
- SQLite é usado para desenvolvimento local. Antes de produção, configurar PostgreSQL e validar migrações, backups, segurança e privacidade.
- Nenhum teste é considerado aprovado até ser realmente executado e os logs conferidos.

## Executar localmente
Requer Node.js 22+ e npm.
1. Copie .env.example para .env.
2. Defina JWT_SECRET aleatório com pelo menos 32 caracteres.
3. Execute npm install.
4. Execute npm run db:generate.
5. Execute npm run db:migrate -- --name init.
6. Execute npm run dev.
7. Abra http://localhost:5173; API em http://localhost:3000.

## Fluxo de trabalho
Cada mudança significativa deve ter Issue, branch e PR para main. O PR deve listar escopo, riscos, comandos realmente executados, resultados e testes não executados. Não fazer merge automaticamente.