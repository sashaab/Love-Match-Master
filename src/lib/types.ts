export interface Celebrity {
  type: 'celebrity';
  id: string;
  name: string;
  imageUrl: string;
  partner?: string;
  exes?: string[];
}

export interface EmptyCell {
  type: 'empty';
  id: string;
}

export type Cell = Celebrity | EmptyCell;
