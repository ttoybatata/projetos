# Playwright CLI da Microsoft no Estuda

O CLI oficial é distribuído no pacote @playwright/cli e oferece exploração do navegador por comandos. @playwright/test é um runner separado para testes E2E repetíveis.

## Preparação
Com Node.js 22+:
- npm install
- npx playwright install chromium
- npx playwright-cli --help

O nome do pacote npm é @playwright/cli; o binário instalado chama-se playwright-cli. Consulte a ajuda da versão instalada e a documentação oficial: https://github.com/microsoft/playwright-cli.

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