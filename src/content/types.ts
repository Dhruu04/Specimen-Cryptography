export type LessonReference = {
  title: string;
  url: string;
  source: string; // e.g., "NIST FIPS", "IETF RFC", "IACR ePrint", "Stanford", "Wikipedia", "Cryptopals"
  description: string;
  type: "standard" | "paper" | "tutorial" | "book" | "spec" | "rfc";
};

export type WorkedExample = {
  title: string;
  steps: { label: string; detail: string }[];
  outcome: string;
};

export type Lesson = {
  id: string;
  trackId: string;
  title: string;
  subtitle: string;
  formula?: { expr: string; badge?: string; note: string };
  body: string[];
  keyPoints: string[];
  pitfalls?: string[];
  workedExample?: WorkedExample;
  references?: LessonReference[];
  toolId?: string;
  glossary?: { term: string; def: string }[];
};

export type Track = {
  id: string;
  name: string;
  shortName: string;
  blurb: string;
  intro: string;
};

