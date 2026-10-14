import { describe, expect, it } from "vitest";
import { curriculum, schoolYears } from "../shared/curriculum";

describe("currículo inicial por série", () => {
  it("inclui todas as sete séries solicitadas", () => {
    expect(schoolYears).toEqual(["6EF", "7EF", "8EF", "9EF", "1EM", "2EM", "3EM"]);
    expect(Object.keys(curriculum)).toHaveLength(7);
  });

  it("fornece disciplinas e tópicos com chaves únicas para cada série", () => {
    for (const grade of schoolYears) {
      expect(curriculum[grade].length).toBeGreaterThanOrEqual(5);
      const keys = curriculum[grade].flatMap(subject => subject.topics.map(topic => topic.key));
      expect(keys.length).toBeGreaterThan(0);
      expect(new Set(keys).size).toBe(keys.length);
      expect(curriculum[grade].every(subject => subject.topics.every(topic => topic.title && topic.objective))).toBe(true);
    }
  });

  it("não contém conteúdo vazio para as séries do Ensino Médio", () => {
    for (const grade of ["1EM", "2EM", "3EM"] as const) {
      expect(curriculum[grade].every(subject => subject.topics.length > 0)).toBe(true);
    }
  });
});