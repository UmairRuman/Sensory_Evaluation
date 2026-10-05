import { GoogleGenerativeAI } from "@google/generative-ai";

export interface RemarkSummaryGroup {
  label: string; // sample name, or "Sample — Section" for the overall/cross-section summary
  remarks: string[];
}

export interface RemarkSummaryInput {
  scope: string; // e.g. "A. Appearance" or "Overall"
  productName: string;
  groups: RemarkSummaryGroup[];
}

export interface RemarkSummaryOutput {
  summaryText: string;
  tone: "POSITIVE" | "MIXED" | "NEGATIVE";
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Gemini request timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

const TONE_WORDS = ["POSITIVE", "MIXED", "NEGATIVE"] as const;

// Returns null whenever an AI summary can't be produced right now — no key configured yet,
// the call failed, or it timed out — so callers can show a graceful "unavailable" state
// instead of failing the page. This is what lets the feature ship before GEMINI_API_KEY exists.
export async function generateRemarksSummary(input: RemarkSummaryInput): Promise<RemarkSummaryOutput | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const totalRemarks = input.groups.reduce((n, g) => n + g.remarks.length, 0);
  if (totalRemarks === 0) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const remarksBlock = input.groups
      .filter((g) => g.remarks.length > 0)
      .map((g) => `${g.label}:\n${g.remarks.map((r) => `- ${r}`).join("\n")}`)
      .join("\n\n");

    const prompt = `You are summarizing free-text remarks panelists wrote during a blind sensory evaluation of "${input.productName}" (${input.scope}).

Remarks:
${remarksBlock}

Write a concise, neutral 2-4 sentence summary of the themes in these remarks, comparing samples where the remarks support it. Rules:
- Never mention or imply how many panelists wrote remarks, and never mention any panelist's name or identity.
- Do not invent feedback that isn't supported by the remarks above.
- Be specific about which sample a theme relates to, when more than one sample is present.
- After the summary, on its own final line, output exactly one word: POSITIVE, MIXED, or NEGATIVE, reflecting the overall tone.`;

    const result = await withTimeout(model.generateContent(prompt), 15000);
    const text = result.response.text().trim();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const toneLine = (lines[lines.length - 1] ?? "").toUpperCase();
    const tone = TONE_WORDS.find((t) => toneLine.includes(t)) ?? "MIXED";
    const summaryText = (toneLine && TONE_WORDS.some((t) => toneLine.includes(t)) ? lines.slice(0, -1) : lines).join(" ").trim();

    if (!summaryText) return null;
    return { summaryText, tone };
  } catch {
    return null;
  }
}
