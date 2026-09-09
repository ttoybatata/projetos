# Prompt mestre — Trilha Educacional

> Copie o texto abaixo e forneça-o a uma IA de desenvolvimento para orientar a continuidade, auditoria ou reconstrução da plataforma.

## Identidade da tarefa

Você é uma pessoa desenvolvedora sênior, arquiteta de software, especialista em produtos educacionais e engenheira de qualidade. Você deverá trabalhar no projeto **Trilha Educacional — aprendizagem que acompanha você**, uma plataforma de aprendizagem personalizada para estudantes.

O objetivo é evoluir o MVP existente até uma plataforma confiável, acessível, segura, pedagogicamente coerente e pronta para uso real. Não apenas descreva o que deveria ser feito. Inspecione o código existente, implemente as alterações, execute os testes, corrija os erros encontrados e entregue o projeto validado.

## Regras de operação

1. Antes de alterar qualquer arquivo, leia a estrutura atual do projeto, o README, o schema do banco, as procedures do backend, o componente principal da interface e os testes.
2. Preserve as funcionalidades já implementadas quando elas estiverem corretas.
3. Não invente dados pessoais, métricas de estudantes, resultados ou nomes de usuários.
4. Não use Elisa, Kayque ou qualquer identidade fictícia como dado padrão do produto.
5. Não libere aulas, quizzes, simulados, plano ou painel de aprendizagem antes da conclusão do diagnóstico inicial.
6. O diagnóstico deve ser uma etapa do cadastro/onboarding, e não uma tarefa posterior independente.
7. Diferencie visualmente o modo demonstração do ambiente autenticado. Dados da demonstração não podem parecer dados salvos na conta real.
8. Não armazene senhas em texto puro. Não publique tokens, chaves, cookies, arquivos `.env`, dumps de banco ou dados pessoais.
9. Use o banco como fonte principal para perfil, diagnóstico, plano, progresso, histórico e conquistas. Use `localStorage` somente para preferências de interface ou fallback explicitamente identificado como demonstração.
10. Após terminar a atualização de um projeto existente, sincronize o conteúdo atualizado com o repositório GitHub correspondente, substituindo a versão anterior do mesmo projeto. Para um projeto novo, adicione seus arquivos somente ao repositório definido para ele, sem modificar outros projetos.
11. No projeto atual, o repositório de referência é `ttoybatata/projetos`. Não apague nem substitua outros projetos que eventualmente existam nesse repositório.
12. Antes de publicar, verifique o diff, procure segredos, execute testes, cheque TypeScript e execute o build.

## Contexto atual do produto

A Trilha é um MVP de aprendizagem adaptativa. O fluxo principal é:

1. Tela de apresentação com explicação breve do produto.
2. Opções de cadastro, login e demonstração.
3. Cadastro de nome, e-mail, senha, série e objetivo de estudo.
4. Diagnóstico adaptativo integrado ao onboarding.
5. Cálculo de desempenho por disciplina e identificação de tópicos fracos.
6. Geração de plano de estudos personalizado.
7. Liberação do painel somente após diagnóstico concluído.
8. Aulas, atividades, quizzes e simulados adaptados ao perfil e ao histórico.
9. Feedback detalhado após cada resposta.
10. Progresso visual por tipo de atividade.
11. Medalhas desbloqueadas somente após conclusão de quizzes ou simulados.
12. Histórico de tentativas com filtros por disciplina e período.
13. Perfil com visualização e edição de nome, e-mail, série e objetivo.
14. Logout e retorno à tela de entrada.
15. Exclusão permanente da conta e dos dados relacionados.

O site publicado de referência é `https://trilhaedu-frusgrjy.manus.space`.

## Stack existente

- Frontend: React, TypeScript, Vite, Tailwind CSS, componentes Radix/shadcn e `lucide-react`.
- Backend: Node.js, Express e tRPC.
- Banco: MySQL/TiDB acessado por Drizzle ORM.
- Autenticação de infraestrutura: sessão OAuth do Manus.
- Testes: Vitest.
- Pacote: pnpm.
- Arquivo principal da experiência: `client/src/pages/Home.tsx`.
- Rotas tRPC: `server/routers.ts`.
- Helpers de persistência: `server/db.ts`.
- Modelo do banco: `drizzle/schema.ts`.
- Migrações: `drizzle/`.

Comandos obrigatórios:

```bash
pnpm check
pnpm test
pnpm build
```

Use `pnpm dev` para executar o ambiente de desenvolvimento. Use `pnpm db:push` somente quando a migração tiver sido revisada e o ambiente do banco estiver corretamente configurado.

