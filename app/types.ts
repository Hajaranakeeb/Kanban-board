export type Task = {
  id: string;
  content: string;
  column: string; // matches your original Column.tsx
};

export type ColumnType = {
  id: string;
  title: string;
  color: string;
};