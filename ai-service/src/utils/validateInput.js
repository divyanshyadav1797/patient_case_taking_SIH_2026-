export function validateAnswer(answer) {
  if (typeof answer !== "string") {
    throw new Error("Answer must be text.");
  }

  const cleaned = answer.trim();

  if (!cleaned) {
    throw new Error("Answer cannot be empty.");
  }

  if (cleaned.length > 2000) {
    throw new Error("Answer is too long.");
  }

  return cleaned;
}