## Funcionalidades que já existem

### Entrada e onboarding

A entrada apresenta a proposta da Trilha e oferece cadastro, login e demonstração. O onboarding coleta informações do estudante e inicia o diagnóstico. Há transições suaves entre as etapas.

Ajuste necessário: confirmar se o formulário de cadastro/login está realmente conectado a uma estratégia de autenticação persistente. A infraestrutura OAuth existe, mas um formulário visual com senha não deve fingir que criou uma sessão própria se isso não ocorreu. Escolha uma estratégia única:

- usar autenticação Manus com botão e texto claros; ou
- implementar autenticação própria completa no backend, com hash seguro, recuperação de senha, confirmação de e-mail, limitação de tentativas e sessão segura.

Não manter uma experiência ambígua.

### Diagnóstico adaptativo

O diagnóstico usa perguntas por Matemática, Linguagens e Ciências. A lógica pretendida é:

- resposta correta: selecionar uma pergunta de aprofundamento;
- resposta incorreta: selecionar uma pergunta de reforço;
- registrar respostas, disciplina, tópico, acerto, pontuação e total;
- calcular `subjectScores`;
- gerar `weakTopics`;
- concluir o diagnóstico somente após a sequência completa;
- persistir o resultado junto ao perfil autenticado.

O diagnóstico deve variar de acordo com série e objetivo. A fila de perguntas não deve repetir indevidamente perguntas já respondidas. A adaptação deve ocorrer imediatamente após cada resposta.

### Plano de estudos

O plano inicial deve ser gerado a partir dos resultados do diagnóstico. Deve priorizar a disciplina de menor desempenho e os tópicos fracos. O plano pode ser organizado por dias, disciplina, tópico, tipo de atividade, descrição e status.

Implementar também:

- conclusão individual de itens do plano;
- progresso do plano calculado no banco;
- possibilidade de atualizar ou regenerar o plano após novas evidências;
- explicação simples de por que cada atividade foi recomendada;
- estado vazio quando ainda não existir diagnóstico.

### Painel principal

O painel deve mostrar somente dados reais ou estados vazios honestos. Deve conter:

- saudação com o nome do perfil;
- série e objetivo atuais;
- progresso de aulas, atividades, quizzes e simulados;
- plano personalizado;
- próxima recomendação de estudo;
- histórico recente;
- tópicos que precisam de revisão;
- conquistas desbloqueadas;
- acesso ao perfil;
- logout.

Não mostrar números inventados como sequência, total de estudantes ou pontos globais se eles não vierem de fonte persistida e identificada.

### Atividades, quizzes e simulados

O produto já possui questões de Matemática, Linguagens e Ciências, com alternativas, resposta correta, explicação, tópico e nível. O executor deve:

- apresentar uma questão por vez;
- impedir avanço sem resposta;
- indicar progresso da atividade;
- informar imediatamente se a resposta está correta ou incorreta;
- exibir feedback detalhado, explicando a alternativa correta e o raciocínio;
- registrar tópicos errados;
- apresentar resumo final com pontuação, percentual, acertos, erros e recomendações;
- registrar a tentativa no banco;
- atualizar o progresso da atividade;
- liberar conquistas somente quando a tentativa de quiz ou simulado for concluída.

Adicionar pausa e retomada quando possível. Não considerar simplesmente abrir uma atividade como conclusão.

### Perfil

Criar ou manter uma página de perfil editável para nome, e-mail, série e objetivo de estudo. O formulário deve:

- carregar os dados persistidos;
- mostrar estado de carregamento;
- validar os campos;
- exibir sucesso ou erro;
- atualizar o cache tRPC;
- não sobrescrever campos com `undefined`;
- mostrar medalhas desbloqueadas;
- oferecer exclusão de conta com confirmação clara.

A exclusão deve ser uma ação irreversível. Deve remover perfil, diagnóstico, plano, itens do plano, progresso, tentativas e conquistas, limpar a sessão e impedir acesso posterior com a conta removida.

### Histórico

O histórico deve mostrar tentativas reais e permitir filtros por:

- disciplina;
- tipo de atividade;
- data inicial;
- data final;
- tópico, quando disponível.

O filtro deve ser aplicado de modo consistente no backend ou sobre um conjunto remoto completo claramente carregado. Exibir estado vazio e mensagem quando nenhum registro corresponder ao filtro.

## Modelo de dados desejado

O schema atual inclui tabelas equivalentes a:

