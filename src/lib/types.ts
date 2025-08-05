
export interface Celebrity {
  type: 'celebrity';
  id: string;
  name: string | { en: string; ru: string };
  imageUrl: string;
  partner?: string | { en: string; ru: string };
  exes?: (string | { en: string; ru: string })[];
  revealed?: boolean;
}

export interface EmptyCell {
  type: 'empty';
  id: string;
}

export type Cell = (Omit<Celebrity, 'name' | 'partner' | 'exes'> & {
    name: string;
    partner?: string;
    exes?: string[];
    revealed: boolean;
}) | EmptyCell;

    