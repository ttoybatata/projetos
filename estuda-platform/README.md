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
- A interface e o endpoint do tutor IA estão implementados para provedores compatíveis com a API de chat, mas o tutor só responde quando `AI_API_URL`, `AI_API_KEY` e `AI_MODEL` são configurados como segredos/variáveis no ambiente do servidor. Sem isso, a aplicação informa que o serviço não está configurado; ela não simula respostas de IA.
- Há quizzes objetivos com correção no servidor para sete atividades iniciais de Matemática (uma por série, do 6º EF ao 3º EM), com três questões por quiz, explicações e pontuação persistida. Os demais tópicos ainda oferecem conclusão guiada sem nota automática. Simulados completos e redação continuam pendentes.
- As trilhas são um ponto de partida editável, não um currículo oficial homologado; as sugestões do diagnóstico são regras transparentes, não respostas geradas por IA.
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