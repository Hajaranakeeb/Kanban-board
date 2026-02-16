// shared types for boards
export type Task = {
  id: string;
  content: string;
  column: string; // REQUIRED
  color?: string;
};

export type ColumnType = {
  id: string;
  title: string;
  color: string;
};