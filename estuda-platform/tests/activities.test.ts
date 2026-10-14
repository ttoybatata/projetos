import { describe, expect, it } from "vitest";
import { quizzes } from "../shared/activities.js";
import { curriculum, schoolYears } from "../shared/curriculum.js";

describe("banco inicial de quizzes", () => {
  it("tem três questões válidas e gabarito interno para cada quiz publicado", () => {
    const topicKeys = new Set(schoolYears.flatMap(grade => curriculum[grade].flatMap(subject => subject.topics.map(topic => topic.key))));
    expect(Object.keys(quizzes).length).toBeGreaterThan(0);
    for (const [key, quiz] of Object.entries(quizzes)) {
      expect(topicKeys.has(key)).toBe(true);
      expect(quiz.activityKey).toBe(key);
      expect(quiz.questions).toHaveLength(3);
      expect(new Set(quiz.questions.map(question => question.id)).size).toBe(quiz.questions.length);
      for (const question of quiz.questions) {
        expect(question.prompt.trim().length).toBeGreaterThan(5);
        expect(question.choices.length).toBeGreaterThan(1);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(question.choices.length);
        expect(question.explanation.trim().length).toBeGreaterThan(5);
      }
    }
  });

  it("limita os quizzes a tópicos com correspondência curricular na série certa", () => {
    expect(curriculum["6EF"].flatMap(subject => subject.topics).some(topic => topic.key === "matematica-naturais")).toBe(true);
    expect(curriculum["7EF"].flatMap(subject => subject.topics).some(topic => topic.key === "matematica-naturais")).toBe(false);
  });
});
