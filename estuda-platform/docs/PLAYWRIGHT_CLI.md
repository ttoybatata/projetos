# Playwright CLI da Microsoft no Estuda

O Playwright CLI oficial (pacote playwright-cli) serve para exploração e controle do navegador por comandos. O pacote @playwright/test é o runner separado para testes E2E repetíveis.

## Preparação
Com Node.js 22+:
- npm install
- npx playwright install chromium
- npx playwright-cli --help

Consulte a sintaxe da versão instalada e a documentação oficial: https://github.com/microsoft/playwright-cli. Não presuma que exemplos antigos correspondem à versão instalada.

## Procedimento
1. Inicie a aplicação e confirme que a URL local responde.
2. Consulte a ajuda do CLI antes de usar comandos.
3. Explore cadastro, login, validações, mensagens de erro e viewport móvel.
4. Prefira seletores acessíveis por role/label em testes automatizados.
5. Converta regressões encontradas em testes E2E versionados.
6. Execute npm run test:e2e e registre comando, resultado e logs.
7. Se browser, API ou banco não puderem iniciar, registre o bloqueio; não declare sucesso.

Use dados sintéticos. Nunca exponha senhas, cookies, tokens ou códigos de recuperação em logs. A exploração CLI não substitui testes unitários, API, segurança ou E2E.

Estado: dependência e documentação declaradas; execução real precisa ocorrer num ambiente com dependências instaladas. Esta alteração não afirma que testes passaram.