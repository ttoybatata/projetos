---
name: playwright-cli-estuda
description: Use o Microsoft Playwright CLI para explorar e validar os fluxos reais do Estuda/Trilha Educacional em um navegador, coletando evidências e sem inventar resultados.
---

# Skill de projeto: Playwright CLI para Estuda

## Antes de agir
- Leia `arquivos_publicos/documentos/INTEGRACAO_PLAYWRIGHT_CLI.md` e a documentação oficial do CLI.
- Identifique a pasta executável real da aplicação. Não trate `template.json` como se fosse a pasta de execução da aplicação.
- Confira `git status`, scripts disponíveis e a URL/ambiente de teste.
- Não use dados reais de estudantes nem credenciais de produção.

## Como explorar
1. Verifique `playwright-cli --help` e use a sintaxe suportada pela versão instalada.
2. Abra apenas ambiente local/staging e capture um snapshot antes de interagir.
3. Use as referências de elementos presentes no snapshot; capture evidências sem segredos.
4. Teste um cenário por vez. Registre resultado observado, URL/ambiente e evidência.
5. Após qualquer correção, repita o cenário que falhou e rode os scripts de check/test/build do projeto.
6. Diferencie teste exploratório via CLI de testes persistentes via `@playwright/test`.

## Cenários prioritários
- Cadastro/login/logout e distinção entre conta real e demonstração.
- Onboarding e diagnóstico adaptativo.
- Geração do plano, quizzes, atividades concluídas/pendentes e histórico.
- Persistência após recarregar e isolamento entre duas contas sintéticas.
- Estatísticas derivadas de atividade real, configurações e exclusão em ambiente isolado.
- Responsividade mobile/desktop, acessibilidade básica, erros de console e falhas de API.

## Regras invioláveis
- Não invente funcionalidades, dados, screenshots, resultados ou cobertura.
- Não altere arquivos sem entender seus usos e preservar mudanças existentes.
- Não modifique produção, banco real ou dados reais de estudantes.
- Não desative autenticação/autorizações para fazer testes passarem.
- Não faça correções amplas em lote. Uma falha confirmada por vez.
- Relate explicitamente o que passou, falhou, ficou bloqueado ou não foi executado.
- Se a ferramenta não estiver instalada ou o ambiente não puder executar o site, documente o bloqueio em vez de alegar sucesso.
