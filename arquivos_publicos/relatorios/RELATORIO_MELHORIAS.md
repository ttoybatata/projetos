# Relatório de melhorias — Trilha Educacional

**Projeto:** Trilha — aprendizagem que acompanha você  
**Data da auditoria:** 9 de setembro de 2026  
**Autor:** Manus AI

## 1. Resumo executivo

A plataforma já possui uma base funcional de experiência educacional: entrada com cadastro, diagnóstico adaptativo, plano de estudos personalizado, painel de progresso, quizzes com feedback, conquistas, histórico filtrável, perfil editável, logout, exclusão de conta e persistência relacional para usuários autenticados. O build de produção e os testes existentes foram executados com sucesso.

As principais lacunas estão concentradas em **autenticação real do formulário**, **cobertura de testes**, **separação entre demonstração e dados persistidos**, **ampliação do conteúdo pedagógico**, **observabilidade**, **acessibilidade** e **otimização do bundle frontend**. Essas melhorias não impedem a execução do MVP, mas devem orientar a próxima fase antes de uma divulgação ampla.

## 2. Estado atual verificado

| Área | Situação atual | Avaliação |
|---|---|---|
| Tela inicial | Apresenta a proposta e oferece cadastro, login e demonstração. | Concluída |
| Cadastro | Captura nome, e-mail e senha; encaminha para série, objetivo e diagnóstico. | Parcialmente concluída |
| Diagnóstico | Perguntas adaptativas por Matemática, Linguagens e Ciências; acertos aprofundam e erros reforçam. | Concluída no MVP |
| Plano de estudos | Geração de plano de cinco dias baseada no pior desempenho e tópicos fracos. | Concluída no MVP |
| Painel | Exibe progresso, atividades, plano, histórico e recomendações. | Concluída no MVP |
| Quizzes | Questões com feedback explicativo, simulados e registro de tópicos fracos. | Concluída no MVP |
| Conquistas | Medalhas liberadas após tentativas de quiz. | Concluída no MVP |
| Perfil | Permite visualizar e editar nome, série e objetivo. | Concluída |
| Logout | Encerra a sessão e retorna à entrada. | Concluída |
| Exclusão de conta | Remove dados relacionados e encerra o cookie de sessão. | Concluída, requer testes adicionais |
| Banco de dados | Schema Drizzle com usuários, perfil, diagnóstico, plano, progresso, tentativas e conquistas. | Concluída no MVP |
| Testes automatizados | Existe teste para logout; não há suíte para diagnóstico, plano, progresso ou exclusão. | Insuficiente |
| Publicação | Site publicado no domínio `trilhaedu-frusgrjy.manus.space` e código sincronizado no GitHub. | Concluída |

## 3. Itens prioritários que faltam

### 3.1 Autenticação real do cadastro e do login

O formulário de entrada valida os campos no cliente e encaminha o estudante para o fluxo da aplicação. A infraestrutura do projeto possui OAuth do Manus, mas o formulário visível não implementa uma autenticação própria baseada em senha. Isso cria uma diferença entre a expectativa de “criar conta/entrar” e a sessão efetivamente persistida pelo provedor de autenticação.

**Recomendação:** definir uma única estratégia oficial. A opção mais simples é substituir o formulário por um botão de autenticação Manus claramente rotulado. A opção mais completa é implementar cadastro e login próprios no backend, com hash seguro de senha, recuperação de acesso, confirmação de e-mail, limitação de tentativas e auditoria de sessão.

**Prioridade:** alta.

### 3.2 Cobertura de testes do domínio educacional

A suíte atual cobre somente o logout. Não existem testes automatizados para concluir diagnóstico, gerar plano, registrar atividade, desbloquear medalhas, filtrar histórico ou excluir conta.

**Recomendação:** criar testes unitários e de integração para os seguintes cenários:

1. diagnóstico com acerto gera pergunta de aprofundamento;
2. diagnóstico com erro gera pergunta de reforço;
3. resultado identifica tópicos fracos por disciplina;
4. plano de estudos prioriza a disciplina de menor desempenho;
5. conclusão de quiz registra progresso e libera a medalha correta;
6. filtros de histórico respeitam disciplina e período;
7. exclusão remove todos os registros relacionados e invalida a sessão;
8. chamadas protegidas rejeitam usuários sem autenticação.

