import { antecedentesSource } from "./antecedentes";
import { jusbrasilSource } from "./jusbrasil";
import { processosSource } from "./processos";
import { sinespSource } from "./sinesp";
import type { PublicDataSource } from "./types";

export const publicDataSources: PublicDataSource[] = [
  sinespSource,
  processosSource,
  jusbrasilSource,
  antecedentesSource,
];

export type { SearchInput, SourceFinding, SourceResult } from "./types";
