# Arquitetura e requisitos — Trilha Educacional

## Finalidade

A Trilha é um MVP de aprendizagem personalizada. O fluxo principal começa com uma apresentação, segue para cadastro e diagnóstico, gera um plano de estudos e libera um painel com aulas, quizzes, simulados, progresso, conquistas e histórico.

## Arquitetura

O frontend usa React, Vite, TypeScript, Tailwind e componentes baseados em Radix/shadcn. A experiência principal está em `client/src/pages/Home.tsx`. O backend usa Node, Express e tRPC. O acesso ao banco é feito por Drizzle ORM e MySQL/TiDB. A autenticação da infraestrutura usa sessão OAuth do Manus.

## Domínio persistente

O schema possui usuários, perfis de estudantes, tentativas de diagnóstico, planos de estudo, itens do plano, progresso de aprendizagem, tentativas de quiz e conquistas. O usuário é a unidade de isolamento dos dados. A exclusão de conta remove os registros relacionados antes de remover a identidade principal.

## Fluxo funcional

1. A tela inicial apresenta a proposta e oferece cadastro, login ou demonstração.
2. O cadastro coleta nome, e-mail e senha no cliente e pede série e objetivo antes do diagnóstico.
3. O diagnóstico começa com uma pergunta-base por disciplina. Um acerto leva a uma pergunta avançada; um erro leva a uma pergunta de reforço.
4. O resultado calcula pontuação, desempenho por disciplina e tópicos fracos.
5. O backend cria um plano inicial de cinco dias priorizando a maior necessidade identificada.
6. O painel mostra o plano, progresso, atividades, histórico e recomendações.
7. Quizzes e simulados registram respostas, feedback, pontuação, tópicos fracos e medalhas.
8. O perfil permite edição e exclusão da conta.

## Comandos

- `pnpm dev`: inicia o servidor de desenvolvimento.
- `pnpm check`: executa a verificação TypeScript.
- `pnpm test`: executa os testes Vitest.
- `pnpm build`: cria o build de produção.
- `pnpm db:push`: gera e aplica migrações Drizzle conforme o ambiente configurado.

## Dependências e limitações

O projeto depende de Node.js, pnpm e das variáveis de ambiente fornecidas pela plataforma para banco, sessão e serviços Manus. O MVP ainda requer autenticação real alinhada ao formulário, mais testes de domínio, banco de questões escalável, persistência completa sem estados auxiliares locais, observabilidade e melhorias de acessibilidade antes de uso em larga escala.

## Segurança

Não publicar arquivos `.env`, tokens, senhas, chaves de API, chaves privadas, cookies, dumps de banco ou dados pessoais. A pasta pública é uma referência técnica e não concede autorização para acessar serviços ou dados privados.

## Versão

MVP da Trilha Educacional, organizado em 9 de setembro de 2026. O relatório de melhorias correspondente está em `relatorios/RELATORIO_MELHORIAS.md`.
