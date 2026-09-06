export type MockEvaluation = {
  evaluation: "correct" | "partially_correct" | "incorrect";
  isCorrect: boolean;
  feedback: string;
  nextAction: "COMPLETE" | "RETRY" | "SIMPLIFY";
};

type ExplanationTemplate = {
  matches: string[];
  explanation: string;
  concepts: string[][];
};

const explanationTemplates: ExplanationTemplate[] = [
  {
    matches: ["photosynthesis"],
    explanation:
      "Photosynthesis is the process by which green plants use sunlight, carbon dioxide and water to produce glucose and oxygen.",
    concepts: [
      ["sunlight", "sun light"],
      ["plant", "plants"],
      ["glucose", "food"],
      ["carbon dioxide"],
      ["water"],
    ],
  },
];

export function generateMockExplanation(question: string): string {
  const normalizedQuestion = question.toLowerCase();
  const template = explanationTemplates.find((candidate) =>
    candidate.matches.some((match) => normalizedQuestion.includes(match)),
  );

  if (template) {
    return template.explanation;
  }

  return `This is a mock explanation for "${question}". A future learning service can replace this response with a generated explanation while keeping the API contract unchanged.`;
}

export function evaluateMockResponse(
  question: string,
  studentResponse: string,
): MockEvaluation {
  const normalizedQuestion = question.toLowerCase();
  const normalizedResponse = studentResponse.toLowerCase();
  const template = explanationTemplates.find((candidate) =>
    candidate.matches.some((match) => normalizedQuestion.includes(match)),
  );

  if (template) {
    const matchedConcepts = template.concepts.filter((concept) =>
      concept.some((term) => normalizedResponse.includes(term)),
    ).length;

    if (matchedConcepts >= 3) {
      return {
        evaluation: "correct",
        isCorrect: true,
        feedback:
          "Correct. You connected the key inputs and outputs of photosynthesis.",
        nextAction: "COMPLETE",
      };
    }

    if (matchedConcepts > 0) {
      return {
        evaluation: "partially_correct",
        isCorrect: false,
        feedback:
          "You have part of the idea. Try adding more of the key ingredients or products.",
        nextAction: "SIMPLIFY",
      };
    }
  }

  const wordCount = normalizedResponse.match(/[a-z]+/g)?.length ?? 0;
  if (wordCount >= 6) {
    return {
      evaluation: "partially_correct",
      isCorrect: false,
      feedback:
        "There is a useful start here. Revisit the explanation and connect it to the question more directly.",
      nextAction: "SIMPLIFY",
    };
  }

  return {
    evaluation: "incorrect",
    isCorrect: false,
    feedback:
      "Not quite yet. Review the explanation and try the concept check again.",
    nextAction: "RETRY",
  };
}