- `users`: identidade, `openId`, nome, e-mail, função e datas.
- `student_profiles`: série, objetivo e flag de diagnóstico concluído.
- `diagnostic_attempts`: pontuação, total, desempenho por disciplina, tópicos fracos e respostas.
- `study_plans`: plano associado ao usuário, origem e status.
- `study_plan_items`: dia, disciplina, tópico, tipo e conclusão.
- `learning_progress`: progresso por usuário, disciplina e tipo de atividade.
- `quiz_attempts`: tipo, disciplina, pontuação, total, feedback, tópicos fracos e data.
- `achievements`: slug, título, descrição e usuário.

Melhorar o schema com:

1. chaves estrangeiras explícitas;
2. índices por `userId`, data, disciplina e tipo;
3. `ON DELETE CASCADE` quando adequado;
4. transações para exclusão e operações compostas;
5. timestamps em UTC;
6. restrições de unicidade para evitar medalhas duplicadas;
7. tabela de questões e habilidades, retirando o conteúdo pedagógico do componente React;
8. campos de versão, dificuldade, série, habilidade, fonte e revisão editorial;
9. tabelas ou campos para retomada de atividades;
10. status explícitos para itens do plano.

Nunca armazenar bytes de arquivos no banco. Para arquivos, persistir somente metadados e referência de armazenamento.

## Backend e API

Manter o padrão tRPC. Usar procedures públicas apenas para operações realmente públicas e procedures protegidas para dados do estudante.

Procedures esperadas:

- `auth.me`;
- `auth.logout`;
- `student.state`;
- `student.saveProfile`;
- `student.completeDiagnostic`;
- `student.recordActivity`;
- `student.updatePlanItem`;
- `student.history` com filtros;
- `student.deleteAccount`.

Cada procedure protegida deve:

- usar o usuário autenticado do contexto;
- filtrar por `ctx.user.id`;
- validar entradas com Zod;
- evitar vazamento de dados entre usuários;
- retornar erros tratáveis;
- invalidar queries relacionadas após mutations;
- não registrar senha, token ou informação sensível nos logs.

Testar explicitamente isolamento entre dois usuários. Um usuário jamais pode ler, alterar ou remover dados de outro.

## Banco de questões e personalização

Criar um banco editorial de questões com pelo menos:

- disciplina;
- série;
- habilidade;
- tópico;
- dificuldade;
- enunciado;
- alternativas;
- índice da resposta correta;
- explicação;
- fonte ou referência;
- versão;
- ativo/inativo;
- data da última revisão.

A seleção de conteúdo deve considerar:

1. série cadastrada;
2. objetivo declarado;
3. desempenho do diagnóstico;
4. tópicos fracos recorrentes;
5. histórico recente;
6. nível de dificuldade adequado;
7. variedade para evitar repetição;
8. revisão espaçada de erros anteriores.

Criar uma estratégia determinística e testável. Não afirmar que uma recomendação é baseada em IA se ela for somente uma regra fixa.

## Design e experiência visual

Preservar a identidade visual atual: plataforma educacional acolhedora, clara, moderna e responsiva. Usar hierarquia visual forte, cartões leves, cores de destaque para progresso, tipografia legível, ícones consistentes e animações curtas.

Requisitos:

- layout mobile-first;
- boa leitura em 320 px, 375 px, 768 px e desktop;
- transições suaves entre entrada, cadastro, diagnóstico e painel;
- animações com menos de 300 ms quando possível;
- não animar propriedades que causem reflow sem necessidade;
- respeitar `prefers-reduced-motion`;
- foco visível para teclado;
- botões com estados hover, active, loading e disabled;
- feedback de erro e sucesso próximo da ação;
- evitar tela vazia sem orientação;
- usar estados skeleton ou carregamento por componente;
- evitar métricas demonstrativas que pareçam reais.

## Acessibilidade

Aplicar no mínimo:

- HTML semântico;
- labels associados aos campos;
- `aria-describedby` para erros;
- `aria-live` para mudança de etapa e feedback de resposta;
- foco inicial adequado em modais e etapas;
- navegação completa por teclado;
- contraste compatível com WCAG;
- texto acessível para barras de progresso;
- suporte a leitores de tela;
- testes com axe ou ferramenta equivalente.

## Segurança e privacidade

Implementar ou revisar:

- autenticação consistente;
- cookies seguros, `httpOnly`, `sameSite` e `secure` conforme ambiente;
- proteção contra acesso entre usuários;
- validação de tamanho e formato de entrada;
- rate limiting em login e operações sensíveis;
- transações para exclusão;
- não exposição de stack trace ao usuário;
- logs sem dados sensíveis;
- política de retenção e exclusão;
- confirmação antes da exclusão permanente;
- documentação sobre dados coletados.

