import React from "react";
import Column from "./Column";
import { Task } from "../types";

interface ColumnData {
  id: string;
  title: string;
  tasks: Task[];
  color?: string; // optional in data
}

interface BoardProps {
  columns: ColumnData[];
}

const Board: React.FC<BoardProps> = ({ columns }) => {
  return (
    <div className="flex space-x-4">
      {columns.map((column) => (
        <Column
          key={column.id}
          id={column.id}
          title={column.title}
          tasks={column.tasks}
          color={column.color || "#F59E0B"} // default if not provided
        />
      ))}
    </div>
  );
};

export default Board;