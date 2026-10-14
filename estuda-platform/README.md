# Estuda — plataforma educacional adaptativa

Fundação inicial em desenvolvimento; ainda não é a plataforma completa de produção.

## Esta etapa inclui
- Interface responsiva inicial de cadastro/login, painel, diagnóstico inicial e estado vazio.
- API Express com validação Zod, hash de senha, sessão em cookie HttpOnly, limite de tentativas na autenticação, recuperação de conta com código de uso único, edição do perfil e endpoints de diagnóstico/painel.
- Modelos Prisma para usuários, diagnóstico e tentativas de atividade.
- Testes unitários iniciais, testes E2E Playwright e workflow de CI.
- Documentação de exploração com Playwright CLI da Microsoft em docs/PLAYWRIGHT_CLI.md.

## Limitações conhecidas
- A recuperação usa o nome de usuário e o código de uso único; após recuperar, a senha é trocada e um novo código é emitido. O código deve ser guardado pelo aluno e não é enviado por e-mail.
- O diagnóstico inicial usa perguntas por série, fluência de leitura e objetivos, salva respostas e mostra orientações baseadas em regras explícitas. Ainda não atribui notas nem substitui avaliação pedagógica.
- Exercícios avaliativos interativos, simulados, redação e tutor IA generativo ainda não estão implementados. As trilhas atuais são um ponto de partida editável; as sugestões do diagnóstico são regras transparentes, não respostas geradas por IA.
- SQLite é usado para desenvolvimento local. Antes de produção, configurar PostgreSQL e validar migrações, backups, segurança e privacidade.
- Os testes E2E automatizados cobrem cadastro/login, trilhas, persistência, recuperação de conta e edição de perfil; consulte a execução do GitHub Actions para o resultado do commit revisado. Não declarar aprovação sem conferir os logs.

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