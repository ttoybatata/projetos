import { describe, expect, it } from "vitest";
import { getDiagnosticQuestions, getDiagnosticRecommendations } from "../shared/diagnostic";

describe("diagnóstico adaptativo", () => {
  it("adapta o tema de matemática à série", () => {
    const fundamental = getDiagnosticQuestions("6EF", "intermediaria");
    const ensinoMedio = getDiagnosticQuestions("3EM", "intermediaria");
    expect(fundamental.find(question => question.key === "math")?.label).toContain("praticar primeiro");
    expect(ensinoMedio.find(question => question.key === "math")?.label).toContain("ENEM");
    expect(fundamental.find(question => question.key === "math")?.options.map(option => option.value)).toContain("fracoes");
    expect(ensinoMedio.find(question => question.key === "math")?.options.map(option => option.value)).toContain("funcoes");
  });

  it("adapta leitura à fluência informada no cadastro", () => {
    const needsPractice = getDiagnosticQuestions("7EF", "preciso_praticar");
    const fluent = getDiagnosticQuestions("7EF", "fluente");
    expect(needsPractice.find(question => question.key === "reading")?.options.map(option => option.value)).toContain("leio_com_ajuda");
    expect(fluent.find(question => question.key === "reading")?.options.map(option => option.value)).toContain("analiso_argumentos");
  });

  it("adiciona perguntas alinhadas aos objetivos escolhidos no cadastro", () => {
    const questions = getDiagnosticQuestions("3EM", "fluente", ["provas_enem", "recuperar_conteudo"]);
    expect(questions.map(question => question.key)).toContain("examStrategy");
    expect(questions.map(question => question.key)).toContain("recovery");
    expect(questions.map(question => question.key)).not.toContain("routine");
  });

  it("gera sugestões apenas a partir das respostas fornecidas", () => {
    const recommendations = getDiagnosticRecommendations({
      confidence: "aprendo_com_exemplos",
      reading: "dificuldade_inferir",
      math: "problemas_texto",
      study: "procuro_exemplo"
    });
    expect(recommendations).toHaveLength(4);
    expect(recommendations.join(" ")).toContain("exemplo resolvido");
    expect(recommendations.join(" ")).toContain("ideia principal");
    expect(recommendations.join(" ")).toContain("problema");
    expect(getDiagnosticRecommendations({})).toEqual([]);
  });
});
