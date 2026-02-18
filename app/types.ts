export type Task = {
  id: string;
  content: string;
  column: string;
  color?: string;
  user?: string; // <-- add this
};

export type ColumnType = {
  id: string;
  title: string;
  color: string;
  user?: string; // <-- add this
};
