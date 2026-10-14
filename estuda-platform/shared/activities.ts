export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};
export type QuizDefinition = { activityKey: string; questions: QuizQuestion[] };

// Initial, explicitly scoped question bank. Correct answers are stripped by the API before delivery.
export const quizzes: Record<string, QuizDefinition> = {
  "matematica-naturais": {
    activityKey: "matematica-naturais",
    questions: [
      { id: "q1", prompt: "Uma biblioteca tinha 128 livros e recebeu mais 47. Quantos livros tem agora?", choices: ["165", "175", "185", "171"], correctIndex: 1, explanation: "Some 128 + 47: 128 + 40 = 168 e +7 = 175." },
      { id: "q2", prompt: "Uma professora distribuiu 36 lápis igualmente entre 4 grupos. Quantos lápis cada grupo recebeu?", choices: ["8", "9", "10", "12"], correctIndex: 1, explanation: "36 ÷ 4 = 9, porque 4 × 9 = 36." },
      { id: "q3", prompt: "Qual expressão representa 6 grupos com 7 cadernos em cada grupo?", choices: ["6 + 7", "7 − 6", "6 × 7", "7 ÷ 6"], correctIndex: 2, explanation: "Grupos iguais podem ser representados por multiplicação: 6 × 7 = 42." }
    ]
  },
  "matematica-inteiros": {
    activityKey: "matematica-inteiros",
    questions: [
      { id: "q1", prompt: "A temperatura estava em −3 °C e subiu 8 °C. Qual é a temperatura final?", choices: ["−11 °C", "−5 °C", "5 °C", "11 °C"], correctIndex: 2, explanation: "−3 + 8 = 5. Subir 8 graus significa somar 8." },
      { id: "q2", prompt: "Quanto vale (−4) × 3?", choices: ["−12", "−7", "7", "12"], correctIndex: 0, explanation: "Negativo vezes positivo resulta em negativo; 4 × 3 = 12, então −12." },
      { id: "q3", prompt: "Qual número é maior?", choices: ["−8", "−2", "São iguais", "Não é possível comparar"], correctIndex: 1, explanation: "Entre números negativos, o que está mais perto de zero é maior: −2 > −8." }
    ]
  },
  "matematica-potencias": {
    activityKey: "matematica-potencias",
    questions: [
      { id: "q1", prompt: "Quanto vale 2³?", choices: ["6", "8", "9", "12"], correctIndex: 1, explanation: "2³ = 2 × 2 × 2 = 8." },
      { id: "q2", prompt: "Qual é a raiz quadrada principal de 81?", choices: ["8", "9", "18", "40,5"], correctIndex: 1, explanation: "A raiz quadrada principal de 81 é 9, pois 9 × 9 = 81." },
      { id: "q3", prompt: "Quanto vale 10²?", choices: ["20", "100", "1.000", "12"], correctIndex: 1, explanation: "10² significa 10 × 10 = 100." }
    ]
  },
  "matematica-reais": {
    activityKey: "matematica-reais",
    questions: [
      { id: "q1", prompt: "Qual valor é equivalente a √49?", choices: ["6", "7", "14", "24,5"], correctIndex: 1, explanation: "√49 = 7, pois 7² = 49." },
      { id: "q2", prompt: "Qual número é irracional?", choices: ["0,5", "−3", "√2", "1,25"], correctIndex: 2, explanation: "√2 é irracional: sua representação decimal é infinita e não periódica." },
      { id: "q3", prompt: "Quanto vale 3² + 4?", choices: ["13", "14", "25", "49"], correctIndex: 0, explanation: "Calcule a potência primeiro: 3² = 9; depois 9 + 4 = 13." }
    ]
  },
  "matematica-funcoes": {
    activityKey: "matematica-funcoes",
    questions: [
      { id: "q1", prompt: "Na função f(x) = 2x + 3, quanto vale f(4)?", choices: ["8", "11", "14", "20"], correctIndex: 1, explanation: "Substitua x por 4: f(4) = 2 × 4 + 3 = 11." },
      { id: "q2", prompt: "Qual é a raiz da função f(x) = x − 5?", choices: ["−5", "0", "1", "5"], correctIndex: 3, explanation: "A raiz ocorre quando f(x) = 0: x − 5 = 0, então x = 5." },
      { id: "q3", prompt: "Em y = 3x + 2, qual é o coeficiente angular?", choices: ["2", "3", "5", "x"], correctIndex: 1, explanation: "Na forma y = ax + b, o coeficiente angular é a; aqui, a = 3." }
    ]
  },
  "matematica-exponencial": {
    activityKey: "matematica-exponencial",
    questions: [
      { id: "q1", prompt: "Quanto vale 2⁴?", choices: ["8", "12", "16", "24"], correctIndex: 2, explanation: "2⁴ = 2 × 2 × 2 × 2 = 16." },
      { id: "q2", prompt: "Se 10ˣ = 100, qual é x?", choices: ["1", "2", "10", "100"], correctIndex: 1, explanation: "Como 10² = 100, temos x = 2." },
      { id: "q3", prompt: "Uma população dobra de 50 para 100 e dobra novamente. Qual é o total?", choices: ["100", "150", "200", "250"], correctIndex: 2, explanation: "Dobrando 50, chega-se a 100; dobrando novamente, chega-se a 200." }
    ]
  },
  "matematica-financeira": {
    activityKey: "matematica-financeira",
    questions: [
      { id: "q1", prompt: "Quanto é 20% de R$ 150?", choices: ["R$ 15", "R$ 20", "R$ 30", "R$ 50"], correctIndex: 2, explanation: "20% = 0,2; 0,2 × 150 = 30." },
      { id: "q2", prompt: "Um produto de R$ 80 recebeu desconto de 25%. Qual é o preço final?", choices: ["R$ 20", "R$ 55", "R$ 60", "R$ 75"], correctIndex: 2, explanation: "25% de 80 é 20; 80 − 20 = R$ 60." },
      { id: "q3", prompt: "R$ 200 aplicados a juros simples de 5% por um período rendem quanto de juros?", choices: ["R$ 5", "R$ 10", "R$ 20", "R$ 50"], correctIndex: 1, explanation: "J = C × i = 200 × 0,05 = R$ 10 no período informado." }
    ]
  }
};