**Prioridade:** alta.

### 3.3 Separação explícita entre demonstração e ambiente real

O modo de demonstração usa estados locais para permitir exploração sem autenticação. O ambiente autenticado usa o banco. Essa coexistência é adequada para um MVP, mas precisa ser comunicada na interface para evitar a impressão de que uma atividade demonstrativa foi salva na conta real.

**Recomendação:** adicionar um selo “Modo demonstração”, explicar que os dados não serão persistidos e bloquear qualquer expectativa de sincronização. No ambiente autenticado, mostrar estados de carregamento, sucesso e erro das mutations.

**Prioridade:** alta.

### 3.4 Conteúdo pedagógico escalável

O banco de questões atual é pequeno e concentrado em três áreas. Para uma experiência realmente personalizada, serão necessários mais temas, séries, níveis de dificuldade, habilidades e versões de questões.

**Recomendação:** mover questões para tabelas de conteúdo no banco, com campos para disciplina, série, habilidade, dificuldade, enunciado, alternativas, resposta, explicação e fonte pedagógica. Criar um painel administrativo ou processo de importação para atualizar o conteúdo sem editar o componente React.

**Prioridade:** alta.

### 3.5 Persistência completa do plano e progresso

O backend persiste o estado principal, mas o frontend ainda mantém alguns estados auxiliares em `localStorage`, como perfil e progresso da sessão. Isso pode produzir divergência entre dispositivos, navegadores ou sessões diferentes.

**Recomendação:** usar o banco como fonte única para perfil, progresso, conquistas, histórico e plano. Manter `localStorage` apenas para preferências de interface, como tema ou largura da navegação. Invalidar as queries tRPC após cada mutation para atualizar os dados sem recarregar a página.

**Prioridade:** alta.

## 4. Melhorias de experiência e produto

| Melhoria | Benefício | Prioridade |
|---|---|---|
| Mostrar uma tela de resultado do diagnóstico com explicação por disciplina | Aumenta a compreensão do plano gerado. | Alta |
| Permitir marcar cada item do plano como concluído | Torna o plano acionável e melhora o progresso real. | Alta |
| Permitir pausar e retomar quizzes | Evita perda de progresso em sessões longas. | Média |
| Adicionar revisão espaçada baseada nos erros | Melhora a retenção de conteúdo. | Alta |
| Criar recomendações para o próximo estudo | Reduz indecisão no painel. | Média |
| Adicionar busca por tema no histórico | Facilita a revisão de dificuldades específicas. | Média |
| Criar notificações de lembrete do plano semanal | Aumenta a recorrência de uso. | Média |
| Incluir exportação do plano e histórico em PDF | Ajuda estudantes, responsáveis e professores. | Baixa |
| Criar área de responsáveis ou professores | Permite acompanhamento supervisionado. | Média |
| Adicionar suporte a mais disciplinas | Amplia a utilidade do produto. | Alta |

## 5. Melhorias técnicas e de segurança

### 5.1 Exclusão de conta e integridade referencial

A exclusão percorre manualmente as tabelas dependentes antes de remover o usuário. A implementação funciona no fluxo atual, mas é mais segura quando as relações possuem `ON DELETE CASCADE` e a operação é executada em transação.

**Próxima ação:** revisar todas as relações Drizzle, adicionar chaves estrangeiras explícitas, configurar cascata onde for apropriado e executar a exclusão dentro de uma transação com tratamento de falha.

### 5.2 Validação de autorização e propriedade dos registros

As procedures estão protegidas por autenticação, mas devem ser acompanhadas por testes que comprovem que um usuário nunca consegue ler, alterar ou apagar registros pertencentes a outro usuário.

**Próxima ação:** adicionar testes de isolamento entre usuários e revisar todos os helpers de banco para exigir `userId` nas consultas.

### 5.3 Tratamento de erros

A interface precisa comunicar falhas de rede, falhas de banco, sessão expirada e indisponibilidade de serviço. O usuário deve receber uma ação clara, como tentar novamente, voltar ao painel ou entrar novamente.

