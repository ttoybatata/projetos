# Integração do Microsoft Playwright CLI — Estuda / Trilha Educacional

Issue relacionada: #1

## Objetivo

Usar o Microsoft Playwright CLI para permitir que um agente de programação explore a aplicação real em navegador, inspecione a interface e recolha evidências reproduzíveis. O CLI não substitui a suíte de testes automatizados do projeto e não deve ser tratado como prova de que um fluxo passou sem executar o fluxo.

Documentação oficial:
- https://github.com/microsoft/playwright-cli
- https://playwright.dev/agent-cli/introduction

## Estado e limites

Este repositório publica uma cópia organizada do projeto em `arquivos_publicos/`. O caminho `arquivos_publicos/programas/trilha-educacional/template.json` contém parte do aplicativo serializada em um template. Esta documentação, por si só, não instala o CLI na máquina de desenvolvimento, não altera a aplicação publicada e não comprova testes executados. Para a integração executável, trabalhe no repositório/pasta de código-fonte usado para construir e publicar o site.

## Pré-requisitos

- Node.js compatível com a versão indicada na documentação oficial.
- Um ambiente de desenvolvimento que permita instalar pacotes e iniciar a aplicação.
- A URL local/staging do Estuda/Trilha e dados de teste sintéticos.
- Não usar contas reais de estudantes, credenciais reais ou dados pessoais em testes.

## Instalação do CLI

Siga a documentação oficial mais recente. O fluxo documentado pelo projeto oficial é:

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
playwright-cli install --skills
```

Se o ambiente não permitir instalação global, consulte as opções locais documentadas oficialmente. Não assuma que instalar `@playwright/cli` equivale a instalar `@playwright/test`: são ferramentas com propósitos distintos.

## Fluxo de trabalho recomendado

1. Leia o README, package.json, scripts, rotas, schema do banco, autenticação e testes existentes.
2. Registre o estado inicial do Git e não sobrescreva alterações do usuário.
3. Inicie a aplicação usando os comandos já existentes no projeto; não invente comandos nem use dados de produção.
4. Abra a URL local/staging com `playwright-cli open <URL>`.
5. Capture `playwright-cli snapshot` antes de interagir; use as referências dos elementos mostradas no snapshot.
6. Explore um fluxo de cada vez e guarde screenshots/snapshots de falhas e sucessos em uma pasta de evidências que não contenha segredos.
7. Inspecione console e requisições quando necessário e quando suportado pela versão instalada.
8. Corrija somente falhas confirmadas, com mudanças pequenas e rastreáveis.
9. Repita os mesmos cenários depois da correção e compare as evidências.
10. Execute também os scripts de check, teste e build já existentes no projeto. Não substitua a suíte existente por sessões exploratórias do CLI.

## Matriz inicial de validação do Estuda

- Entrada: apresentação, cadastro, login, logout e modo demonstração claramente identificado.
- Onboarding: série/ano, objetivo e diagnóstico antes de liberar o painel quando esse for o fluxo definido pelo produto.
- Diagnóstico adaptativo: resposta correta/incorreta, feedback e avanço coerente.
- Plano de estudos: gerado com base em respostas realmente registradas.
- Atividades/quizzes: iniciar, responder, concluir e encontrar no histórico.
- Persistência: atualizar/reabrir a sessão e verificar dados salvos na conta de teste.
- Isolamento: uma conta de teste não deve acessar o perfil, diagnóstico, progresso ou histórico de outra.
- Estatísticas: não exibir atividade fictícia como se fosse atividade real.
- Configurações: editar dados permitidos, encerrar sessão e testar exclusão apenas em ambiente isolado.
- Interface: larguras móveis e desktop, navegação por teclado, foco visível, rótulos e mensagens de erro.
- Dependências: comportamento compreensível quando API, banco ou provedor de IA estiver indisponível.

## Segurança

- Use somente ambiente local/staging e contas sintéticas.
- Nunca grave senhas, tokens, cookies, chaves, dados pessoais ou conteúdo sensível nas evidências.
- Não execute testes destrutivos contra produção.
- Não desative autenticação ou controles de autorização para fazer um teste passar.
- Não alegue isolamento de dados apenas com base no frontend; valide a autorização no backend e, quando possível, teste com duas contas separadas.

## Critério de conclusão

Relate cada cenário como:
- **Passou** — executado, resultado observado e evidência guardada.
- **Falhou** — executado, falha observada e evidência guardada.
- **Bloqueado** — não pôde ser executado, com motivo.
- **Não executado** — ainda não testado.

Inclua ambiente/URL sem segredos, versão do CLI, comandos utilizados, arquivos alterados, screenshots/snapshots e resultado de check/test/build. Nunca declare que os testes passaram se não foram executados.

## Pull request

Cada alteração funcional deve ter Issue correspondente e o PR deve referenciá-la. Antes de publicar, revise o diff, procure segredos e execute os checks disponíveis. Não faça deploy automaticamente.
