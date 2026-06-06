export type SearchInput = {
  subjectName: string;
  subjectCpf?: string | null;
  birthDate?: string | null;
  motherName?: string | null;
};

export type SourceFinding = {
  source: string;
  category: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  url?: string;
  date?: string;
};

export type SourceResult = {
  source: string;
  status: "success" | "unavailable" | "error";
  findings: SourceFinding[];
  message?: string;
};

export interface PublicDataSource {
  id: string;
  name: string;
  description: string;
  search(input: SearchInput): Promise<SourceResult>;
}