## Testes obrigatórios

A suíte mínima deve cobrir:

1. logout limpa o cookie;
2. usuário não autenticado não acessa procedures protegidas;
3. perfil é criado e atualizado sem apagar campos existentes;
4. diagnóstico correto gera aprofundamento;
5. diagnóstico incorreto gera reforço;
6. diagnóstico persiste respostas e tópicos fracos;
7. plano prioriza a menor pontuação;
8. itens do plano podem ser marcados como concluídos;
9. quiz fornece feedback por questão;
10. tentativa concluída registra pontuação e tópicos fracos;
11. medalha é liberada somente uma vez;
12. histórico filtra por disciplina e data;
13. usuário A não acessa dados do usuário B;
14. exclusão remove dependências em transação;
15. exclusão limpa a sessão;
16. build e TypeScript passam sem erros.

Adicionar testes de interface para o fluxo cadastro → diagnóstico → plano → painel, incluindo bloqueio pré-diagnóstico e logout.

## Desempenho

O build atual informa que o principal chunk JavaScript ultrapassa 500 kB minificado. Melhorar isso com:

- carregamento sob demanda de páginas e componentes pesados;
- divisão de chunks por domínio;
- remoção de dependências não usadas;
- compressão e otimização de assets;
- evitar carregar conteúdo de todas as disciplinas antes da necessidade;
- medição de carregamento inicial e interação.

Não mascarar o problema apenas aumentando o limite de alerta do Vite sem avaliar o impacto real.

## Observabilidade

Adicionar métricas e logs estruturados para:

- cadastro iniciado e concluído;
- diagnóstico iniciado, concluído e abandonado;
- plano gerado;
- atividade iniciada, concluída e abandonada;
- erro de API;
- sessão expirada;
- falha de banco;
- exclusão de conta;
- tempo de carregamento.

Nunca registrar senhas, tokens, cookies ou respostas pessoais além do necessário para depuração autorizada.

## Documentação necessária

Manter atualizados:

- README de execução;
- arquitetura do sistema;
- modelo do banco;
- contratos tRPC;
- estratégia de autenticação;
- procedimento de migração;
- procedimento de backup e rollback;
- política de conteúdo pedagógico;
- relatório de melhorias;
- changelog da versão.

## Organização do GitHub

No repositório público `https://github.com/ttoybatata/projetos`, manter:

```text
arquivos_publicos/
├── README.md
├── programas/
│   └── trilha-educacional/
├── relatorios/
└── documentos/
```

O código principal para referência está em `arquivos_publicos/programas/trilha-educacional/`. O relatório está em `arquivos_publicos/relatorios/RELATORIO_MELHORIAS.md`. A documentação está em `arquivos_publicos/documentos/ARQUITETURA_E_REQUISITOS.md`.

Ao atualizar o projeto:

1. trabalhar no projeto real;
2. executar testes e build;
3. atualizar a cópia correspondente em `arquivos_publicos/programas/trilha-educacional/`;
4. atualizar relatórios e documentação quando necessário;
5. procurar segredos e dados pessoais;
6. revisar `git diff`;
7. fazer commit claro;
8. enviar para o branch principal;
9. verificar os arquivos no GitHub;
10. informar commit, links e eventuais limitações.

Não substituir ou apagar outros projetos dentro do repositório `projetos`.

## Critérios de aceite finais

Considere a tarefa concluída somente quando:

- o fluxo inicial estiver claro;
- cadastro/login estiverem ligados a uma estratégia de autenticação real ou claramente rotulados como demonstração;
- o diagnóstico estiver dentro do onboarding;
- nada de aprendizagem estiver liberado antes do diagnóstico;
- o plano for gerado e persistido com base no diagnóstico;
- aulas, quizzes e simulados variarem por perfil e histórico;
- cada resposta tiver feedback detalhado;
- o progresso for persistido e visualmente atualizado;
- medalhas dependerem de conclusão real de quiz/simulado;
- perfil, histórico, filtros, logout e exclusão funcionarem;
- dados de um usuário estiverem isolados dos demais;
- acessibilidade básica estiver validada;
- testes, TypeScript e build passarem;
- não existirem segredos no commit;
- o repositório GitHub estiver atualizado;
- a documentação refletir a versão entregue.

Ao finalizar, produza um relatório objetivo contendo: arquivos modificados, migrações aplicadas, endpoints criados ou alterados, testes executados, resultado do build, limitações restantes, commit do GitHub e links do site e do repositório.
