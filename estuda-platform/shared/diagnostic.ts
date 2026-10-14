export type DiagnosticOption = { value: string; label: string };
export type DiagnosticQuestion = { key: string; label: string; options: DiagnosticOption[] };

const confidenceOptions: DiagnosticOption[] = [
  { value: "preciso_de_explicacao", label: "Preciso que expliquem passo a passo" },
  { value: "aprendo_com_exemplos", label: "Aprendo melhor com exemplos" },
  { value: "consigo_praticar", label: "Aprendo praticando exercícios" }
];

export function getDiagnosticQuestions(schoolYear: string, readingFluency: string, learningGoals: string[] = []): DiagnosticQuestion[] {
  const isEarlyFundamental = schoolYear === "6EF" || schoolYear === "7EF";
  const isLateFundamental = schoolYear === "8EF" || schoolYear === "9EF";

  const readingOptions = readingFluency === "preciso_praticar"
    ? [
        { value: "leio_com_ajuda", label: "Entendo melhor quando alguém me ajuda a ler" },
        { value: "perco_detalhes", label: "Leio, mas às vezes perco informações importantes" },
        { value: "compreendo_textos_curtos", label: "Compreendo textos curtos e quero ganhar confiança" }
      ]
    : readingFluency === "fluente"
      ? [
          { value: "interpreto_inferencias", label: "Consigo interpretar informações que não estão explícitas" },
          { value: "analiso_argumentos", label: "Quero aprofundar a análise de ideias e argumentos" },
          { value: "dificuldade_textos_longos", label: "Textos longos ainda exigem bastante esforço" }
        ]
      : [
          { value: "identifico_ideia_principal", label: "Geralmente identifico a ideia principal" },
          { value: "dificuldade_inferir", label: "Tenho dificuldade para entender informações implícitas" },
          { value: "compreendo_com_apoio", label: "Com exemplos e perguntas-guia, compreendo melhor" }
        ];

  const mathOptions = isEarlyFundamental
    ? [
        { value: "calculos_basicos", label: "Cálculos básicos e operações" },
        { value: "fracoes", label: "Frações e números decimais" },
        { value: "problemas_texto", label: "Transformar problemas escritos em contas" }
      ]
    : isLateFundamental
      ? [
          { value: "porcentagem", label: "Porcentagem e proporções" },
          { value: "equacoes", label: "Equações e expressões algébricas" },
          { value: "problemas_texto", label: "Transformar problemas escritos em contas" }
        ]
      : [
          { value: "funcoes", label: "Funções e interpretação de gráficos" },
          { value: "equacoes", label: "Equações e manipulação algébrica" },
          { value: "modelar_problemas", label: "Montar um modelo matemático a partir de um problema" }
        ];

  const goalQuestions: DiagnosticQuestion[] = [];
  if (learningGoals.includes("provas_enem")) {
    goalQuestions.push({
      key: "examStrategy",
      label: "Ao se preparar para provas, qual estratégia mais combina com você?",
      options: [
        { value: "reviso_teoria", label: "Reviso a teoria e faço anotações" },
        { value: "resolvo_questoes", label: "Pratico questões e analiso os erros" },
        { value: "preciso_plano_revisao", label: "Preciso de ajuda para organizar uma revisão" }
      ]
    });
  }
  if (learningGoals.includes("recuperar_conteudo")) {
    goalQuestions.push({
      key: "recovery",
      label: "Quando precisa recuperar um conteúdo que perdeu, o que ajuda mais?",
      options: [
        { value: "volto_aula", label: "Rever uma explicação desde o começo" },
        { value: "procuro_resumo", label: "Ler um resumo e praticar exercícios" },
        { value: "nao_sei_por_onde_comecar", label: "Preciso de ajuda para descobrir por onde começar" }
      ]
    });
  }
  if (learningGoals.includes("melhorar_estudos")) {
    goalQuestions.push({
      key: "routine",
      label: "Como costuma organizar seu tempo de estudo?",
      options: [
        { value: "tenho_horario", label: "Tenho horários definidos" },
        { value: "estudo_quando_da", label: "Estudo quando sobra tempo" },
        { value: "preciso_rotina", label: "Quero ajuda para criar uma rotina" }
      ]
    });
  }
  if (learningGoals.includes("aprender")) {
    goalQuestions.push({
      key: "curiosity",
      label: "Qual formato mais desperta sua curiosidade para aprender algo novo?",
      options: [
        { value: "explicacao_curta", label: "Uma explicação curta e direta" },
        { value: "exemplo_pratico", label: "Um exemplo prático do dia a dia" },
        { value: "desafio_interativo", label: "Um desafio para tentar resolver" }
      ]
    });
  }

  return [
    { key: "confidence", label: "Como você se sente ao estudar um assunto novo?", options: confidenceOptions },
    { key: "reading", label: readingFluency === "fluente" ? "Em leituras mais complexas, o que melhor descreve você?" : "Ao ler um texto, qual situação combina mais com você?", options: readingOptions },
    { key: "math", label: isEarlyFundamental ? "Em matemática, qual tema você quer praticar primeiro?" : isLateFundamental ? "Em matemática, qual tema costuma exigir mais esforço?" : "Em matemática, qual tema você quer fortalecer para o Ensino Médio/ENEM?", options: mathOptions },
    {
      key: "study",
      label: "Quando uma atividade fica difícil, o que você costuma fazer?",
      options: [
        { value: "tento_de_novo", label: "Tento de novo e reviso onde errei" },
        { value: "procuro_exemplo", label: "Procuro um exemplo resolvido" },
        { value: "preciso_de_pausa", label: "Preciso de uma pausa ou de ajuda para continuar" }
      ]
    },
    ...goalQuestions
  ];
}

