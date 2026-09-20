export type TraceStep = {
  label: string;
  detail?: string;
};

export type ToolOutput = {
  output: string;
  steps?: TraceStep[];
  note?: string;
  error?: string;
};
