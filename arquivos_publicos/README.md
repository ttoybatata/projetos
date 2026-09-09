# Arquivos públicos — Trilha Educacional

## Objetivo

A pasta `arquivos_publicos/` reúne uma seleção organizada de código-fonte, relatórios e documentação do projeto Trilha Educacional. O material foi preparado para consulta por pessoas, ferramentas externas e outras Inteligências Artificiais.

## Estrutura

- `programas/trilha-educacional/`: código-fonte e configurações do site, frontend React, backend tRPC, schema Drizzle, migrações e testes.
- `relatorios/`: auditorias, análises, resultados de validação e recomendações de evolução.
- `documentos/`: documentação de arquitetura, objetivos, funcionamento, requisitos, limitações e prompt de continuidade.
- `README.md`: este guia de navegação e relacionamento entre os arquivos.

## Relação entre programa, relatório e prompt

O programa principal é `programas/trilha-educacional/`. O relatório correspondente é `relatorios/RELATORIO_MELHORIAS.md`, que descreve o estado do MVP, as lacunas técnicas, as prioridades e o roadmap recomendado. A documentação complementar está em `documentos/ARQUITETURA_E_REQUISITOS.md`. O prompt de continuidade está em `documentos/PROMPT_MESTRE_TRILHA_EDUCACIONAL.md`.

## Como uma IA deve utilizar os arquivos

Uma IA deve começar por este README, depois ler `documentos/ARQUITETURA_E_REQUISITOS.md`, consultar `relatorios/RELATORIO_MELHORIAS.md` e seguir o `documentos/PROMPT_MESTRE_TRILHA_EDUCACIONAL.md`. Para entender uma implementação específica, deve navegar para o arquivo correspondente em `programas/trilha-educacional/`. O `package.json` contém os comandos de desenvolvimento, testes e build. O `drizzle/schema.ts` e as migrações descrevem o modelo persistente. O arquivo `client/src/pages/Home.tsx` concentra a experiência principal do estudante.

As informações desta pasta são referências técnicas e não devem ser interpretadas como autorização para acessar credenciais, bancos de dados, contas de usuários ou serviços externos. Nunca procurar ou inferir segredos. Arquivos `.env`, tokens, senhas, chaves privadas e dados pessoais não fazem parte desta publicação.

## Versão atual

A versão de referência é o MVP da Trilha Educacional publicado no domínio `trilhaedu-frusgrjy.manus.space`. O commit de referência no repositório é mantido no histórico Git da raiz do projeto. A data desta organização é 9 de setembro de 2026.

## Arquivos principais

- `programas/trilha-educacional/client/src/pages/Home.tsx`: entrada, cadastro, diagnóstico, painel, plano, perfil, quizzes e histórico.
- `programas/trilha-educacional/server/routers.ts`: procedures tRPC e operações protegidas.
- `programas/trilha-educacional/server/db.ts`: helpers de persistência e geração do plano.
- `programas/trilha-educacional/drizzle/schema.ts`: tabelas e tipos do banco.
- `programas/trilha-educacional/README.md`: instruções de execução do projeto.
- `relatorios/RELATORIO_MELHORIAS.md`: auditoria e plano de evolução.
- `documentos/ARQUITETURA_E_REQUISITOS.md`: visão técnica e funcional consolidada.
- `documentos/PROMPT_MESTRE_TRILHA_EDUCACIONAL.md`: instruções detalhadas para outra IA continuar o desenvolvimento.

## Acesso

O repositório `ttoybatata/projetos` é público. Portanto, esta pasta pode ser acessada por ferramentas externas e outras Inteligências Artificiais sem autenticação, desde que o caminho e o branch permaneçam disponíveis.

## Última atualização

9 de setembro de 2026.