export function getDiagnosticRecommendations(answers: Record<string, string>): string[] {
  const recommendations: string[] = [];
  if (answers.confidence === "preciso_de_explicacao") recommendations.push("Prefira explicações divididas em etapas curtas e confira cada etapa com um exemplo.");
  if (answers.confidence === "aprendo_com_exemplos") recommendations.push("Comece por um exemplo resolvido e depois tente uma questão parecida sem consultar a solução.");
  if (answers.confidence === "consigo_praticar") recommendations.push("Use blocos curtos de exercícios e revise os erros antes de avançar para o próximo tópico.");

  if (["leio_com_ajuda", "perco_detalhes", "dificuldade_inferir", "dificuldade_textos_longos"].includes(answers.reading)) {
    recommendations.push("Na leitura, destaque a ideia principal, anote palavras-chave e responda uma pergunta de compreensão por parágrafo.");
  } else if (["interpreto_inferencias", "analiso_argumentos"].includes(answers.reading)) {
    recommendations.push("Para aprofundar a leitura, compare argumentos, identifique evidências e explique o que o texto sugere além do que diz literalmente.");
  } else if (answers.reading) {
    recommendations.push("Depois de ler, resuma o texto em duas ou três frases e confira se o resumo preserva a ideia principal.");
  }

  if (["calculos_basicos", "fracoes"].includes(answers.math)) recommendations.push("Em matemática, pratique primeiro um exemplo guiado e depois resolva três exercícios do mesmo tipo, registrando cada etapa.");
  if (["porcentagem", "equacoes"].includes(answers.math)) recommendations.push("Em matemática, escreva cada transformação em uma linha e confira a resposta substituindo o resultado no enunciado.");
  if (["problemas_texto", "modelar_problemas"].includes(answers.math)) recommendations.push("Antes de calcular, reescreva o que o problema informa, o que pede e qual operação ou relação pode conectar esses dados.");
  if (answers.math === "funcoes") recommendations.push("Ao estudar funções, relacione a expressão algébrica, uma tabela de valores e o gráfico da mesma função.");

  if (answers.study === "tento_de_novo") recommendations.push("Continue registrando os erros mais comuns; eles ajudam a escolher o que revisar.");
  if (answers.study === "procuro_exemplo") recommendations.push("Compare o exemplo resolvido com sua tentativa e explique por que cada passo foi usado.");
  if (answers.study === "preciso_de_pausa") recommendations.push("Divida a atividade em uma etapa pequena, faça uma pausa curta se precisar e peça uma pista antes da resposta completa.");

  if (answers.examStrategy === "reviso_teoria") recommendations.push("Para provas, alterne revisão curta da teoria com questões; isso ajuda a conferir se você consegue aplicar o conteúdo.");
  if (answers.examStrategy === "resolvo_questoes") recommendations.push("Depois de praticar questões, classifique cada erro por assunto e revise o conceito ligado a ele.");
  if (answers.examStrategy === "preciso_plano_revisao") recommendations.push("Monte um plano de revisão com poucos tópicos por dia e reserve tempo para retomar os erros.");

  if (answers.recovery === "volto_aula") recommendations.push("Para recuperar conteúdo, retome a explicação em etapas e registre as dúvidas que aparecerem.");
  if (answers.recovery === "procuro_resumo") recommendations.push("Use um resumo como mapa inicial e confirme o entendimento com exercícios curtos.");
  if (answers.recovery === "nao_sei_por_onde_comecar") recommendations.push("Comece identificando o assunto e a primeira dúvida específica; depois avance do pré-requisito mais simples.");

  if (answers.routine === "tenho_horario") recommendations.push("Mantenha seus horários e reserve alguns minutos no fim da sessão para revisar o que aprendeu.");
  if (answers.routine === "estudo_quando_da") recommendations.push("Experimente blocos curtos e realistas em dias definidos, sem tentar compensar tudo de uma vez.");
  if (answers.routine === "preciso_rotina") recommendations.push("Comece com três sessões curtas por semana e ajuste a rotina conforme sua disponibilidade real.");

  if (answers.curiosity === "explicacao_curta") recommendations.push("Comece com uma explicação objetiva e, em seguida, tente explicar o conceito com suas próprias palavras.");
  if (answers.curiosity === "exemplo_pratico") recommendations.push("Conecte o assunto a um exemplo cotidiano e identifique qual conceito está sendo usado.");
  if (answers.curiosity === "desafio_interativo") recommendations.push("Tente um desafio antes de consultar a explicação; depois compare sua estratégia com a solução.");

  return recommendations;
}
