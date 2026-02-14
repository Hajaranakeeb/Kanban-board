import React from "react";
import Column from "./Column";
import { Task } from "../types";

interface ColumnData {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

interface BoardProps {
  columns: ColumnData[];
}

const Board: React.FC<BoardProps> = ({ columns }) => {
  // Dummy handlers to satisfy required props
  const handleAddCard = () => {};
  const handleDeleteCard = () => {};
  const handleUpdateCard = () => {};
  const handleUpdateColumn = () => {};

  return (
    <div className="flex space-x-4">
      {columns.map((column) => (
        <Column
          key={column.id}
          id={column.id}
          title={column.title}
          tasks={column.tasks}
          color={column.color || "#F59E0B"}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
          onUpdateCard={handleUpdateCard}
          onUpdateColumn={handleUpdateColumn}
        />
      ))}
    </div>
  );
};

export default Board;