**Próxima ação:** padronizar mensagens de erro, adicionar estados de mutation e registrar identificadores de correlação no servidor sem expor dados sensíveis.

### 5.4 Observabilidade

Existem logs de servidor, mas ainda não há uma estratégia documentada de métricas de produto, erros e desempenho.

**Próxima ação:** acompanhar conclusão do diagnóstico, conclusão de atividades, abandono de quiz, erros de API, tempo de carregamento e falhas de autenticação. Não registrar senha, token ou conteúdo pessoal desnecessário.

### 5.5 Bundle frontend

O build informa que o principal chunk JavaScript excede 500 kB após minificação. Isso não bloqueia a publicação, mas pode aumentar o tempo de carregamento inicial em dispositivos móveis.

**Próxima ação:** separar páginas e componentes por carregamento sob demanda, remover dependências não utilizadas e configurar `manualChunks` no Vite quando houver divisão clara por domínio.

### 5.6 Configuração e documentação de ambiente

As variáveis de ambiente são fornecidas pela plataforma, mas o projeto ainda se beneficiaria de uma documentação operacional mais explícita.

**Próxima ação:** documentar variáveis obrigatórias, migrações, comandos de teste, processo de publicação, estratégia de backup e procedimento de rollback, sem versionar arquivos `.env`.

## 6. Acessibilidade e qualidade visual

A interface possui boa hierarquia visual, contraste forte e layout responsivo. A próxima etapa deve validar a experiência com teclado, leitor de tela e viewport móvel real.

**Recomendações:**

- garantir foco visível em todos os controles;
- associar mensagens de erro aos campos com `aria-describedby`;
- anunciar mudanças de etapa do diagnóstico com região `aria-live`;
- garantir que os indicadores de progresso tenham texto acessível;
- revisar contraste de textos secundários e estados desabilitados;
- testar navegação em 320 px, 375 px, 768 px e desktop;
- respeitar `prefers-reduced-motion` em transições e animações;
- adicionar testes automatizados com axe ou ferramenta equivalente.

## 7. Conteúdo e governança pedagógica

O produto precisa de um processo para revisar questões e explicações. Conteúdo educacional deve ter responsável, versão, habilidade associada e data de revisão.

**Recomendação:** criar uma tabela de banco para questões e uma rotina editorial com revisão por disciplina. Registrar a origem de materiais externos e evitar copiar conteúdo protegido sem licença. Também é importante revisar linguagem, nível de dificuldade, viés e adequação à faixa etária.

## 8. Roadmap recomendado

| Fase | Entregas | Critério de conclusão |
|---|---|---|
| Fase 1 — Confiabilidade | Testes de domínio, transações de exclusão, tratamento de erros e fonte única no banco. | Fluxos críticos cobertos e sem perda de dados em testes. |
| Fase 2 — Conteúdo | Banco de questões, habilidades, séries, dificuldades e painel de gestão. | Conteúdo pode ser atualizado sem editar o frontend. |
| Fase 3 — Aprendizagem | Revisão espaçada, plano marcável, recomendações e retomada de atividades. | O estudante recebe um próximo passo claro baseado no histórico. |
| Fase 4 — Escala | Code splitting, métricas, notificações e otimização mobile. | Desempenho e observabilidade adequados para uso público. |
| Fase 5 — Expansão | Área de responsáveis/professores, relatórios e exportações. | Acompanhamento externo com permissões e privacidade definidas. |

## 9. Conclusão

O MVP está pronto para demonstração e validação inicial. Ele ainda não deve ser considerado uma plataforma educacional de produção em larga escala sem resolver autenticação real, testes de domínio, conteúdo escalável, fonte única de persistência e controles de segurança. A prioridade recomendada é transformar os fluxos atuais em operações verificáveis e persistentes, depois expandir conteúdo e recursos pedagógicos.

## Referências

[1]: https://github.com/ttoybatata/Programas "Repositório GitHub do projeto Trilha"
[2]: https://trilhaedu-frusgrjy.manus.space "Site publicado da Trilha Educacional"
