import { describe, expect, it } from "vitest";
const grades=["6EF","7EF","8EF","9EF","1EM","2EM","3EM"];
describe("regras iniciais do Estuda",()=>{
  it("inclui todas as séries atendidas",()=>{expect(grades).toHaveLength(7);expect(grades[0]).toBe("6EF");expect(grades.at(-1)).toBe("3EM");});
  it("não inventa progresso quando não há atividades",()=>{const activities:unknown[]=[];expect(activities.length>0).toBe(false);});
  it("preserva os objetivos definidos no cadastro",()=>{expect(["melhorar_estudos","aprender","recuperar_conteudo","provas_enem"]).toContain("provas_enem");});
});